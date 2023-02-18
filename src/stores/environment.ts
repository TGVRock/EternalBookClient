import { ref, watch } from "vue";
import { defineStore } from "pinia";
import { NetworkType, RepositoryFactoryHttp } from "symbol-sdk";
import type {
  TransactionRepository,
  BlockRepository,
  MosaicRepository,
  NamespaceRepository,
} from "symbol-sdk";

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

  watch(
    networkType,
    (): void => {
      switch (networkType.value) {
        case NetworkType.TEST_NET:
          repo.value = new RepositoryFactoryHttp(nodeListTest[0]);
          break;

        case NetworkType.MAIN_NET:
          repo.value = new RepositoryFactoryHttp(nodeListMain[0]);
          break;

        default:
          generationHash.value = "N/A";
          epochAdjustment.value - 1;
          repo.value = undefined;
          txRepo.value = undefined;
          blockRepo.value = undefined;
          mosaicRepo.value = undefined;
          namespaceRepo.value = undefined;
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
    },
    { immediate: true }
  );

  return {
    networkType,
    generationHash,
    epochAdjustment,
    repo,
    txRepo,
    blockRepo,
    mosaicRepo,
    namespaceRepo,
  };
});
