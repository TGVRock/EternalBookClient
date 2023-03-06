import type { UInt64 } from "symbol-sdk";
import { useI18n } from "vue-i18n";
import { WriteProgress } from "@/models/enums/WriteProgress";

/**
 * boolean to string
 * @param b target boolean
 * @returns "true" or "false"
 */
export function b2s(b: boolean): string {
  return b ? "true" : "false";
}

/**
 * string to boolean
 * @param s target string
 * @returns boolean
 */
export function s2b(s: string): boolean {
  switch (s) {
    case "true":
    case "1":
      return true;
    default:
      return false;
  }
}

/**
 * 数値を3桁カンマ区切りの文字列に変換する
 * @param size バイトサイズ
 * @returns 3桁カンマ区切りのバイトサイズ
 */
export function ConvertHumanReadableByteDataSize(size: number): string {
  return size.toLocaleString("en");
}

/**
 * Txのタイムスタンプから実時間のタイムスタンプに変換する
 * @param epochAdjustment ネットワークのエポック調整
 * @param txTimestamp Txタイムスタンプ
 * @returns 実時間のタイムスタンプ
 */
export function ConvertRealTimestampFromTxTimestamp(
  epochAdjustment: number,
  txTimestamp: UInt64
): number {
  return epochAdjustment * 1000 + Number(txTimestamp.toString());
}

/**
 * 書き込み状況に対応したメッセージを取得する
 * @param progress 書き込み状況
 * @returns 対応メッセージ
 */
export function getWriteProgreassMessage(progress: WriteProgress): string {
  const i18n = useI18n();
  switch (progress) {
    case WriteProgress.Preprocess:
      return i18n.t("message.processing");
    case WriteProgress.LockSigning:
      return i18n.t("message.lockSigning");
    case WriteProgress.LockAnnounced:
      return i18n.t("message.lockAnnounced");
    case WriteProgress.LockUnconfirmed:
      return i18n.t("message.lockUnconfirmed");
    case WriteProgress.LockConfirmed:
      return i18n.t("message.lockConfirmed");
    case WriteProgress.TxSigning:
      return i18n.t("message.txSigning");
    case WriteProgress.TxAnnounced:
      return i18n.t("message.txAnnounced");
    case WriteProgress.TxWaitCosign:
      return i18n.t("message.txWaitCosign");
    case WriteProgress.TxUnconfirmed:
      return i18n.t("message.txUnconfirmed");
    case WriteProgress.TxConfirmed:
      return i18n.t("message.txConfirmed");
    case WriteProgress.Complete:
      return i18n.t("message.complete");
    case WriteProgress.Failed:
      return i18n.t("message.failed");
    case WriteProgress.Standby:
    default:
      return i18n.t("message.prepare");
  }
}
