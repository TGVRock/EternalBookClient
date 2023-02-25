import { ref, watch } from "vue";
import { defineStore } from "pinia";
import {
  AggregateTransaction,
  Deadline,
  type InnerTransaction,
  type MosaicInfo,
  Listener,
} from "symbol-sdk";
import { getMosaicInfo } from "@/apis/mosaic";
import { createHeader } from "@/utils/eternalbookprotocol";
import { cryptoHeader, getHash } from "@/utils/crypto";
import { createTxTransfer } from "@/apis/transaction";
import { useEnvironmentStore } from "./environment";
import {
  AGGREGATE_MAX_NUM,
  DATASIZE_PER_TX,
  AGGREGATE_FEE_MULTIPLIER,
} from "@/utils/consts";
import { requestTxSign } from "@/utils/sss";

export const useWriteOnChainDataStore = defineStore("WriteOnChainData", () => {
  const environmentStore = useEnvironmentStore();

  const title = ref("");
  const message = ref("");
  const relatedMosaicIdStr = ref("");
  const relatedMosaicInfo = ref<MosaicInfo | undefined>(undefined);
  const dataBase64 = ref("");
  const state = ref("prepare");
  const processedSize = ref(0);
  const prevTxHash = ref("");

  watch(
    relatedMosaicIdStr,
    (): void => {
      getMosaicInfo(relatedMosaicIdStr.value)
        .then((value): void => {
          relatedMosaicInfo.value = value;
        })
        .catch(() => {
          relatedMosaicInfo.value = undefined;
        });
    },
    { immediate: true }
  );

  async function writeOnChain(): Promise<void> {
    state.value = "prepare";
    processedSize.value = 0;
    // データ設定チェック
    if (dataBase64.value.length === 0) {
      return;
    }
    writeOnChainOneComponent();
  }

  async function writeOnChainOneComponent(): Promise<void> {
    console.log(processedSize.value);
    // 書き込み済データサイズチェック
    if (processedSize.value >= dataBase64.value.length) {
      return;
    }
    // モザイク設定チェック
    const mosaicInfo = relatedMosaicInfo.value as MosaicInfo;
    if (mosaicInfo === undefined) {
      return;
    }
    if (
      environmentStore.accountRepo === undefined ||
      environmentStore.namespaceRepo === undefined ||
      environmentStore.txRepo === undefined
    ) {
      return;
    }

    const accountInfo = await environmentStore.accountRepo
      .getAccountInfo(mosaicInfo.ownerAddress)
      .toPromise();
    if (accountInfo === undefined) {
      return;
    }

    const txList: Array<InnerTransaction> = [];
    const header = createHeader(
      mosaicInfo.id.toHex(),
      mosaicInfo.ownerAddress.plain(),
      prevTxHash.value,
      title.value,
      message.value,
      getHash(dataBase64.value)
    );
    const encryptHeader = cryptoHeader(mosaicInfo.id.toHex(), header);
    if (encryptHeader === undefined) {
      return;
    }
    const txHeader = createTxTransfer(accountInfo, encryptHeader);
    if (txHeader === undefined) {
      return;
    }
    txList.push(txHeader.toAggregate(accountInfo.publicAccount));

    // データトランザクションの作成
    for (; txList.length < AGGREGATE_MAX_NUM; ) {
      if (processedSize.value >= dataBase64.value.length) {
        break;
      }
      const sendData = dataBase64.value.substring(
        processedSize.value,
        processedSize.value + DATASIZE_PER_TX
      );
      const txHeader = createTxTransfer(accountInfo, sendData);
      if (txHeader === undefined) {
        return;
      }
      txList.push(txHeader.toAggregate(accountInfo.publicAccount));
      processedSize.value += sendData.length;
    }

    const aggTx = AggregateTransaction.createComplete(
      Deadline.create(environmentStore.epochAdjustment),
      txList,
      environmentStore.networkType,
      []
    ).setMaxFeeForAggregate(AGGREGATE_FEE_MULTIPLIER, 0);

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
      txListener
        .unconfirmedAdded(mosaicInfo.ownerAddress, signedAggTx.hash)
        .subscribe(() => {
          state.value = "processing";
        });

      // ハッシュロックトランザクションの承認検知
      txListener
        .confirmed(mosaicInfo.ownerAddress, signedAggTx.hash)
        .subscribe(async () => {
          state.value = "complete";
          if (processedSize.value < dataBase64.value.length) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            writeOnChainOneComponent();
          }
          // リスナーをクローズ
          txListener.close();
        });
    }

    await environmentStore.txRepo.announce(signedAggTx).toPromise();
  }

  return {
    title,
    message,
    relatedMosaicIdStr,
    dataBase64,
    state,
    writeOnChain,
  };
});
