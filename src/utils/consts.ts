/** 定数 */
const constants = {
  // Vue Router Name
  /** ホーム */
  ROUTENAME_HOME: "home",
  /** Viewer トップ */
  ROUTENAME_VIEWER_TOP: "ViewerTop",
  /** Viewer 表示ページ */
  ROUTENAME_VIEWER_RESULT: "ViewerResult",
  /** Writer トップ */
  ROUTENAME_WRITER_TOP: "WriterTop",
  /** Writer モザイク作成 */
  ROUTENAME_WRITER_CREATE_MOSAIC: "CreateMosaic",
  /** Writer オンチェーンデータ書込み */
  ROUTENAME_WRITER_WRITE_ONCHAIN_DATA: "WriteOnChainData",
  /** 設定 */
  ROUTENAME_SETTINGS: "Settings",

  // プロトコル
  /** プロトコル名 */
  PROTOCOL_NAME: "eternal-book-protocol",
  /** プロトコルバージョン */
  PROTOCOL_VERSION_FIRST: "v0.3.0", // 初版

  // トランザクション
  /** ヘッダ情報Txのインデックス */
  TX_HEADER_IDX: 0,
  /** ヘッダ情報Txのサイズ */
  TX_HEADER_TX_NUM: 1,
  /** アグリゲートTxに含めることができるTx数 */
  TX_AGGREGATE_INNER_NUM: 100,
  /** トランザクションに含めることができるデータサイズ */
  TX_DATASIZE_PER_TRANSFER: 1023,
  /** デフォルトの手数料乗数 */
  TX_FEE_MULTIPLIER_DEFAULT: 300,
  /** XYM エイリアス */
  TX_XYM_ALIAS: "symbol.xym",
  /** XYM の可分性 */
  TX_XYM_DIVISIBILITY: 6,
  /** インナーTxのオーバーヘッドサイズ */
  TX_OVERHEAD_SIZE_PER_INNER: 80,
  /**
   * モザイク作成後の待ち時間(msec)
   * @description 承認後すぐにモザイク情報を取得すると失敗する場合がある
   */
  SSS_AFTER_CREATE_MOSAIC_WAIT_MSEC: 5000,

  /* SSS */
  /** SSS初期化待ち時間(msec) */
  SSS_INIITALIZE_WAIT_MSEC: 10000,
  /** 1署名後の待ち時間(msec) */
  SSS_AFTER_SIGNED_WAIT_MSEC: 10000,
  /**
   * SSS署名待ち時間(msec)
   * @see https://github.com/SafelySignSymbol/SSS-Extension/wiki/requestSign
   */
  SSS_SIGN_REJECT_WAIT_MSEC: 60000,

  // 暗号化
  /** ハッシュアルゴリズム */
  CRYPTO_HASH_ALGORITHM: "sha512",
  /** 暗号化アルゴリズム */
  CRYPTO_CHIPER_ALGORITHM: "aes-256-cbc",
  /** デフォルトのIV */
  CRYPTO_IV_DEFAULT: "EternalBookProtocol-OnChainData.",

  // LocalStorage キー
  /** 書き込み対象モザイクID */
  STORAGEKEY_TARGET_MOSAIC_ID: "TARGET_MOSAIC_ID",
  /** データハッシュ */
  STORAGEKEY_DATA_HASH: "DATA_HASH",
  /** 最終Txハッシュ */
  STORAGEKEY_PREV_TX_HASH: "PREV_TX_HASH",
  /** 書き込み済バイトサイズ */
  STORAGEKEY_PROCESSED_SIZE: "PROCESSED_SIZE",

  // その他定数
  /** N/A */
  STR_NA: "N/A",
  /** 設定なし */
  STR_NOT_SETTING: "--",
  /** オン選択 */
  STR_SELECT_ON: "on",
  /** オフ選択 */
  STR_SELECT_OFF: "off",
  /** 不正なネットワークタイプ */
  NETWORKTYPE_INVALID: -1,
  /** 設定変更時の完了確認間隔時間(msec) */
  CHANGE_SETTING_CONFIRM_INTERVAL_MSEC: 500,
};

/** 他の定数から算出される定数 */
const calcs = {
  /** 最新プロトコルバージョン */
  // バージョン更新したら定義値を変更する
  PROTOCOL_VERSION: constants.PROTOCOL_VERSION_FIRST,

  /** ハッシュロック費用(10XYM) */
  TX_HASHLOCK_COST: 10 * Math.pow(10, constants.TX_XYM_DIVISIBILITY),
  /** データTxのインデックス */
  TX_DATA_IDX: constants.TX_HEADER_IDX + constants.TX_HEADER_TX_NUM,
  /** データTxのサイズ */
  TX_DATA_TX_NUM: constants.TX_AGGREGATE_INNER_NUM - constants.TX_HEADER_TX_NUM,
};

// Export
/** 定数 */
const CONSTS = Object.freeze({ ...constants, ...calcs });
export default CONSTS;
