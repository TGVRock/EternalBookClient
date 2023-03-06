/**
 * 書き込み進捗
 */
export enum WriteProgress {
  /** スタンバイ */
  Standby = "Standby",
  /** Tx作成中 */
  Preprocess = "Preprocess",
  /** ハッシュロックアナウンス完了 */
  LockAnnounced = "LockAnnounced",
  /** ハッシュロック署名待ち */
  LockSigning = "LockSigning",
  /** ハッシュロック未承認 */
  LockUnconfirmed = "LockUnconfirmed",
  /** ハッシュロック承認済 */
  LockConfirmed = "LockConfirmed",
  /** Tx署名待ち */
  TxSigning = "TxSigning",
  /** Txアナウンス完了 */
  TxAnnounced = "TxAnnounced",
  /** Tx連署待ち */
  TxWaitCosign = "TxWaitCosign",
  /** Tx未承認 */
  TxUnconfirmed = "TxUnconfirmed",
  /** Tx承認済 */
  TxConfirmed = "TxConfirmed",
  /** 完了 */
  Complete = "Complete",
  /** エラー */
  Failed = "Failed",
}
