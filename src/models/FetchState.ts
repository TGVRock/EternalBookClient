/**
 * フェッチステータス
 */
export enum FetchState {
  /** 未実行 */
  Undefined = "Undefined",
  /** エラー */
  Invalid = "Invalid",
  /** 実行中 */
  Fetching = "Fetching",
  /** 完了 */
  Complete = "Complete",
}
