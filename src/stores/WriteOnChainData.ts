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
import { requestTxSign } from "@/utils/sss";
import { FetchState } from "@/models/FetchState";

/**
 * オンチェーンデータ書き込みストア
 */
export const useWriteOnChainDataStore = defineStore("WriteOnChainData", () => {
  // Other Stores
  const envStore = useEnvironmentStore();

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

    // オンチェーンデータ書き込み
    multisigInfo.isMultisig()
      ? await writeOnChainOneComponentForMultisigAccount()
      : await writeOnChainOneComponent();
    envStore.logger.debug(logTitle, "end");
  }

  /**
   * 通常アカウント用のオンチェーンデータ書き込み
   * @returns なし
   */
  async function writeOnChainOneComponent(): Promise<void> {
    const logTitle = "write data for account:";
    envStore.logger.debug(logTitle, "start");

    // 書き込み済データサイズチェック
    envStore.logger.debug(logTitle, "processed size", processedSize.value);
    if (processedSize.value >= dataBase64.value.length) {
      envStore.logger.debug(logTitle, "all data proceeded.");
      return;
    }

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
    // TODO: 最終データ以外にもデータハッシュ含まれてる
    const header = createHeader(
      mosaicInfo.id.toHex(),
      mosaicInfo.ownerAddress.plain(),
      title.value,
      message.value,
      prevTxHash.value,
      getHash(dataBase64.value)
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
    const aggTx = createTxAggregateComplete(txList);
    // SSSによる署名
    // FIXME: SSS署名者チェックは必要？（署名者<>所有者、署名者がマルチシグ、所有者がマルチシグで署名者が連署者じゃない、etc..）
    const signedAggTx = await requestTxSign(aggTx);
    if (typeof signedAggTx === "undefined") {
      envStore.logger.error(logTitle, "sss sign failed.");
      return;
    }

    // オンチェーンデータTxリスナーオープン
    const dataTxListener = new Listener(
      envStore.wsEndpoint,
      envStore.namespaceRepo,
      WebSocket
    );
    await dataTxListener
      .open()
      .then(() => {
        // 切断軽減のためのブロック生成検知
        dataTxListener.newBlock();

        // Tx未承認検知
        dataTxListener
          .unconfirmedAdded(mosaicInfo.ownerAddress, signedAggTx.hash)
          .subscribe(() => {
            envStore.logger.debug(logTitle, "write data tx unconfirmed");
            state.value = TransactionGroup.Unconfirmed;
          });

        // Tx承認検知
        dataTxListener
          .confirmed(mosaicInfo.ownerAddress, signedAggTx.hash)
          .subscribe(async () => {
            envStore.logger.debug(logTitle, "write data tx confirmed.");
            // 未処理データが存在する場合はデータ書き込みを再帰実行
            if (processedSize.value < dataBase64.value.length) {
              // 次のデータ書き込みでSSS署名するため待ち
              // TODO: SSS署名の関数に移動する
              await new Promise((resolve) =>
                setTimeout(resolve, CONSTS.SSS_AFTER_SIGNED_WAIT_MSEC)
              );
              prevTxHash.value = signedAggTx.hash;
              writeOnChainOneComponent();
            } else {
              prevTxHash.value = "";
              state.value = TransactionGroup.Confirmed;
            }
            // リスナーをクローズ
            dataTxListener.close();
          });
      })
      .catch((error) => {
        envStore.logger.error(
          logTitle,
          "aggregate tx listener open failed",
          error
        );
      });

    // Txアナウンス
    await envStore.txRepo.announce(signedAggTx).toPromise();
    envStore.logger.debug(logTitle, "end");
  }

  /**
   * マルチシグアカウント用のオンチェーンデータ書き込み
   * @returns なし
   */
  async function writeOnChainOneComponentForMultisigAccount(): Promise<void> {
    const logTitle = "write data for multisig:";
    envStore.logger.debug(logTitle, "start");

    // 書き込み済データサイズチェック
    envStore.logger.debug(logTitle, "processed size", processedSize.value);
    if (processedSize.value >= dataBase64.value.length) {
      envStore.logger.debug(logTitle, "all data proceeded.");
      return;
    }

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
    // TODO: 最終データ以外にもデータハッシュ含まれてる
    const header = createHeader(
      mosaicInfo.id.toHex(),
      mosaicInfo.ownerAddress.plain(),
      title.value,
      message.value,
      prevTxHash.value,
      getHash(dataBase64.value)
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
    const aggTx = createTxAggregateBonded(txList);
    // SSSによる署名
    // FIXME: SSS署名者チェックは必要？（署名者<>所有者、署名者がマルチシグ、所有者がマルチシグで署名者が連署者じゃない、etc..）
    const signedAggTx = await requestTxSign(aggTx);
    if (typeof signedAggTx === "undefined") {
      envStore.logger.error(logTitle, "sss sign failed.");
      return;
    }
    // 続けてハッシュロックTxをSSSで署名するため待ち
    // TODO: SSS署名の関数に移動する
    await new Promise((resolve) =>
      setTimeout(resolve, CONSTS.SSS_AFTER_SIGNED_WAIT_MSEC)
    );

    // ハッシュロックTx作成
    const hashLockTx = createTxHashLock(signedAggTx);
    // SSSによる署名
    // FIXME: SSS署名者チェックは必要？（署名者<>所有者、署名者がマルチシグ、所有者がマルチシグで署名者が連署者じゃない、etc..）
    const signedHashLockTx = await requestTxSign(hashLockTx);
    if (typeof signedHashLockTx === "undefined") {
      envStore.logger.error(logTitle, "sss sign failed.");
      return;
    }
    // NOTE: SSS から返却された SignedTransaction だと getSignerAddress() で取得されるアドレスが不正
    const signerAddress = Address.createFromPublicKey(
      signedHashLockTx.signerPublicKey,
      envStore.networkType
    );

    // ハッシュロックTxリスナー設定
    // TODO: カスタムクラスか関数か、なんにせよ分離する（したい）
    const hashLockTxListener = new Listener(
      envStore.wsEndpoint,
      envStore.namespaceRepo,
      WebSocket
    );
    await hashLockTxListener
      .open()
      .then(() => {
        // 切断軽減のためのブロック生成検知
        hashLockTxListener.newBlock();

        // Tx未承認検知
        hashLockTxListener
          .unconfirmedAdded(signerAddress, signedHashLockTx.hash)
          .subscribe(() => {
            envStore.logger.debug(logTitle, "hash lock tx unconfirmed");
            state.value = TransactionGroup.Unconfirmed;
          });

        // ハッシュロックトランザクションの承認検知
        hashLockTxListener
          .confirmed(signerAddress, signedHashLockTx.hash)
          .subscribe(async () => {
            envStore.logger.debug(logTitle, "hash lock tx confirmed");
            // アグリゲートTxをアナウンス
            envStore.txRepo?.announceAggregateBonded(signedAggTx).toPromise();
            // リスナーをクローズ
            hashLockTxListener.close();
          });
      })
      .catch((error) => {
        envStore.logger.error(
          logTitle,
          "hash lock listener open failed",
          error
        );
      });

    // オンチェーンデータTxリスナーオープン
    const dataTxListener = new Listener(
      envStore.wsEndpoint,
      envStore.namespaceRepo,
      WebSocket
    );
    await dataTxListener
      .open()
      .then(() => {
        // 切断軽減のためのブロック生成検知
        dataTxListener.newBlock();

        // Tx未承認検知
        dataTxListener
          .unconfirmedAdded(mosaicInfo.ownerAddress, signedAggTx.hash)
          .subscribe(() => {
            envStore.logger.debug(logTitle, "write data tx unconfirmed");
            state.value = TransactionGroup.Unconfirmed;
          });

        // Tx承認検知
        dataTxListener
          .confirmed(mosaicInfo.ownerAddress, signedAggTx.hash)
          .subscribe(async () => {
            envStore.logger.debug(logTitle, "write data tx confirmed.");
            // 未処理データが存在する場合はデータ書き込みを再帰実行
            if (processedSize.value < dataBase64.value.length) {
              // 次のデータ書き込みでSSS署名するため待ち
              // TODO: SSS署名の関数に移動する
              await new Promise((resolve) =>
                setTimeout(resolve, CONSTS.SSS_AFTER_SIGNED_WAIT_MSEC)
              );
              prevTxHash.value = signedAggTx.hash;
              writeOnChainOneComponentForMultisigAccount();
            } else {
              prevTxHash.value = "";
              state.value = TransactionGroup.Confirmed;
            }
            // リスナーをクローズ
            dataTxListener.close();
          });
      })
      .catch((error) => {
        envStore.logger.error(
          logTitle,
          "aggregate tx listener open failed",
          error
        );
      });

    // Txアナウンス
    await envStore.txRepo.announce(signedHashLockTx).toPromise();
    envStore.logger.debug(logTitle, "end");
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
