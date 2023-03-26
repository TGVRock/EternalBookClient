/**
 * EternalBookProtocol ヘッダ情報
 */
export interface EternalBookProtocolHeader {
  // 全てのオンチェーンデータTxに存在するプロパティ
  /** プロトコルバージョン */
  version: string;
  /** モザイクID */
  mosaicId: string;
  /** 作成者アドレス */
  address: string;
  /** 前のTxハッシュ */
  prevTx: string | null;

  // v0.3.0 のみ存在
  /** 現在のデータ番号 */
  no?: number;
  /** 全体のデータ数 */
  entire?: number;

  // 最初のオンチェーンデータTxのみ存在するプロパティ
  /** 複数データ許可 */
  multipul?: boolean;
  /** タイトル */
  title?: string;
  /** 説明 */
  description?: string;

  // vX.X.X 以降で追加 // TODO: バージョン番号
  /**
   * MIMEタイプ
   * @description undefined の場合は Base64 形式データとして扱う
   */
  mime?: string;

  // 最後のオンチェーンデータTxのみ存在するプロパティ
  /** データハッシュ */
  hash?: string;
}
