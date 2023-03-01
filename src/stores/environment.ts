import { ref, watch } from "vue";
import { defineStore } from "pinia";
import {
  NetworkType,
  RepositoryFactoryHttp,
  type AccountRepository,
  type MultisigRepository,
} from "symbol-sdk";
import type {
  TransactionRepository,
  BlockRepository,
  MosaicRepository,
  NamespaceRepository,
} from "symbol-sdk";
import CONSTS from "@/utils/consts";
import { isSSSEnable } from "@/utils/sss";

const nodeListTest: Array<string> = [
  "https://vmi831828.contaboserver.net:3001",
  "https://001-sai-dual.symboltest.net:3001",
  "https://5.dusan.gq:3001",
];

const nodeListMain: Array<string> = [
  "https://59026db.xym.gakky.net:3001",
  "https://0-0-0-0-0-0-0-0-1.tokyo-node.jp:3001",
  "https://00.high-performance.symbol-nodes.com:3001",
];

export const useEnvironmentStore = defineStore("environment", () => {
  const networkType = ref(NetworkType.MAIN_NET);
  const generationHash = ref("");
  const epochAdjustment = ref(-1);
  const repo = ref<RepositoryFactoryHttp | undefined>(undefined);
  const txRepo = ref<TransactionRepository | undefined>(undefined);
  const blockRepo = ref<BlockRepository | undefined>(undefined);
  const mosaicRepo = ref<MosaicRepository | undefined>(undefined);
  const namespaceRepo = ref<NamespaceRepository | undefined>(undefined);
  const accountRepo = ref<AccountRepository | undefined>(undefined);
  const multisigRepo = ref<MultisigRepository | undefined>(undefined);
  const wsEndpoint = ref("");
  const sssLinked = ref(isSSSEnable());

  const checkSSSLinked = setInterval(() => {
    if (isSSSEnable()) {
      sssLinked.value = true;
      clearInterval(checkSSSLinked);
    }
  }, 500);
  setTimeout(() => {
    clearInterval(checkSSSLinked);
  }, 10000);

  watch(
    networkType,
    (): void => {
      switch (networkType.value) {
        case NetworkType.TEST_NET:
          repo.value = new RepositoryFactoryHttp(nodeListTest[0]);
          wsEndpoint.value = nodeListTest[0].replace("http", "ws") + "/ws";
          break;

        case NetworkType.MAIN_NET:
          repo.value = new RepositoryFactoryHttp(nodeListMain[0]);
          wsEndpoint.value = nodeListMain[0].replace("http", "ws") + "/ws";
          break;

        default:
          generationHash.value = CONSTS.STR_NA;
          epochAdjustment.value - 1;
          wsEndpoint.value = "";
          repo.value = undefined;
          txRepo.value = undefined;
          blockRepo.value = undefined;
          mosaicRepo.value = undefined;
          namespaceRepo.value = undefined;
          accountRepo.value = undefined;
          multisigRepo.value = undefined;
          return;
      }
      repo.value.getGenerationHash().subscribe((value) => {
        generationHash.value = value;
      });
      repo.value.getEpochAdjustment().subscribe((value) => {
        epochAdjustment.value = value;
      });
      txRepo.value = repo.value.createTransactionRepository();
      blockRepo.value = repo.value.createBlockRepository();
      mosaicRepo.value = repo.value.createMosaicRepository();
      namespaceRepo.value = repo.value.createNamespaceRepository();
      accountRepo.value = repo.value.createAccountRepository();
      multisigRepo.value = repo.value.createMultisigRepository();
    },
    { immediate: true }
  );

  return {
    networkType,
    generationHash,
    epochAdjustment,
    wsEndpoint,
    repo,
    txRepo,
    blockRepo,
    mosaicRepo,
    namespaceRepo,
    accountRepo,
    multisigRepo,
    sssLinked,
  };
});
