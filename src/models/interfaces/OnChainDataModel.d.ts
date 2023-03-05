/**
 * オンチェーンデータ情報
 */
export interface OnChainData {
  /** データタイトル */
  title: string;
  /** データメッセージ */
  description: string;
  /** 書き込み時刻 */
  date: Date;
  /** MIMEタイプ */
  mime: string;
  /** Base64 データ */
  base64: string;
}
