import { ref } from "vue";
import { defineStore } from "pinia";
import { Address, MosaicFlags, MosaicDefinitionTransaction } from "symbol-sdk";
import { useChainStore } from "./chain";
import { useSettingsStore } from "./settings";
import { useSSSStore } from "./sss";
import { useWriteOnChainDataStore } from "./WriteOnChainData";
import { WriteProgress } from "@/models/enums/WriteProgress";
import { getAccountInfo, getMultisigInfo } from "@/apis/account";
import { openTxListener } from "@/apis/listener";
import { createInnerTxForMosaic } from "@/apis/mosaic";
import {
  announceTx,
  createTxAggregateBonded,
  createTxAggregateComplete,
  createTxHashLock,
} from "@/apis/transaction";
import CONSTS from "@/utils/consts";
import { getTxFee } from "@/apis/network";

/**
 * モザイク作成ストア
 */
export const useWriteMosaicStore = defineStore("WriteMosaic", () => {
  // Other Stores
  const settingsStore = useSettingsStore();
  const chainStore = useChainStore();
  const sssStore = useSSSStore();
  const writeOnChainDataStore = useWriteOnChainDataStore();

  /** モザイク所有者アドレス */
  const ownerAddress = ref("");
  /** モザイクフラグ */
  const mosaicFlags = ref(MosaicFlags.create(false, false, false, false));
  /** 数量 */
  const amount = ref(1);
  /** 書き込み状況 */
  const progress = ref<WriteProgress>(WriteProgress.Standby);

  /**
   * モザイク作成
   * @returns なし
   */
  async function createMosaic(): Promise<void> {
    const logTitle = "create mosaic:";
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

    // モザイク所有アカウントがマルチシグアカウントか確認
    const multisigInfo = await getMultisigInfo(ownerAddress.value);
    if (typeof multisigInfo === "undefined") {
      settingsStore.logger.error(logTitle, "get multisig info failed.");
      progress.value = WriteProgress.Failed;
      return;
    }
    const isBonded = multisigInfo.isMultisig();

    // モザイク所有アカウントのアカウント情報を取得
    const accountInfo = await getAccountInfo(ownerAddress.value);
    if (typeof accountInfo === "undefined") {
      settingsStore.logger.error(logTitle, "get account info failed.");
      progress.value = WriteProgress.Failed;
      return;
    }

    // モザイク作成のアグリゲートTx作成
    const aggTx = isBonded
      ? createTxAggregateBonded(
          createInnerTxForMosaic(accountInfo, amount.value, mosaicFlags.value),
          await getTxFee(chainStore.feeKind)
        )
      : createTxAggregateComplete(
          createInnerTxForMosaic(accountInfo, amount.value, mosaicFlags.value),
          await getTxFee(chainStore.feeKind)
        );
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

    // モザイク作成Txリスナーオープン
    const owner = Address.createFromRawAddress(ownerAddress.value);
    const mosaicTxlistener = await openTxListener(
      "create mosaic",
      owner,
      signedAggTx.hash,
      () => {
        progress.value = WriteProgress.TxWaitCosign;
      },
      () => {
        progress.value = WriteProgress.TxUnconfirmed;
      },
      async () => {
        // モザイクIDを保存した直後にモザイク情報を取得するが、承認後すぐだと失敗する場合があるため実行待機
        await new Promise((resolve) =>
          setTimeout(resolve, CONSTS.SSS_AFTER_CREATE_MOSAIC_WAIT_MSEC)
        );
        // モザイクIDを保存
        writeOnChainDataStore.relatedMosaicIdStr = (
          aggTx.innerTransactions[0] as MosaicDefinitionTransaction
        ).mosaicId.toHex();
        progress.value = WriteProgress.Complete;
      },
      () => {
        progress.value = WriteProgress.Failed;
      }
    );
    if (typeof mosaicTxlistener === "undefined") {
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
    ownerAddress,
    mosaicFlags,
    amount,
    progress,
    createMosaic,
  };
});
