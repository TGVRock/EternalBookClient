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

export const useWriteMosaicStore = defineStore("WriteMosaic", () => {
  const environmentStore = useEnvironmentStore();
  const writeOnChainDataStore = useWriteOnChainDataStore();

  const linkedAddress = ref("");
  const ownerAddress = ref("");
  const mosaicFlags = ref(MosaicFlags.create(false, false, false, false));
  const amount = ref(1);
  const state = ref<TransactionGroup | undefined>(undefined);

  async function createMosaic(): Promise<void> {
    state.value = undefined;
    if (typeof environmentStore.multisigRepo === "undefined") {
      return;
    }

    const owner = Address.createFromRawAddress(ownerAddress.value);
    const multisigInfo = await environmentStore.multisigRepo
      .getMultisigAccountInfo(owner)
      .toPromise();
    if (typeof multisigInfo === "undefined") {
      return;
    }
    return multisigInfo.isMultisig()
      ? createMosaicForMultisigAccount(owner)
      : createMosaicForAccount(owner);
  }

  async function createMosaicForAccount(owner: Address): Promise<void> {
    environmentStore.consoleLogger.debug("create mosaic : start.");
    if (
      typeof environmentStore.namespaceRepo === "undefined" ||
      typeof environmentStore.txRepo === "undefined"
    ) {
      return;
    }
    const accountInfo = await getAccountInfo(owner.plain());
    if (typeof accountInfo === "undefined") {
      return;
    }
    const aggTx = createTxAggregateComplete(
      createInnerTxForMosaic(accountInfo, amount.value, mosaicFlags.value)
    );
    if (typeof aggTx === "undefined") {
      return;
    }
    const signedAggTx = await requestTxSign(aggTx);
    if (typeof signedAggTx === "undefined") {
      return;
    }

    // トランザクションリスナーオープン
    const txListener = new Listener(
      environmentStore.wsEndpoint,
      environmentStore.namespaceRepo,
      WebSocket
    );
    await txListener.open();
    {
      // 切断軽減のためのブロック生成検知
      txListener.newBlock();

      // ハッシュロックトランザクションの承認検知
      txListener.unconfirmedAdded(owner, signedAggTx.hash).subscribe(() => {
        environmentStore.consoleLogger.debug(
          "create mosaic tx listener : unconfirmed."
        );
        state.value = TransactionGroup.Unconfirmed;
      });

      // ハッシュロックトランザクションの承認検知
      txListener.confirmed(owner, signedAggTx.hash).subscribe(async () => {
        environmentStore.consoleLogger.debug(
          "create mosaic tx listener : confirmed."
        );
        await new Promise((resolve) =>
          setTimeout(resolve, CONSTS.SSS_AFTER_SIGNED_WAIT_MSEC)
        );
        writeOnChainDataStore.relatedMosaicIdStr = (
          aggTx.innerTransactions[0] as MosaicDefinitionTransaction
        ).mosaicId.toHex();
        state.value = TransactionGroup.Confirmed;
        // リスナーをクローズ
        txListener.close();
      });
    }

    await environmentStore.txRepo.announce(signedAggTx).toPromise();
    environmentStore.consoleLogger.debug("create mosaic : end.");
  }

  async function createMosaicForMultisigAccount(owner: Address): Promise<void> {
    environmentStore.consoleLogger.debug("create mosaic (multisig) : start.");
    if (
      typeof environmentStore.namespaceRepo === "undefined" ||
      typeof environmentStore.txRepo === "undefined"
    ) {
      return undefined;
    }
    const accountInfo = await getAccountInfo(owner.plain());
    if (typeof accountInfo === "undefined") {
      return undefined;
    }
    const aggTx = createTxAggregateBonded(
      createInnerTxForMosaic(accountInfo, amount.value, mosaicFlags.value)
    );
    if (typeof aggTx === "undefined") {
      return undefined;
    }
    const signedAggTx = await requestTxSign(aggTx);
    if (typeof signedAggTx === "undefined") {
      return undefined;
    }

    // SSS待ち
    await new Promise((resolve) =>
      setTimeout(resolve, CONSTS.SSS_AFTER_SIGNED_WAIT_MSEC)
    );

    // ハッシュロックTxを作成し、SSSで署名
    const hashLockTx = createTxHashLock(signedAggTx);
    const signedHashLockTx = await requestTxSign(hashLockTx);
    if (typeof signedHashLockTx === "undefined") {
      return undefined;
    }
    // NOTE: SSS から返却された SignedTransaction だと getSignerAddress() で取得されるアドレスが不正
    const signerAddress = Address.createFromPublicKey(
      signedHashLockTx.signerPublicKey,
      environmentStore.networkType
    );

    // ハッシュロック用のトランザクションリスナーオープン
    const hashLockTxListener = new Listener(
      environmentStore.wsEndpoint,
      environmentStore.namespaceRepo,
      WebSocket
    );
    await hashLockTxListener.open();
    {
      // 切断軽減のためのブロック生成検知
      hashLockTxListener.newBlock();

      // ハッシュロックトランザクションの承認検知
      hashLockTxListener
        .unconfirmedAdded(signerAddress, signedHashLockTx.hash)
        .subscribe(() => {
          environmentStore.consoleLogger.debug(
            "create mosaic (multisig) hash lock listener : unconfirmed."
          );
          state.value = TransactionGroup.Unconfirmed;
        });

      // ハッシュロックトランザクションの承認検知
      hashLockTxListener
        .confirmed(signerAddress, signedHashLockTx.hash)
        .subscribe(async () => {
          environmentStore.consoleLogger.debug(
            "create mosaic (multisig) hash lock listener : confirmed."
          );
          environmentStore.txRepo
            ?.announceAggregateBonded(signedAggTx)
            .toPromise();
          // リスナーをクローズ
          hashLockTxListener.close();
        });
    }

    // トランザクションリスナーオープン
    const txListener = new Listener(
      environmentStore.wsEndpoint,
      environmentStore.namespaceRepo,
      WebSocket
    );
    await txListener.open();
    {
      // 切断軽減のためのブロック生成検知
      txListener.newBlock();

      // ハッシュロックトランザクションの承認検知
      txListener.unconfirmedAdded(owner, signedAggTx.hash).subscribe(() => {
        environmentStore.consoleLogger.debug(
          "create mosaic (multisig) tx listener : unconfirmed."
        );
        state.value = TransactionGroup.Unconfirmed;
      });

      // ハッシュロックトランザクションの承認検知
      txListener.confirmed(owner, signedAggTx.hash).subscribe(async () => {
        environmentStore.consoleLogger.debug(
          "create mosaic (multisig) tx listener : confirmed."
        );
        await new Promise((resolve) =>
          setTimeout(resolve, CONSTS.SSS_AFTER_SIGNED_WAIT_MSEC)
        );
        writeOnChainDataStore.relatedMosaicIdStr = (
          aggTx.innerTransactions[0] as MosaicDefinitionTransaction
        ).mosaicId.toHex();
        state.value = TransactionGroup.Confirmed;
        // リスナーをクローズ
        txListener.close();
      });
    }

    await environmentStore.txRepo.announce(signedHashLockTx).toPromise();
    environmentStore.consoleLogger.debug("create mosaic (multisig) : end.");
  }

  return {
    linkedAddress,
    ownerAddress,
    mosaicFlags,
    amount,
    state,
    createMosaic,
  };
});
