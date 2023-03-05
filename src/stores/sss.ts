import { ref, watch } from "vue";
import { defineStore } from "pinia";
import type { SSSWindow } from "sss-module";
import { useEnvironmentStore } from "./environment";
import CONSTS from "@/utils/consts";
import type { SignedTransaction, Transaction } from "symbol-sdk";
import { SSSState } from "@/models/SSSState";
declare const window: SSSWindow;

/**
 * SSS連携ストア
 */
export const useSSSStore = defineStore("sss", () => {
  // Other Stores
  const envStore = useEnvironmentStore();

  /** SSS連携 */
  const sssLinked = ref(isSSSEnable());
  /** 連携アドレス */
  const address = ref(getAddress());
  /** ステータス */
  const state = ref<SSSState>(SSSState.Unlinked);

  // 初期状態更新
  updateState(SSSState.Standby);
  // アクセス直後はSSS連携が完了していない場合があるため、SSS連携できていない場合は連携状態を一定時間監視する
  if (!sssLinked.value) {
    // 定周期でSSS連携状態を確認
    const checkSSSLinked = setInterval(() => {
      // SSS連携されたら定周期確認を終了
      if (isSSSEnable()) {
        sssLinked.value = true;
        clearInterval(checkSSSLinked);
      }
    }, CONSTS.SSS_CONFIRM_INTERVAL_MSEC);
    // 一定時間待っても連携されない場合は定周期確認を終了
    setTimeout(() => {
      clearInterval(checkSSSLinked);
    }, CONSTS.SSS_INIITALIZE_WAIT_MSEC);
  }

  /**
   * SSS連携されているか
   * @returns true: 連携済, false: 未連携
   */
  function isSSSEnable(): boolean {
    return typeof window.SSS !== "undefined";
  }

  /**
   * SSS状態更新
   * @param status ステータス
   * @returns なし
   */
  function updateState(status: SSSState): void {
    if (!sssLinked.value) {
      state.value = SSSState.Unlinked;
      return;
    }
    state.value = status;
  }

  /**
   * スタンバイ状態か
   * @returns true: スタンバイ状態, false: 署名中または署名後の待ち
   */
  function isStanby(): boolean {
    switch (state.value) {
      case SSSState.Signing:
      case SSSState.Failed:
      case SSSState.Complete:
        return false;
      case SSSState.Unlinked:
      case SSSState.Standby:
      default:
        return true;
    }
  }

  /**
   * SSS連携されているアクティブアドレスを取得
   * @returns アクティブアドレス
   */
  function getAddress(): string {
    return window.SSS.activeAddress || "";
  }

  /**
   * SSS連携されているアカウントのネットワークタイプを取得
   * @returns アクティブネットワークタイプ
   */
  function getNetworkType(): number {
    return window.SSS.activeNetworkType || CONSTS.NETWORKTYPE_INVALID;
  }

  /**
   * SSSによるTx署名
   * @param tx 未署名Tx
   * @returns 署名済Tx
   */
  async function requestTxSign(
    tx: Transaction
  ): Promise<SignedTransaction | undefined> {
    const logTitle = "sss request sign:";
    envStore.logger.debug(logTitle, "start", sssLinked.value);
    if (!sssLinked.value) {
      envStore.logger.error(logTitle, "sss not enables.");
      return undefined;
    }

    // スタンバイ状態になるまで待ち
    // HACK: 短時間で連続してSSS署名しようとするとウィンドウが表示されなくなる
    const waitResult = await new Promise<boolean>((resolve) => {
      const logTitle = "sss signing wait:";
      // 未連携状態の場合は即時終了
      if (state.value === SSSState.Unlinked) {
        envStore.logger.error(logTitle, "sss unlinked.");
        resolve(false);
        return;
      }
      // 既にスタンバイ状態の場合は終了
      if (isStanby()) {
        envStore.logger.debug(logTitle, "already standby.");
        resolve(true);
        return;
      }
      // 定周期で状態を監視し、スタンバイ状態になったら終了する
      const stateChecker = setInterval(() => {
        envStore.logger.debug(logTitle, "interval:", state.value);
        if (isStanby()) {
          clearTimeout(roopChecker);
          clearInterval(stateChecker);
          resolve(true);
        }
      }, 1000);
      // 無限待ちを避けるため、SSSで署名されずにrejectされる時間が経ったら終了
      const roopChecker = setTimeout(() => {
        envStore.logger.error(logTitle, "not set standby.", state.value);
        clearInterval(stateChecker);
        resolve(false);
      }, CONSTS.SSS_SIGN_REJECT_WAIT_MSEC);
    });
    if (!waitResult) {
      envStore.logger.error(logTitle, "signing wait error.");
      return undefined;
    }

    // SSS署名
    updateState(SSSState.Signing);
    window.SSS.setTransaction(tx);
    return await window.SSS.requestSign()
      .then((value) => {
        envStore.logger.debug(logTitle, "success.", value);
        // 状態更新、一定時間後にスタンバイ状態に戻す
        updateState(SSSState.Complete);
        setTimeout((): void => {
          updateState(SSSState.Standby);
        }, CONSTS.SSS_AFTER_SIGNED_WAIT_MSEC);
        return value;
      })
      .catch((error) => {
        // TODO: SSSウィンドウが表示されない場合の対処
        envStore.logger.error(logTitle, "failed.", error);
        // 状態更新、一定時間後にスタンバイ状態に戻す
        updateState(SSSState.Failed);
        setTimeout((): void => {
          updateState(SSSState.Standby);
        }, CONSTS.SSS_AFTER_SIGNED_WAIT_MSEC);
        return undefined;
      });
  }

  // Watch
  watch(
    sssLinked,
    (): void => {
      const logTitle = "sss store watch:";
      envStore.logger.debug(logTitle, "start", sssLinked.value);
      if (sssLinked.value) {
        envStore.networkType = getNetworkType();
      }
      address.value = getAddress();
      updateState(SSSState.Standby);
      envStore.logger.debug(logTitle, "end");
    },
    { immediate: true }
  );

  // Exports
  return {
    sssLinked,
    address,
    requestTxSign,
  };
});
