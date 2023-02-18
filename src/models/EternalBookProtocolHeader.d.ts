export interface EternalBookProtocolHeader {
  version: string; // プロトコルバージョン
  mosaicId: string; // モザイクID
  address: string; // 所有者アドレス
  prevTx: string | null; // 前のトランザクション
  no: number; // 現在のデータ番号
  entire: number; // 全体のデータ数
  multipul?: boolean; // 複数データ許可(最初のアグリゲートトランザクションのみ)
  title?: string; // タイトル(最初のアグリゲートトランザクションのみ)
  description?: string; // 説明(最初のアグリゲートトランザクションのみ)
  hash?: string; // データハッシュ(最後のアグリゲートトランザクションのみ)
}
