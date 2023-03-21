import { ref, watch } from "vue";
import { defineStore } from "pinia";
import {
  NetworkType,
  RepositoryFactoryHttp,
  type AccountRepository,
  type MultisigRepository,
  type TransactionRepository,
  type BlockRepository,
  type MosaicRepository,
  type NamespaceRepository,
  type NetworkRepository,
} from "symbol-sdk";
import CONSTS from "@/utils/consts";
import { FeeKind } from "@/models/enums/FeeKind";
import { useSettingsStore } from "./settings";
import { SettingState } from "@/models/enums/SettingState";

/** ノードリスト */
const nodeList = new Map<NetworkType, Array<string>>([
  [
    NetworkType.TEST_NET,
    [
      "https://vmi831828.contaboserver.net:3001",
      "https://001-sai-dual.symboltest.net:3001",
      "https://5.dusan.gq:3001",
    ],
  ],
  [
    NetworkType.MAIN_NET,
    [
      "https://59026db.xym.gakky.net:3001",
      "https://0-0-0-0-0-0-0-0-1.tokyo-node.jp:3001",
      "https://00.high-performance.symbol-nodes.com:3001",
    ],
  ],
]);

/**
 * チェーン情報ストア
 */
export const useChainStore = defineStore("chain", () => {
  // Other Stores
  const settingsStore = useSettingsStore();

  /** 設定ステータス */
  const settingState = ref(SettingState.Initialized);

  /** ネットワークタイプ */
  const networkType = ref(NetworkType.MAIN_NET);
  /** ジェネレーションハッシュ */
  const generationHash = ref("");
  /** エポックアジャストメント */
  const epochAdjustment = ref(-1);
  /** Websocket エンドポイントURI */
  const wsEndpoint = ref("");

  /** Txリポジトリ */
  const txRepo = ref<TransactionRepository | undefined>(undefined);
  /** ブロックリポジトリ */
  const blockRepo = ref<BlockRepository | undefined>(undefined);
  /** モザイクリポジトリ */
  const mosaicRepo = ref<MosaicRepository | undefined>(undefined);
  /** ネームスペースリポジトリ */
  const namespaceRepo = ref<NamespaceRepository | undefined>(undefined);
  /** アカウントリポジトリ */
  const accountRepo = ref<AccountRepository | undefined>(undefined);
  /** マルチシグリポジトリ */
  const multisigRepo = ref<MultisigRepository | undefined>(undefined);
  /** ネットワークリポジトリ */
  const networkRepo = ref<NetworkRepository | undefined>(undefined);

  // Watch
  watch(
    networkType,
    (): void => {
      settingState.value = SettingState.Preparation;
      const logTitle = "chain store watch:";
      settingsStore.logger.debug(logTitle, "start", networkType.value);

      // ネットワークタイプ確認
      if (!nodeList.has(networkType.value)) {
        settingsStore.logger.error(logTitle, "invalid network type.");
        wsEndpoint.value = "";
        generationHash.value = CONSTS.STR_NA;
        epochAdjustment.value = 0;
        txRepo.value = undefined;
        blockRepo.value = undefined;
        mosaicRepo.value = undefined;
        namespaceRepo.value = undefined;
        accountRepo.value = undefined;
        multisigRepo.value = undefined;
        networkRepo.value = undefined;
        settingState.value = SettingState.Ready;
        return;
      }

      // 各種データとリポジトリを設定
      const nodes = nodeList.get(networkType.value)!;
      const repo = new RepositoryFactoryHttp(nodes[0]);
      wsEndpoint.value = nodes[0].replace("http", "ws") + "/ws";
      repo.getGenerationHash().subscribe((value) => {
        generationHash.value = value;
      });
      repo.getEpochAdjustment().subscribe((value) => {
        epochAdjustment.value = value;
      });
      txRepo.value = repo.createTransactionRepository();
      blockRepo.value = repo.createBlockRepository();
      mosaicRepo.value = repo.createMosaicRepository();
      namespaceRepo.value = repo.createNamespaceRepository();
      accountRepo.value = repo.createAccountRepository();
      multisigRepo.value = repo.createMultisigRepository();
      networkRepo.value = repo.createNetworkRepository();
      settingState.value = SettingState.Ready;

      settingsStore.logger.debug(logTitle, "end");
    },
    { immediate: true }
  );

  // Exports
  return {
    settingState,
    networkType,
    generationHash,
    epochAdjustment,
    wsEndpoint,
    txRepo,
    blockRepo,
    mosaicRepo,
    namespaceRepo,
    accountRepo,
    multisigRepo,
    networkRepo,
  };
});
