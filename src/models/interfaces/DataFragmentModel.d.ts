/**
 * データフラグメント情報
 */
export interface DataFragment {
  /** Txハッシュ */
  hash: string;
  /** タイムスタンプ */
  timestamp: Date;
  /** ヘッダ情報 */
  header: EternalBookProtocolHeader;
  /** データ */
  data: string;
}
