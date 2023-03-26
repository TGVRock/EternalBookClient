import type { MosaicId } from "symbol-sdk";

/**
 * モザイクアイテム情報
 */
export interface MosaicItem {
  /** モザイクID */
  id: MosaicId;
  /** エイリアス */
  alias: string;
}
