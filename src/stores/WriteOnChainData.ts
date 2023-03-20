import { ref, watch } from "vue";
import { defineStore } from "pinia";
import { type InnerTransaction, type MosaicInfo, Address } from "symbol-sdk";
import { useChainStore } from "./chain";
import { useSettingsStore } from "./settings";
import { useSSSStore } from "./sss";
import { FetchState } from "@/models/enums/FetchState";
import { WriteProgress } from "@/models/enums/WriteProgress";
import { getAccountInfo, getMultisigInfo } from "@/apis/account";
import { openTxListener } from "@/apis/listner";
import { getMosaicInfo, isValidMosaicId } from "@/apis/mosaic";
import {
  announceTx,
  createTxHashLock,
  createTxTransferPlainMessage,
  createTxAggregateComplete,
  createTxAggregateBonded,
} from "@/apis/transaction";
import CONSTS from "@/utils/consts";
import { encryptHeader, getHash } from "@/utils/crypto";
import { createHeader } from "@/utils/eternalbookprotocol";
import { getTxFee } from "@/apis/network";

/**
 * オンチェーンデータ書き込みストア
 */
export const useWriteOnChainDataStore = defineStore("WriteOnChainData", () => {
  // Other Stores
  const settingsStore = useSettingsStore();
  const chainStore = useChainStore();
  const sssStore = useSSSStore();

  /** タイトル */
  const title = ref("");
  /** メッセージ */
  const message = ref("");
  /** 紐付けるモザイクID */
  const relatedMosaicIdStr = ref("");
  /** 紐付けるモザイク情報 */
  const relatedMosaicInfo = ref<MosaicInfo | undefined>(undefined);
  /** 紐付けるモザイク情報取得状況 */
  const infoFetchState = ref<FetchState>(FetchState.Undefined);
  /** 紐付けるBase64データ */
  const dataBase64 = ref("");
  /** 書き込み状況 */
  const progress = ref<WriteProgress>(WriteProgress.Standby);
  /** 処理済サイズ */
  const processedSize = ref(0);
  /** 直前のTxハッシュ */
  const prevTxHash = ref("");

  // Watch
  watch(
    relatedMosaicIdStr,
    (): void => {
      const logTitle = "write data store watch:";
      settingsStore.logger.debug(logTitle, "start", relatedMosaicIdStr.value);

      // 有効なモザイクIDかチェック
      if (!isValidMosaicId(relatedMosaicIdStr.value)) {
        infoFetchState.value =
          relatedMosaicIdStr.value.length === 0
            ? FetchState.Undefined
            : FetchState.Failed;
        relatedMosaicInfo.value = undefined;
        return;
      }

      // モザイク情報の取得
      getMosaicInfo(relatedMosaicIdStr.value)
        .then((value): void => {
          settingsStore.logger.debug(
            logTitle,
            "get mosaic info complete.",
            value
          );
          relatedMosaicInfo.value = value;
          infoFetchState.value = FetchState.Complete;
        })
        .catch((error) => {
          settingsStore.logger.debug(
            logTitle,
            "get account info failed.",
            error
          );
          relatedMosaicInfo.value = undefined;
          infoFetchState.value = FetchState.Failed;
        });
      settingsStore.logger.debug(logTitle, "end");
    },
    { immediate: true }
  );

  /**
   * オンチェーンデータ書き込み
   * @returns なし
   */
  async function writeOnChain(): Promise<void> {
    const logTitle = "write data:";
    settingsStore.logger.debug(logTitle, "start");

    // 書き込み状況のチェック
    if (
      progress.value !== WriteProgress.Standby &&
      progress.value !== WriteProgress.Complete &&
      progress.value !== WriteProgress.Failed
    ) {
      settingsStore.logger.error(logTitle, "other processing.");
      return;
    }
    progress.value = WriteProgress.Preprocess;
    processedSize.value = 0;
    prevTxHash.value = "";

    // データ設定チェック
    if (dataBase64.value.length === 0) {
      settingsStore.logger.error(logTitle, "data no setting.");
      progress.value = WriteProgress.Failed;
      return;
    }
    // TODO: モザイク情報取得中か確認して待つ必要あり
    if (typeof relatedMosaicInfo.value === "undefined") {
      settingsStore.logger.error(logTitle, "mosaic info undefined.");
      progress.value = WriteProgress.Failed;
      return;
    }

    // モザイク所有アカウントがマルチシグアカウントか確認
    // TODO: モザイク所有者のみ書き込み可能を制限とし、別のアカウントでの書き込みは別途検討
    const multisigInfo = await getMultisigInfo(
      relatedMosaicInfo.value.ownerAddress.plain()
    );
    if (typeof multisigInfo === "undefined") {
      settingsStore.logger.error(logTitle, "get multisig info failed.");
      progress.value = WriteProgress.Failed;
      return;
    }
    const isBonded = multisigInfo.isMultisig();
    writeOnChainOneAggregate(isBonded);
    settingsStore.logger.debug(logTitle, "end");
  }

  /**
   * アグリゲートTx1つ分のオンチェーンデータ書き込み
   * @returns なし
   */
  async function writeOnChainOneAggregate(isBonded: boolean): Promise<void> {
    const logTitle = "write data:";
    settingsStore.logger.debug(logTitle, "start");
    progress.value = WriteProgress.Preprocess;

    // 書き込み済データサイズチェック
    settingsStore.logger.debug(logTitle, "processed size", processedSize.value);
    if (processedSize.value >= dataBase64.value.length) {
      settingsStore.logger.debug(logTitle, "all data proceeded.");
      progress.value = WriteProgress.Complete;
      return;
    }

    // 最終データか判定
    const isLastData =
      processedSize.value +
        CONSTS.TX_DATASIZE_PER_TRANSFER * CONSTS.TX_DATA_TX_NUM >=
      dataBase64.value.length;

    // モザイク設定チェック
    const mosaicInfo = relatedMosaicInfo.value as MosaicInfo;
    if (typeof mosaicInfo === "undefined") {
      settingsStore.logger.error(logTitle, "mosaic info undefined.");
      progress.value = WriteProgress.Failed;
      return;
    }

    // アカウント情報の取得
    const accountInfo = await getAccountInfo(mosaicInfo.ownerAddress.plain());
    if (typeof accountInfo === "undefined") {
      settingsStore.logger.error(logTitle, "account info invalid.");
      progress.value = WriteProgress.Failed;
      return;
    }

    // ヘッダ情報の作成と暗号化
    const header = createHeader(
      mosaicInfo.id.toHex(),
      mosaicInfo.ownerAddress.plain(),
      title.value,
      message.value,
      processedSize.value === 0 ? undefined : prevTxHash.value,
      isLastData ? getHash(dataBase64.value) : undefined
    );
    const encodedHeader = encryptHeader(header, mosaicInfo.id.toHex());
    if (typeof encodedHeader === "undefined") {
      settingsStore.logger.error(logTitle, "create crypto header failed.");
      progress.value = WriteProgress.Failed;
      return;
    }

    // ヘッダ情報Txを作成してTxリストに追加
    const txList: Array<InnerTransaction> = [];
    const txHeader = createTxTransferPlainMessage(accountInfo, encodedHeader);
    txList.push(txHeader.toAggregate(accountInfo.publicAccount));

    // データTxをTxリストに追加
    for (; txList.length < CONSTS.TX_AGGREGATE_INNER_NUM; ) {
      // 全てのデータを処理済の場合は終了
      if (processedSize.value >= dataBase64.value.length) {
        break;
      }
      // 未処理のデータから1Txに格納できる分だけデータを切り出す
      const sendData = dataBase64.value.substring(
        processedSize.value,
        processedSize.value + CONSTS.TX_DATASIZE_PER_TRANSFER
      );
      // データTxを作成してTxリストに追加
      const txData = createTxTransferPlainMessage(accountInfo, sendData);
      txList.push(txData.toAggregate(accountInfo.publicAccount));
      // 処理済みデータサイズの更新
      processedSize.value += sendData.length;
    }

    // オンチェーンデータTxのアグリゲートTx作成
    const aggTx = isBonded
      ? createTxAggregateBonded(txList, await getTxFee(chainStore.feeKind))
      : createTxAggregateComplete(txList, await getTxFee(chainStore.feeKind));
    // 署名
    if (!settingsStore.useSSS && typeof settingsStore.account === "undefined") {
      settingsStore.logger.error(logTitle, "account invalid.");
      progress.value = WriteProgress.Failed;
      return;
    }
    // FIXME: SSS署名者チェックは必要？（署名者<>所有者、署名者がマルチシグ、所有者がマルチシグで署名者が連署者じゃない、etc..）
    progress.value = WriteProgress.TxSigning;
    const signedAggTx = settingsStore.useSSS
      ? await sssStore.requestTxSign(aggTx)
      : settingsStore.account?.sign(aggTx, chainStore.generationHash);
    if (typeof signedAggTx === "undefined") {
      settingsStore.logger.error(logTitle, "sss sign failed.");
      progress.value = WriteProgress.Failed;
      return;
    }

    // オンチェーンデータTxリスナー設定
    const dataTxListener = await openTxListener(
      "write data",
      mosaicInfo.ownerAddress,
      signedAggTx.hash,
      () => {
        progress.value = WriteProgress.TxWaitCosign;
      },
      () => {
        progress.value = WriteProgress.TxUnconfirmed;
      },
      async () => {
        // 未処理データが存在する場合はデータ書き込みを再帰実行
        if (processedSize.value < dataBase64.value.length) {
          prevTxHash.value = signedAggTx.hash;
          writeOnChainOneAggregate(isBonded);
        } else {
          prevTxHash.value = "";
          progress.value = WriteProgress.Complete;
        }
      },
      () => {
        progress.value = WriteProgress.Failed;
      }
    );
    if (typeof dataTxListener === "undefined") {
      settingsStore.logger.error(
        logTitle,
        "open create mosaic tx listener failed."
      );
      progress.value = WriteProgress.Failed;
      return;
    }

    // アグリゲートコンプリートTxの場合はアナウンスして終了
    if (!isBonded) {
      progress.value = WriteProgress.TxAnnounced;
      const response = await announceTx(signedAggTx);
      settingsStore.logger.debug(logTitle, "aggregate complete tx announced.", [
        signedAggTx,
        response,
      ]);
      settingsStore.logger.debug(logTitle, "aggregate complete end");
      return;
    }
    // アグリゲートボンデッドの場合はハッシュロックが必要なため処理継続

    // ハッシュロックTx作成
    const hashLockTx = createTxHashLock(
      signedAggTx,
      await getTxFee(chainStore.feeKind)
    );
    // 署名
    // FIXME: SSS署名者チェックは必要？（署名者<>所有者、署名者がマルチシグ、所有者がマルチシグで署名者が連署者じゃない、etc..）
    progress.value = WriteProgress.LockSigning;
    const signedHashLockTx = settingsStore.useSSS
      ? await sssStore.requestTxSign(hashLockTx)
      : settingsStore.account?.sign(hashLockTx, chainStore.generationHash);
    if (typeof signedHashLockTx === "undefined") {
      settingsStore.logger.error(logTitle, "sss sign failed.");
      progress.value = WriteProgress.Failed;
      return;
    }
    // HACK: SSS から返却された SignedTransaction だと getSignerAddress() で取得されるアドレスが不正
    const signerAddress = Address.createFromPublicKey(
      signedHashLockTx.signerPublicKey,
      chainStore.networkType
    );

    // ハッシュロックTxリスナー設定
    const hashlockTxlistener = await openTxListener(
      "hash lock",
      signerAddress,
      signedHashLockTx.hash,
      undefined,
      () => {
        progress.value = WriteProgress.LockUnconfirmed;
      },
      async () => {
        // アグリゲートTxをアナウンス
        progress.value = WriteProgress.TxAnnounced;
        const response = await announceTx(signedAggTx);
        settingsStore.logger.debug(logTitle, "aggregate bonded tx announced.", [
          signedAggTx,
          response,
        ]);
      },
      () => {
        progress.value = WriteProgress.Failed;
      }
    );
    if (typeof hashlockTxlistener === "undefined") {
      settingsStore.logger.error(
        logTitle,
        "open hash lock tx listener failed."
      );
      progress.value = WriteProgress.Failed;
      return;
    }

    // Txアナウンス
    progress.value = WriteProgress.LockAnnounced;
    const response = await announceTx(signedHashLockTx);
    settingsStore.logger.debug(logTitle, "hashlock tx announced.", [
      signedHashLockTx,
      response,
    ]);
    settingsStore.logger.debug(logTitle, "aggregate bonded end");
  }

  // Exports
  return {
    title,
    message,
    relatedMosaicIdStr,
    dataBase64,
    progress,
    processedSize,
    writeOnChain,
  };
});
