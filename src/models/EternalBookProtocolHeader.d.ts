export interface EternalBookProtocolHeader {
  version: string; // プロトコルバージョン
  mosaicId: string; // モザイクID
  address: string; // 所有者アドレス
  prevTx: string | null; // 前のトランザクション
  multipul?: boolean; // 複数データ許可(最初のアグリゲートトランザクションのみ)
  title?: string; // タイトル(最初のアグリゲートトランザクションのみ)
  description?: string; // 説明(最初のアグリゲートトランザクションのみ)
  hash?: string; // データハッシュ(最後のアグリゲートトランザクションのみ)
  // v0.3.0 のみ存在
  no?: number; // 現在のデータ番号
  entire?: number; // 全体のデータ数
  // vX.X.X 以降で追加
  // TODO: バージョン番号
  mime?: string; // MIMEタイプ、存在しない場合は Base64 形式データであることを前提とする
}
