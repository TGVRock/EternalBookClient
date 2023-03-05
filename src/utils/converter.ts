import type { UInt64 } from "symbol-sdk";

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
