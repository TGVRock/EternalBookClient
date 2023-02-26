/**
 * boolean to string
 *
 * @param b target boolean
 * @returns "true" or "false"
 */
export function b2s(b: boolean): string {
  return b ? "true" : "false";
}

/**
 * string to boolean
 *
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

export function ConvertHumanReadableByteDataSize(size: number): string {
  return size.toLocaleString("en");
}
