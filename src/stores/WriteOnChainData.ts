import { ref, watch } from "vue";
import { defineStore } from "pinia";
import {
  type InnerTransaction,
  type MosaicInfo,
  Listener,
  TransactionGroup,
  Address,
} from "symbol-sdk";
import { useEnvironmentStore } from "./environment";
import { useSSSStore } from "./sss";
import { getMosaicInfo, isValidMosaicId } from "@/apis/mosaic";
import {
  createTxHashLock,
  createTxTransferPlainMessage,
  createTxAggregateComplete,
  createTxAggregateBonded,
} from "@/apis/transaction";
import CONSTS from "@/utils/consts";
import { encryptHeader, getHash } from "@/utils/crypto";
import { createHeader } from "@/utils/eternalbookprotocol";
import { FetchState } from "@/models/enums/FetchState";
import { openTxListener } from "@/apis/listner";

/**
 * オンチェーンデータ書き込みストア
 */
export const useWriteOnChainDataStore = defineStore("WriteOnChainData", () => {
  // Other Stores
  const envStore = useEnvironmentStore();
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
  const state = ref<TransactionGroup | undefined>(undefined);
  /** 処理済サイズ */
  const processedSize = ref(0);
  /** 直前のTxハッシュ */
  const prevTxHash = ref("");

  // Watch
  watch(
    relatedMosaicIdStr,
    (): void => {
      const logTitle = "write data store watch:";
      envStore.logger.debug(logTitle, "start", relatedMosaicIdStr.value);

      // 有効なモザイクIDかチェック
      if (!isValidMosaicId(relatedMosaicIdStr.value)) {
        infoFetchState.value =
          relatedMosaicIdStr.value.length === 0
            ? FetchState.Undefined
            : FetchState.Invalid;
        relatedMosaicInfo.value = undefined;
        return;
      }

      // モザイク情報の取得
      getMosaicInfo(relatedMosaicIdStr.value)
        .then((value): void => {
          envStore.logger.debug(logTitle, "get mosaic info complete.", value);
          relatedMosaicInfo.value = value;
          infoFetchState.value = FetchState.Complete;
        })
        .catch((error) => {
          envStore.logger.debug(logTitle, "get account info failed.", error);
          relatedMosaicInfo.value = undefined;
          infoFetchState.value = FetchState.Invalid;
        });
      envStore.logger.debug(logTitle, "end");
    },
    { immediate: true }
  );

  /**
   * オンチェーンデータ書き込み
   * @returns なし
   */
  async function writeOnChain(): Promise<void> {
    const logTitle = "write data:";
    envStore.logger.debug(logTitle, "start");

    // 進捗情報のクリア
    state.value = undefined;
    processedSize.value = 0;
    prevTxHash.value = "";

    // データ設定チェック
    if (dataBase64.value.length === 0) {
      envStore.logger.error(logTitle, "data no setting.");
      return;
    }
    // TODO: モザイク情報取得中か確認して待つ必要あり
    if (typeof relatedMosaicInfo.value === "undefined") {
      envStore.logger.error(logTitle, "mosaic info undefined.");
      return;
    }

    // モザイク所有アカウントがマルチシグアカウントか確認
    // TODO: モザイク所有者のみ書き込み可能を制限とし、別のアカウントでの書き込みは別途検討
    if (typeof envStore.multisigRepo === "undefined") {
      envStore.logger.error(logTitle, "repository undefined.");
      return;
    }
    const multisigInfo = await envStore.multisigRepo
      .getMultisigAccountInfo(relatedMosaicInfo.value.ownerAddress as Address)
      .toPromise();
    if (typeof multisigInfo === "undefined") {
      envStore.logger.error(logTitle, "get multisig info failed.");
      return;
    }
    const isBonded = multisigInfo.isMultisig();
    writeOnChainOneAggregate(isBonded);
    envStore.logger.debug(logTitle, "end");
  }

  /**
   * アグリゲートTx1つ分のオンチェーンデータ書き込み
   * @returns なし
   */
  async function writeOnChainOneAggregate(isBonded: boolean): Promise<void> {
    const logTitle = "write data:";
    envStore.logger.debug(logTitle, "start");

    // 書き込み済データサイズチェック
    envStore.logger.debug(logTitle, "processed size", processedSize.value);
    if (processedSize.value >= dataBase64.value.length) {
      envStore.logger.debug(logTitle, "all data proceeded.");
      return;
    }

    // 最終データか判定
    const isLastData =
      processedSize.value +
        CONSTS.TX_DATASIZE_PER_TRANSFER * CONSTS.TX_DATA_TX_NUM <=
      dataBase64.value.length;

    // リポジトリチェック
    if (
      typeof envStore.accountRepo === "undefined" ||
      typeof envStore.namespaceRepo === "undefined" ||
      typeof envStore.txRepo === "undefined"
    ) {
      envStore.logger.error(logTitle, "repository undefined.");
      return;
    }
    // モザイク設定チェック
    const mosaicInfo = relatedMosaicInfo.value as MosaicInfo;
    if (typeof mosaicInfo === "undefined") {
      envStore.logger.error(logTitle, "mosaic info undefined.");
      return;
    }

    // アカウント情報の取得
    const accountInfo = await envStore.accountRepo
      .getAccountInfo(mosaicInfo.ownerAddress)
      .toPromise();
    if (typeof accountInfo === "undefined") {
      envStore.logger.error(logTitle, "account info invalid.");
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
      envStore.logger.error(logTitle, "create crypto header failed.");
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
      ? createTxAggregateBonded(txList)
      : createTxAggregateComplete(txList);
    // SSSによる署名
    // FIXME: SSS署名者チェックは必要？（署名者<>所有者、署名者がマルチシグ、所有者がマルチシグで署名者が連署者じゃない、etc..）
    const signedAggTx = await sssStore.requestTxSign(aggTx);
    if (typeof signedAggTx === "undefined") {
      envStore.logger.error(logTitle, "sss sign failed.");
      return;
    }

    // オンチェーンデータTxリスナー設定
    const dataTxListener = await openTxListener(
      "write data",
      mosaicInfo.ownerAddress,
      signedAggTx.hash,
      () => {
        state.value = TransactionGroup.Unconfirmed;
      },
      async () => {
        // 未処理データが存在する場合はデータ書き込みを再帰実行
        if (processedSize.value < dataBase64.value.length) {
          prevTxHash.value = signedAggTx.hash;
          writeOnChainOneAggregate(isBonded);
        } else {
          prevTxHash.value = "";
          state.value = TransactionGroup.Confirmed;
        }
      }
    );
    if (typeof dataTxListener === "undefined") {
      envStore.logger.error(logTitle, "open create mosaic tx listener failed.");
      return;
    }

    // アグリゲートコンプリートTxの場合はアナウンスして終了
    if (!isBonded) {
      await envStore.txRepo.announce(signedAggTx).toPromise();
      envStore.logger.debug(logTitle, "aggregate complete end");
      return;
    }
    // アグリゲートボンデッドの場合はハッシュロックが必要なため処理継続

    // ハッシュロックTx作成
    const hashLockTx = createTxHashLock(signedAggTx);
    // SSSによる署名
    // FIXME: SSS署名者チェックは必要？（署名者<>所有者、署名者がマルチシグ、所有者がマルチシグで署名者が連署者じゃない、etc..）
    const signedHashLockTx = await sssStore.requestTxSign(hashLockTx);
    if (typeof signedHashLockTx === "undefined") {
      envStore.logger.error(logTitle, "sss sign failed.");
      return;
    }
    // HACK: SSS から返却された SignedTransaction だと getSignerAddress() で取得されるアドレスが不正
    const signerAddress = Address.createFromPublicKey(
      signedHashLockTx.signerPublicKey,
      envStore.networkType
    );

    // ハッシュロックTxリスナー設定
    const hashlockTxlistener = await openTxListener(
      "hash lock",
      signerAddress,
      signedHashLockTx.hash,
      () => {
        state.value = TransactionGroup.Unconfirmed;
      },
      async () => {
        // アグリゲートTxをアナウンス
        envStore.txRepo?.announceAggregateBonded(signedAggTx).toPromise();
      }
    );
    if (typeof hashlockTxlistener === "undefined") {
      envStore.logger.error(logTitle, "open hash lock tx listener failed.");
      return;
    }

    // Txアナウンス
    await envStore.txRepo.announce(signedHashLockTx).toPromise();
    envStore.logger.debug(logTitle, "aggregate bonded end");
  }

  // Exports
  return {
    title,
    message,
    relatedMosaicIdStr,
    dataBase64,
    state,
    processedSize,
    writeOnChain,
  };
});
