/**
 * SSSステータス
 */
export enum SSSState {
  /** 未連携 */
  Unlinked = "Unlinked",
  /** スタンバイ */
  Standby = "Standby",
  /** ユーザーの署名待ち中 */
  Signing = "Signing",
  /** 署名失敗 */
  Failed = "Failed",
  /** 署名完了 */
  Complete = "Complete",
}
