import { createHash, createDecipheriv, createCipheriv } from "crypto";
import CONSTS from "@/utils/consts";
import type { EternalBookProtocolHeader } from "@/models/EternalBookProtocolHeader";
import { Buffer } from "buffer";

export function getHash(onChainData: string): string {
  const hashsum = createHash(CONSTS.CRYPTO_HASH_ALGORITHM);
  return hashsum.update(onChainData).digest("hex");
}

export function cryptoHeader(
  mosaicIdStr: string,
  header: EternalBookProtocolHeader,
  iv: string = CONSTS.CRYPTO_IV_DEFAULT
): string | undefined {
  try {
    const cipher = createCipheriv(
      CONSTS.CRYPTO_CHIPER_ALGORITHM,
      iv,
      mosaicIdStr
    );
    const cipherData = cipher.update(JSON.stringify(header));
    const encryptedData = Buffer.concat([cipherData, cipher.final()]);
    return encryptedData.toString("hex", 0, encryptedData.length);
  } catch (error) {
    // 暗号化失敗
    // console.log(error);
  }
  return undefined;
}

export function decryptoHeader(
  mosaicIdStr: string,
  encryptoDataStr: string,
  iv: string = CONSTS.CRYPTO_IV_DEFAULT
): EternalBookProtocolHeader | undefined {
  try {
    const encryptedData = Buffer.from(encryptoDataStr, "hex");
    const decipher = createDecipheriv(
      CONSTS.CRYPTO_CHIPER_ALGORITHM,
      iv,
      mosaicIdStr
    );
    const decipherData = decipher.update(encryptedData);
    const decryptedData = Buffer.concat([decipherData, decipher.final()]);
    return JSON.parse(decryptedData.toString());
  } catch (error) {
    // 仕様に合わない暗号化データのため無効データと判定する
    // console.log(error);
  }
  return undefined;
}
