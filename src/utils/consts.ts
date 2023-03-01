// 定数
const constants = {
  /* プロトコル */
  // プロトコル名
  PROTOCOL_NAME: "eternal-book-protocol",
  // プロトコルバージョン
  PROTOCOL_VERSION_FIRST: "v0.3.0", // 初版

  /* トランザクション */
  // ヘッダートランザクションのインデックス
  TX_HEADER_IDX: 0,
  // ヘッダートランザクションのサイズ
  TX_HEADER_TX_NUM: 1,
  // アグリゲートトランザクションに含めることができるトランザクション数
  TX_AGGREGATE_INNER_NUM: 100,
  // 1トランザクションに含めることができるデータサイズ
  TX_DATASIZE_PER_TRANSFER: 1023,
  // デフォルトの手数料乗数
  TX_FEE_MULTIPLIER_DEFAULT: 300,
  // XYM の可分性
  TX_DIVISIBILITY_XYM: 6,
  // トランザクションのオーバーヘッドサイズ
  TX_OVERHEAD_SIZE_PER_INNER: 80,

  /* SSS */
  // 1署名後の待ち時間(msec)
  SSS_AFTER_SIGNED_WAIT_MSEC: 5000,

  /* 暗号化 */
  // ハッシュアルゴリズム
  CRYPTO_HASH_ALGORITHM: "sha512",
  // 暗号化アルゴリズム
  CRYPTO_CHIPER_ALGORITHM: "aes-256-cbc",
  // デフォルトのIV
  CRYPTO_IV_DEFAULT: "EternalBookProtocol-OnChainData.",

  /* その他定数 */
  // N/A
  STR_NA: "N/A",
  // 不正なネットワークタイプ
  NETWORKTYPE_INVALID: -1,
};

// 他の定数から算出される定数
const calcs = {
  // 最新プロトコルバージョン
  // バージョン更新したら定義値を変更する
  PROTOCOL_VERSION: constants.PROTOCOL_VERSION_FIRST,

  // データトランザクションのインデックス
  TX_DATA_IDX: constants.TX_HEADER_IDX + constants.TX_HEADER_TX_NUM,
  // データトランザクションのサイズ
  TX_DATA_TX_NUM: constants.TX_AGGREGATE_INNER_NUM - constants.TX_HEADER_TX_NUM,
};

// Export
const CONSTS = Object.freeze({ ...constants, ...calcs });
export default CONSTS;
