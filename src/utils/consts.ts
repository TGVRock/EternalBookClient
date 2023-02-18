export const PROTOCOL_NAME = "eternal-book-protocol"; // プロトコル名

export const HEADER_TX_IDX = 0; // ヘッダートランザクションのインデックス
export const DATA_TX_START_IDX = HEADER_TX_IDX + 1; // データトランザクションのインデックス

export const HASH_ALGORITHM = "sha512"; // ハッシュアルゴリズム
export const CHIPER_ALGORITHM = "aes-256-cbc"; // 暗号化アルゴリズム
export const DEFAULT_IV = "EternalBookProtocol-OnChainData."; // デフォルトのIV
