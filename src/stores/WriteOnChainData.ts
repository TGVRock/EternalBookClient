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
import CONSTS from "@/utils/consts";
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
    environmentStore.consoleLogger.debug("writeOnChain() start.");
    state.value = "prepare";
    processedSize.value = 0;
    prevTxHash.value = "";
    // データ設定チェック
    if (dataBase64.value.length === 0) {
      environmentStore.consoleLogger.debug(
        "writeOnChain() error : data no setting."
      );
      return;
    }
    writeOnChainOneComponent();
    environmentStore.consoleLogger.debug("writeOnChain() end.");
  }

  async function writeOnChainOneComponent(): Promise<void> {
    environmentStore.consoleLogger.debug("writeOnChainOneComponent() start.");
    environmentStore.consoleLogger.debug("processed Size", processedSize.value);
    // 書き込み済データサイズチェック
    if (processedSize.value >= dataBase64.value.length) {
      environmentStore.consoleLogger.debug(
        "writeOnChainOneComponent() : completed."
      );
      return;
    }
    // モザイク設定チェック
    const mosaicInfo = relatedMosaicInfo.value as MosaicInfo;
    if (typeof mosaicInfo === "undefined") {
      environmentStore.consoleLogger.debug(
        "writeOnChainOneComponent() error : mosaic no setting."
      );
      return;
    }
    if (
      typeof environmentStore.accountRepo === "undefined" ||
      typeof environmentStore.namespaceRepo === "undefined" ||
      typeof environmentStore.txRepo === "undefined"
    ) {
      environmentStore.consoleLogger.debug(
        "writeOnChainOneComponent() error : repository unavailable."
      );
      return;
    }

    const accountInfo = await environmentStore.accountRepo
      .getAccountInfo(mosaicInfo.ownerAddress)
      .toPromise();
    if (typeof accountInfo === "undefined") {
      environmentStore.consoleLogger.debug(
        "writeOnChainOneComponent() error : get account info failed."
      );
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
    if (typeof encryptHeader === "undefined") {
      environmentStore.consoleLogger.debug(
        "writeOnChainOneComponent() error : crypto header failed."
      );
      return;
    }
    const txHeader = createTxTransfer(accountInfo, encryptHeader);
    if (typeof txHeader === "undefined") {
      environmentStore.consoleLogger.debug(
        "writeOnChainOneComponent() error : create header tx failed."
      );
      return;
    }
    txList.push(txHeader.toAggregate(accountInfo.publicAccount));

    // データトランザクションの作成
    for (; txList.length < CONSTS.TX_AGGREGATE_INNER_NUM; ) {
      if (processedSize.value >= dataBase64.value.length) {
        break;
      }
      const sendData = dataBase64.value.substring(
        processedSize.value,
        processedSize.value + CONSTS.TX_DATASIZE_PER_TRANSFER
      );
      const txHeader = createTxTransfer(accountInfo, sendData);
      if (typeof txHeader === "undefined") {
        environmentStore.consoleLogger.debug(
          "writeOnChainOneComponent() error : create data tx failed."
        );
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
    ).setMaxFeeForAggregate(CONSTS.TX_FEE_MULTIPLIER_DEFAULT, 0);

    const signedAggTx = await requestTxSign(aggTx);
    if (typeof signedAggTx === "undefined") {
      environmentStore.consoleLogger.debug(
        "writeOnChainOneComponent() error : SSS request sign failed."
      );
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
      txListener
        .unconfirmedAdded(mosaicInfo.ownerAddress, signedAggTx.hash)
        .subscribe(() => {
          environmentStore.consoleLogger.debug(
            "on chain data listener : unconfirmed."
          );
          state.value = "processing";
        });

      // ハッシュロックトランザクションの承認検知
      txListener
        .confirmed(mosaicInfo.ownerAddress, signedAggTx.hash)
        .subscribe(async () => {
          environmentStore.consoleLogger.debug(
            "on chain data listener : confirmed."
          );
          state.value = "complete";
          prevTxHash.value = "";
          if (processedSize.value < dataBase64.value.length) {
            prevTxHash.value = signedAggTx.hash;
            await new Promise((resolve) =>
              setTimeout(resolve, CONSTS.SSS_AFTER_SIGNED_WAIT_MSEC)
            );
            writeOnChainOneComponent();
          }
          // リスナーをクローズ
          txListener.close();
        });
    }

    await environmentStore.txRepo.announce(signedAggTx).toPromise();
    environmentStore.consoleLogger.debug("writeOnChainOneComponent() end.");
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
