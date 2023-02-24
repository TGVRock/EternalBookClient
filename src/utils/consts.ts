export const PROTOCOL_NAME = "eternal-book-protocol"; // プロトコル名

// プロトコルバージョン
export const PROTOCOL_VERSION_FIRST = "v0.3.0"; // 初版
// バージョン更新したら定義値を変更する
export const PROTOCOL_VERSION = PROTOCOL_VERSION_FIRST;

export const HEADER_TX_IDX = 0; // ヘッダートランザクションのインデックス
export const HEADER_TX_SIZE = 1; // ヘッダートランザクションのサイズ
export const DATA_TX_START_IDX = HEADER_TX_IDX + HEADER_TX_SIZE; // データトランザクションのインデックス
export const AGGREGATE_MAX_NUM = 100; // アグリゲートトランザクションに含めることができるトランザクション数
export const DATA_TX_SIZE = AGGREGATE_MAX_NUM - HEADER_TX_SIZE; // データトランザクションのサイズ

export const HASH_ALGORITHM = "sha512"; // ハッシュアルゴリズム
export const CHIPER_ALGORITHM = "aes-256-cbc"; // 暗号化アルゴリズム
export const DEFAULT_IV = "EternalBookProtocol-OnChainData."; // デフォルトのIV

export const AGGREGATE_FEE_MULTIPLIER = 300; // 手数料乗数
export const DATASIZE_PER_TX = 1023; // 1トランザクションに含めることができるデータサイズ
export const OVERHEAD_SIZE_PER_TX = 80; // トランザクションのオーバーヘッドサイズ
export const MAX_FEE_PRE_AGG_TX = 22; // 1アグリゲートトランザクションの最大手数料(実際値)
export const XYM_DIVISIBILITY = 6; // XYM の可分性
