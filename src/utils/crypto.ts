import { createHash, createDecipheriv } from "crypto";
import { HASH_ALGORITHM, CHIPER_ALGORITHM, DEFAULT_IV } from "@/utils/consts";
import type { EternalBookProtocolHeader } from "@/models/EternalBookProtocolHeader";
import { Buffer } from "buffer";

export function getHash(onChainData: string): string {
  const hashsum = createHash(HASH_ALGORITHM);
  return hashsum.update(onChainData).digest("hex");
}

export function decryptoHeader(
  mosaicIdStr: string,
  encryptoDataStr: string,
  iv: string = DEFAULT_IV
): EternalBookProtocolHeader | undefined {
  try {
    const encryptedData = Buffer.from(encryptoDataStr, "hex");
    const decipher = createDecipheriv(CHIPER_ALGORITHM, iv, mosaicIdStr);
    const decipherData = decipher.update(encryptedData);
    const decryptedData = Buffer.concat([decipherData, decipher.final()]);
    return JSON.parse(decryptedData.toString());
  } catch (error) {
    // 仕様に合わない暗号化データのため無効データと判定する
    // console.log(error);
  }
  return undefined;
}
