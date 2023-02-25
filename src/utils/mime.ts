export function isImage(mime: string): boolean {
  if (mime.startsWith("image/png") || mime.startsWith("image/jpeg")) {
    return true;
  }
  return false;
}

export function isAudio(mime: string): boolean {
  if (mime.startsWith("audio/mpeg")) {
    return true;
  }
  return false;
}

export function isMovie(mime: string): boolean {
  if (mime.startsWith("video/mp4")) {
    return true;
  }
  return false;
}

export function isHtml(mime: string): boolean {
  // FIXME: セキュリティ的に問題ないことを確認した上で解放する
  return false;
  if (mime.startsWith("text/html")) {
    return true;
  }
  return false;
}

export function getMimeFromBase64(base64: string): string {
  const startIdx = "string" === typeof base64 ? base64.indexOf("data:") : -1;
  const endIdx = -1 < startIdx ? base64.indexOf("base64", startIdx) : -1;
  return -1 < startIdx && -1 < endIdx
    ? base64.substring(startIdx + "data:".length, endIdx - 1)
    : "N/A";
}
