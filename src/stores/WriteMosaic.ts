import { ref } from "vue";
import { defineStore } from "pinia";
import {
  Address,
  MosaicFlags,
  TransactionGroup,
  Listener,
  MosaicDefinitionTransaction,
} from "symbol-sdk";
import { useEnvironmentStore } from "./environment";
import { useWriteOnChainDataStore } from "./WriteOnChainData";
import { createInnerTxForMosaic } from "@/apis/mosaic";
import { requestTxSign } from "@/utils/sss";
import CONSTS from "@/utils/consts";
import { getAccountInfo } from "@/apis/account";
import {
  createTxAggregateBonded,
  createTxAggregateComplete,
  createTxHashLock,
} from "@/apis/transaction";

/**
 * モザイク作成ストア
 */
export const useWriteMosaicStore = defineStore("WriteMosaic", () => {
  // Other Stores
  const envStore = useEnvironmentStore();
  const writeOnChainDataStore = useWriteOnChainDataStore();

  /** SSS連携アドレス */
  // TODO: 不要と思われるので消す
  const linkedAddress = ref("");
  /** モザイク所有者アドレス */
  const ownerAddress = ref("");
  /** モザイクフラグ */
  const mosaicFlags = ref(MosaicFlags.create(false, false, false, false));
  /** 数量 */
  const amount = ref(1);
  /** 作成状況 */
  const state = ref<TransactionGroup | undefined>(undefined);

  /**
   * モザイク作成
   * @returns なし
   */
  async function createMosaic(): Promise<void> {
    const logTitle = "create mosaic:";
    envStore.logger.debug(logTitle, "start");

    // 進捗情報のクリア
    state.value = undefined;

    // モザイク所有アカウントがマルチシグアカウントか確認
    if (typeof envStore.multisigRepo === "undefined") {
      envStore.logger.error(logTitle, "repository undefined.");
      return;
    }
    const owner = Address.createFromRawAddress(ownerAddress.value);
    const multisigInfo = await envStore.multisigRepo
      .getMultisigAccountInfo(owner)
      .toPromise();
    if (typeof multisigInfo === "undefined") {
      envStore.logger.error(logTitle, "get multisig info failed.");
      return;
    }

    // モザイク作成
    multisigInfo.isMultisig()
      ? await createMosaicForMultisigAccount(owner)
      : await createMosaicForAccount(owner);
    envStore.logger.debug(logTitle, "end");
  }

  /**
   * 通常アカウント用のモザイク作成
   * @param owner 所有者アカウントアドレス
   * @returns なし
   */
  async function createMosaicForAccount(owner: Address): Promise<void> {
    const logTitle = "create mosaic for account:";
    envStore.logger.debug(logTitle, "start");

    // モザイク所有アカウントのアカウント情報を取得
    if (
      typeof envStore.namespaceRepo === "undefined" ||
      typeof envStore.txRepo === "undefined"
    ) {
      envStore.logger.error(logTitle, "repository undefined.");
      return;
    }
    const accountInfo = await getAccountInfo(owner.plain());
    if (typeof accountInfo === "undefined") {
      envStore.logger.error(logTitle, "get account info failed.");
      return;
    }

    // モザイク作成のアグリゲートTx作成
    const aggTx = createTxAggregateComplete(
      createInnerTxForMosaic(accountInfo, amount.value, mosaicFlags.value)
    );
    // SSSによる署名
    // FIXME: SSS署名者チェックは必要？（署名者<>所有者、署名者がマルチシグ、所有者がマルチシグで署名者が連署者じゃない、etc..）
    const signedAggTx = await requestTxSign(aggTx);
    if (typeof signedAggTx === "undefined") {
      envStore.logger.error(logTitle, "sss sign failed.");
      return;
    }

    // モザイク作成Txリスナー設定
    // TODO: カスタムクラスか関数か、なんにせよ分離する（したい）
    const mosaicTxListener = new Listener(
      envStore.wsEndpoint,
      envStore.namespaceRepo,
      WebSocket
    );
    await mosaicTxListener
      .open()
      .then(() => {
        // 切断軽減のためのブロック生成検知
        mosaicTxListener.newBlock();

        // Tx未承認検知
        mosaicTxListener
          .unconfirmedAdded(owner, signedAggTx.hash)
          .subscribe(() => {
            envStore.logger.debug(logTitle, "create mosaic tx unconfirmed");
            state.value = TransactionGroup.Unconfirmed;
          });

        // Tx承認検知
        mosaicTxListener
          .confirmed(owner, signedAggTx.hash)
          .subscribe(async () => {
            envStore.logger.debug(logTitle, "create mosaic tx confirmed");
            // モザイクIDを保存
            writeOnChainDataStore.relatedMosaicIdStr = (
              aggTx.innerTransactions[0] as MosaicDefinitionTransaction
            ).mosaicId.toHex();
            state.value = TransactionGroup.Confirmed;
            // リスナーをクローズ
            mosaicTxListener.close();
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
   * マルチシグアカウント用のモザイク作成
   * @param owner 所有者アカウントアドレス
   * @returns なし
   */
  async function createMosaicForMultisigAccount(owner: Address): Promise<void> {
    const logTitle = "create mosaic for multisig:";
    envStore.logger.debug(logTitle, "start");

    // モザイク所有アカウントのアカウント情報を取得
    if (
      typeof envStore.namespaceRepo === "undefined" ||
      typeof envStore.txRepo === "undefined"
    ) {
      envStore.logger.error(logTitle, "repository undefined.");
      return;
    }
    const accountInfo = await getAccountInfo(owner.plain());
    if (typeof accountInfo === "undefined") {
      envStore.logger.error(logTitle, "get account info failed.");
      return;
    }

    // モザイク作成のアグリゲートTx作成
    const aggTx = createTxAggregateBonded(
      createInnerTxForMosaic(accountInfo, amount.value, mosaicFlags.value)
    );
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
    // HACK: SSS から返却された SignedTransaction だと getSignerAddress() で取得されるアドレスが不正
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

        // Tx承認検知
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

    // モザイク作成Txリスナー設定
    // TODO: カスタムクラスか関数か、なんにせよ分離する（したい）
    const mosaicTxListener = new Listener(
      envStore.wsEndpoint,
      envStore.namespaceRepo,
      WebSocket
    );
    await mosaicTxListener
      .open()
      .then(() => {
        // 切断軽減のためのブロック生成検知
        mosaicTxListener.newBlock();

        // Tx未承認検知
        mosaicTxListener
          .unconfirmedAdded(owner, signedAggTx.hash)
          .subscribe(() => {
            envStore.logger.debug(logTitle, "create mosaic tx unconfirmed");
            state.value = TransactionGroup.Unconfirmed;
          });

        // Tx承認検知
        mosaicTxListener
          .confirmed(owner, signedAggTx.hash)
          .subscribe(async () => {
            envStore.logger.debug(logTitle, "create mosaic tx confirmed");
            // モザイクIDを保存
            writeOnChainDataStore.relatedMosaicIdStr = (
              aggTx.innerTransactions[0] as MosaicDefinitionTransaction
            ).mosaicId.toHex();
            state.value = TransactionGroup.Confirmed;
            // リスナーをクローズ
            mosaicTxListener.close();
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
    linkedAddress,
    ownerAddress,
    mosaicFlags,
    amount,
    state,
    createMosaic,
  };
});
