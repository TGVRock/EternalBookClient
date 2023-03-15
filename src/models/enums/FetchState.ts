/**
 * フェッチステータス
 */
export enum FetchState {
  /** 未実行 */
  Undefined = "Undefined",
  /** 実行中 */
  Fetching = "Fetching",
  /** 完了 */
  Complete = "Complete",
  /** エラー */
  Failed = "Failed",
}
