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
import { createAggTxMosaicDefine } from "@/apis/mosaic";
import { requestTxSign } from "@/utils/sss";
import CONSTS from "@/utils/consts";

export const useWriteMosaicStore = defineStore("WriteMosaic", () => {
  const environmentStore = useEnvironmentStore();
  const writeOnChainDataStore = useWriteOnChainDataStore();

  const linkedAddress = ref("");
  const ownerAddress = ref("");
  const mosaicFlags = ref(MosaicFlags.create(false, false, false, false));
  const amount = ref(1);
  const state = ref<TransactionGroup | undefined>(undefined);

  async function createMosaic(): Promise<void | undefined> {
    state.value = undefined;
    if (environmentStore.multisigRepo === undefined) {
      return undefined;
    }

    const owner = Address.createFromRawAddress(ownerAddress.value);
    const multisigInfo = await environmentStore.multisigRepo
      .getMultisigAccountInfo(owner)
      .toPromise();
    if (multisigInfo === undefined) {
      return undefined;
    }
    return multisigInfo.isMultisig()
      ? createMosaicForMultisigAccount(owner)
      : createMosaicForAccount(owner);
  }

  async function createMosaicForAccount(owner: Address): Promise<void> {
    if (
      environmentStore.accountRepo === undefined ||
      environmentStore.namespaceRepo === undefined ||
      environmentStore.txRepo === undefined
    ) {
      return undefined;
    }
    const accountInfo = await environmentStore.accountRepo
      .getAccountInfo(owner)
      .toPromise();
    if (accountInfo === undefined) {
      return undefined;
    }
    const aggTx = createAggTxMosaicDefine(
      accountInfo,
      amount.value,
      mosaicFlags.value,
      false
    );
    if (aggTx === undefined) {
      return undefined;
    }
    const signedAggTx = await requestTxSign(aggTx);
    if (signedAggTx === undefined) {
      return undefined;
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
        state.value = TransactionGroup.Unconfirmed;
      });

      // ハッシュロックトランザクションの承認検知
      txListener.confirmed(owner, signedAggTx.hash).subscribe(async () => {
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
  }

  async function createMosaicForMultisigAccount(owner: Address): Promise<void> {
    return;
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
