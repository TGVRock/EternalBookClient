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
} from "symbol-sdk";
import CONSTS from "@/utils/consts";
import { getNetworkType, isSSSEnable } from "@/utils/sss";
import { ConsoleLogger } from "@/utils/consolelogger";

// TODO: Mapにする？
/** テストノードリスト */
const nodeListTest: Array<string> = [
  "https://vmi831828.contaboserver.net:3001",
  "https://001-sai-dual.symboltest.net:3001",
  "https://5.dusan.gq:3001",
];

/** メインノードリスト */
const nodeListMain: Array<string> = [
  "https://59026db.xym.gakky.net:3001",
  "https://0-0-0-0-0-0-0-0-1.tokyo-node.jp:3001",
  "https://00.high-performance.symbol-nodes.com:3001",
];

// TODO: 命名考える（ブロックチェーン？ネットワーク？そうなるとロガーとかも移動する？）
/**
 * 環境情報ストア
 */
export const useEnvironmentStore = defineStore("environment", () => {
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

  /** SSS連携 */
  const sssLinked = ref(isSSSEnable());
  // 定周期でSSS連携状態を確認
  const checkSSSLinked = setInterval(() => {
    // SSS連携されたら定周期確認を終了
    if (isSSSEnable()) {
      sssLinked.value = true;
      clearInterval(checkSSSLinked);
    }
  }, CONSTS.SSS_CONFIRM_INTERVAL_MSEC);
  // 一定時間待っても連携されない場合は定周期確認を終了
  setTimeout(() => {
    clearInterval(checkSSSLinked);
  }, CONSTS.SSS_INIITALIZE_WAIT_MSEC);

  /** ロガー */
  const logger = new ConsoleLogger();

  // Watch
  watch(
    sssLinked,
    (): void => {
      const logTitle = "env store watch (sss linked):";
      logger.debug(logTitle, "start", sssLinked.value);
      networkType.value = getNetworkType();
    },
    { immediate: true }
  );
  watch(
    networkType,
    (): void => {
      const logTitle = "env store watch (network type):";
      logger.debug(logTitle, "start", networkType.value);

      // ネットワークタイプ確認
      // TODO: ノードリストをMapにできれば const にできそう
      let repo: RepositoryFactoryHttp | undefined = undefined;
      switch (networkType.value) {
        case NetworkType.TEST_NET:
          repo = new RepositoryFactoryHttp(nodeListTest[0]);
          wsEndpoint.value = nodeListTest[0].replace("http", "ws") + "/ws";
          break;

        case NetworkType.MAIN_NET:
          repo = new RepositoryFactoryHttp(nodeListMain[0]);
          wsEndpoint.value = nodeListMain[0].replace("http", "ws") + "/ws";
          break;

        default:
          logger.error(logTitle, "invalid network type.");
          repo = undefined;
          wsEndpoint.value = "";
          generationHash.value = CONSTS.STR_NA;
          epochAdjustment.value = 0;
          txRepo.value = undefined;
          blockRepo.value = undefined;
          mosaicRepo.value = undefined;
          namespaceRepo.value = undefined;
          accountRepo.value = undefined;
          multisigRepo.value = undefined;
          return;
      }
      // 各種データとリポジトリを設定
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
      logger.debug(logTitle, "end");
    },
    { immediate: true }
  );

  // Exports
  return {
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
    sssLinked,
    logger,
  };
});
