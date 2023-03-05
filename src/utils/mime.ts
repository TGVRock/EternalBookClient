import CONSTS from "./consts";
import { ConsoleLogger } from "./consolelogger";

/** ロガー */
const logger = new ConsoleLogger();

/**
 * 対応する画像データかどうか
 * @param mime MIMEタイプ
 * @returns true: 対応する画像データ, false: それ以外
 */
export function isImage(mime: string): boolean {
  if (mime.startsWith("image/png") || mime.startsWith("image/jpeg")) {
    return true;
  }
  return false;
}

/**
 * 対応する音源データかどうか
 * @param mime MIMEタイプ
 * @returns true: 対応する音源データ, false: それ以外
 */
export function isAudio(mime: string): boolean {
  if (mime.startsWith("audio/mpeg")) {
    return true;
  }
  return false;
}

/**
 * 対応する動画データかどうか
 * @param mime MIMEタイプ
 * @returns true: 対応する動画データ, false: それ以外
 */
export function isMovie(mime: string): boolean {
  if (mime.startsWith("video/mp4")) {
    return true;
  }
  return false;
}

/**
 * 対応するHTMLデータかどうか
 * @param mime MIMEタイプ
 * @returns true: 対応するHTMLデータ, false: それ以外
 */
export function isHtml(mime: string): boolean {
  // FIXME: セキュリティ的に問題ないことを確認した上で解放する
  return false;
  if (mime.startsWith("text/html")) {
    return true;
  }
  return false;
}

/**
 * Base64形式データからMIMEタイプを取得する
 * @param base64 Base64形式データ
 * @returns MIMEタイプ
 */
export function getMimeFromBase64(base64: string): string {
  if (base64.length === 0) {
    return CONSTS.STR_NA;
  }
  const matchResult = base64.match("^data:(.*?);base64,(.*)$");
  if (matchResult?.length !== 3) {
    logger.error(
      "get MIME from Base64",
      "invalid base64 format.",
      "32 characters from the beginning:",
      base64.substring(0, 32)
    );
    return CONSTS.STR_NA;
  }
  return matchResult[1];
}

// TODO: Base64形式データから直接対応するデータかどうか判別できないか？(そうなるとis***()ではなくEnum形式か)
