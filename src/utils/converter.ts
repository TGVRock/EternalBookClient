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

/**
 * timestamp to Date
 *
 * @param b target timestamp
 * @returns "true" or "false"
 */
export function t2d(t: number): string {
  const dateTime = new Date(t);
  return (
    dateTime.toLocaleDateString("ja-JP") +
    " " +
    dateTime.toLocaleTimeString("ja-JP")
  );
}

export function ConvertHumanReadableByteDataSize(size: number): string {
  return size.toLocaleString("en");
}
