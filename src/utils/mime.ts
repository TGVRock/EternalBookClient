import { Buffer } from "buffer";
import { fileTypeFromBuffer } from "file-type";
import CONSTS from "./consts";
import { ConsoleLogger } from "./consolelogger";
import { ChainDataType } from "@/models/enums/ChainDataType";

/** ロガー */
const logger = new ConsoleLogger();

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
 * MIMEタイプからオンチェーンデータタイプを取得
 * @param mime MIMEタイプ
 * @returns オンチェーンデータタイプ
 */
export function getChainDataType(mime: string): ChainDataType {
  switch (mime) {
    case "image/png": // PNG (Portable Network Graphics)
    case "image/jpeg": // JPEG (Joint Photographic Expert Group image)
    case "image/gif": // GIF (Graphics Interchange Format)
    case "image/webp": // WebP (Web Picture format)
    case "image/apng": // APNG (Animated Portable Network Graphics)
    case "image/avif": // AVIF (AV1 Image File Format)
    case "image/bmp": // BMP ビットマップファイル
      return ChainDataType.Image;

    case "audio/wave": // WAVE (Waveform Audio File Format)
    case "audio/wav": // WAVE
    case "audio/x-wav": // WAVE
    case "audio/x-pn-wav": // WAVE
    case "audio/webm": // WebM (Web Media)
    case "audio/mpeg": // MPEG (Moving Picture Experts Group) 音声
    case "audio/mp4": // MPEG-4 音声
    case "audio/flac": // FLAC (Free Lossless Audio Codec)
    case "audio/3gpp": // 3GP (Third Generation Partnership) 音声
    case "audio/3gpp2": // 3GP 音声
    case "audio/3gp2": // 3GP 音声
    case "audio/ogg": // Ogg 音声
    case "audio/vnd.dolby.dd-raw": // ac3 (ドルビーデジタル (Audio Code number 3))
      return ChainDataType.Audio;

    case "video/webm": // WebM (Web Media)
    case "video/mpeg": // MPEG (Moving Picture Experts Group) 映像
    case "video/mp4": // MPEG-4 映像
    case "video/3gpp": // 3GP (Third Generation Partnership) 映像
    case "video/3gpp2": // 3GP 映像
    case "video/3gp2": // 3GP 映像
    case "video/ogg": // Ogg 映像
    case "video/quicktime": // Apple QuickTime movie
      return ChainDataType.Movie;

    case "model/gltf-binary": // GLB
      return ChainDataType.Model;

    case "application/pdf": // PDF
      return ChainDataType.Pdf;

    default:
      break;
  }
  return ChainDataType.Unavailable;
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

/**
 * Base64形式データからMIMEタイプを取得する
 * @param dataUrl Base64形式データ
 * @returns MIMEタイプ
 */
export async function getMimeFromDataUrl(dataUrl: string): Promise<string> {
  if (dataUrl.length === 0) {
    return CONSTS.STR_NA;
  }

  const buffer = Buffer.from((dataUrl as string).split(",")[1], "base64");
  const result = await fileTypeFromBuffer(buffer);
  if (typeof result === "undefined") {
    return getMimeFromBase64(dataUrl);
  }
  return result.mime as string;
}
