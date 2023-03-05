import { Buffer } from "buffer";
import { createHash, createDecipheriv, createCipheriv } from "crypto";
import CONSTS from "@/utils/consts";
import { ConsoleLogger } from "./consolelogger";
import type { EternalBookProtocolHeader } from "@/models/EternalBookProtocolHeader";

/** ロガー */
const logger = new ConsoleLogger();

/**
 * 文字列データのハッシュ取得
 * @param strData 文字列データ
 * @returns ハッシュ値(HEX)(処理失敗した場合は undefined)
 */
export function getHash(
  strData: string,
  algorithm: string = CONSTS.CRYPTO_HASH_ALGORITHM
): string | undefined {
  try {
    const hashsum = createHash(algorithm);
    return hashsum.update(strData).digest("hex");
  } catch (error) {
    logger.error("crypto:", "create hash failed", error);
  }
  return undefined;
}

/**
 * EternalBookProtocol ヘッダの暗号化
 * @param header EternalBookProtocol ヘッダ情報
 * @param iv 初期化ベクトル文字列
 * @param algorithm 暗号化アルゴリズム
 * @param key 鍵文字列
 * @returns 暗号化されたヘッダ情報の文字列(処理失敗した場合は undefined)
 */
export function encryptHeader(
  header: EternalBookProtocolHeader,
  iv: string,
  algorithm: string = CONSTS.CRYPTO_CHIPER_ALGORITHM,
  key: string = CONSTS.CRYPTO_IV_DEFAULT
): string | undefined {
  try {
    const cipher = createCipheriv(algorithm, key, iv);
    const cipherData = cipher.update(JSON.stringify(header));
    const encryptedData = Buffer.concat([cipherData, cipher.final()]);
    return encryptedData.toString("hex", 0, encryptedData.length);
  } catch (error) {
    logger.error("crypto:", "crypto header failed", error);
  }
  return undefined;
}

/**
 * EternalBookProtocol ヘッダの復号化
 * @param encryptedDataStr 暗号化データ文字列
 * @param iv 初期化ベクトル文字列
 * @param algorithm 暗号化アルゴリズム
 * @param key 鍵文字列
 * @returns EternalBookProtocol ヘッダ情報(処理失敗した場合は undefined)
 */
export function decryptHeader(
  encryptedDataStr: string,
  iv: string,
  algorithm: string = CONSTS.CRYPTO_CHIPER_ALGORITHM,
  key: string = CONSTS.CRYPTO_IV_DEFAULT
): EternalBookProtocolHeader | undefined {
  try {
    const encryptedData = Buffer.from(encryptedDataStr, "hex");
    const decipher = createDecipheriv(algorithm, key, iv);
    const decipherData = decipher.update(encryptedData);
    const decryptedData = Buffer.concat([decipherData, decipher.final()]);
    return JSON.parse(decryptedData.toString());
  } catch (error) {
    // 復号化失敗の他、無効データ(JSONデータではない or 仕様に合わないJSONデータ)の場合に失敗
    logger.error("crypto:", "decrypto header failed", error);
  }
  return undefined;
}
