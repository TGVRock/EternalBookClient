import { type Address, Listener } from "symbol-sdk";
import { useEnvironmentStore } from "@/stores/environment";

// Stores
const envStore = useEnvironmentStore();

/**
 * 特定Txのリスナーオープン
 * @description 対象Txが承認済になったら自動でクローズされる
 * @param key キー
 * @param address 監視対象アドレス
 * @param txHash 監視対象Txハッシュ
 * @param bondedCallback アグリゲートボンデッド検知時のコールバック
 * @param unconfirmedCallback 未承認検知時のコールバック
 * @param confirmedCallback 承認検知時のコールバック
 * @param errorCallback エラー発生時のコールバック
 * @returns オープン済のリスナー
 */
export async function openTxListener(
  key: string,
  address: Address,
  txHash: string,
  bondedCallback?: (...params: any) => void,
  unconfirmedCallback?: (...params: any) => void,
  confirmedCallback?: (...params: any) => void,
  errorCallback?: (...params: any) => void
): Promise<Listener | undefined> {
  const logTitle = "open listener:";
  envStore.logger.debug(logTitle, key, "start");

  // リポジトリチェック
  if (typeof envStore.namespaceRepo === "undefined") {
    envStore.logger.error(logTitle, key, "repository undefined.");
    return undefined;
  }

  // リスナー設定
  const txListener = new Listener(
    envStore.wsEndpoint,
    envStore.namespaceRepo,
    WebSocket
  );
  await txListener
    .open()
    .then(() => {
      envStore.logger.debug(logTitle, key, "listener opened.");

      // 切断軽減のためのブロック生成検知
      txListener.newBlock();

      // Txステータス
      txListener.status(address, txHash).subscribe((status) => {
        envStore.logger.error(logTitle, key, "tx status:", status);
        if (typeof errorCallback !== "undefined") {
          errorCallback();
        }
        // リスナーをクローズ
        txListener.close();
      });

      // アグリゲートボンデッドTx検知
      txListener.aggregateBondedAdded(address, txHash).subscribe(() => {
        envStore.logger.debug(logTitle, key, "tx aggregate bonded added");
        if (typeof bondedCallback !== "undefined") {
          bondedCallback();
        }
      });

      // Tx未承認検知
      txListener.unconfirmedAdded(address, txHash).subscribe(() => {
        envStore.logger.debug(logTitle, key, "tx unconfirmed added");
        if (typeof unconfirmedCallback !== "undefined") {
          unconfirmedCallback();
        }
      });

      // Tx承認検知
      txListener.confirmed(address, txHash).subscribe(async () => {
        envStore.logger.debug(logTitle, key, "tx confirmed");
        if (typeof confirmedCallback !== "undefined") {
          confirmedCallback();
        }
        // リスナーをクローズ
        txListener.close();
      });
    })
    .catch((error) => {
      envStore.logger.error(logTitle, key, "failed.", error);
      return undefined;
    });

  envStore.logger.debug(logTitle, key, "end");
  return txListener;
}
