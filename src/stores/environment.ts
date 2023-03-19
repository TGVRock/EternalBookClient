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
import { ConsoleLogger } from "@/utils/consolelogger";
import { FeeKind } from "@/models/enums/FeeKind";
import { UnavailableReason } from "@/models/enums/UnavailableReason";

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

// TODO: 命名考える（ブロックチェーン？ネットワーク？そうなるとロガーとかも移動する？）
/**
 * 環境情報ストア
 */
export const useEnvironmentStore = defineStore("environment", () => {
  /** ツール利用可否 */
  const isAvailable = ref(true);
  /** ツール利用不可時の理由 */
  const unavailableReason = ref(UnavailableReason.Bug);

  /** ネットワークタイプ */
  const networkType = ref(NetworkType.MAIN_NET);
  /** ジェネレーションハッシュ */
  const generationHash = ref("");
  /** エポックアジャストメント */
  const epochAdjustment = ref(-1);
  /** Websocket エンドポイントURI */
  const wsEndpoint = ref("");
  /** 手数料種別 */
  const feeKind = ref(FeeKind.Default);

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

  /** ロガー */
  const logger = new ConsoleLogger();

  // Watch
  watch(
    networkType,
    (): void => {
      const logTitle = "env store watch:";
      logger.debug(logTitle, "start", networkType.value);

      // ネットワークタイプ確認
      if (!nodeList.has(networkType.value)) {
        logger.error(logTitle, "invalid network type.");
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
      logger.debug(logTitle, "end");
    },
    { immediate: true }
  );

  // ツール利用可否の設定
  try {
    fetch("https://tgvrock.github.io/SymbolOnChainDataViewer/", {
      method: "GET",
    })
      .then(() => {})
      .catch(() => {
        isAvailable.value = false;
        unavailableReason.value = UnavailableReason.Bug;
      });
  } catch (error) {
    isAvailable.value = false;
    unavailableReason.value = UnavailableReason.Bug;
  }
  // TODO: 暫定で特定時間を利用不可とする
  const nowDate = new Date();
  if (nowDate.getMinutes() >= 0 && nowDate.getMinutes() < 5) {
    if (nowDate.getHours() === 0) {
      isAvailable.value = false;
      unavailableReason.value = UnavailableReason.Error;
    } else if (nowDate.getHours() === 4) {
      isAvailable.value = false;
      unavailableReason.value = UnavailableReason.Maintainance;
    }
  }

  // Exports
  return {
    isAvailable,
    unavailableReason,
    networkType,
    generationHash,
    epochAdjustment,
    wsEndpoint,
    feeKind,
    txRepo,
    blockRepo,
    mosaicRepo,
    namespaceRepo,
    accountRepo,
    multisigRepo,
    networkRepo,
    logger,
  };
});
