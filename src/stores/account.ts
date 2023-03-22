import { ref, watch } from "vue";
import { defineStore } from "pinia";
import type {
  Account,
  AccountInfo,
  Address,
  Mosaic,
  MosaicId,
  MultisigAccountInfo,
} from "symbol-sdk";
import { useSettingsStore } from "./settings";
import { useSSSStore } from "./sss";
import {
  createAccountFromPrivateKey,
  getAccountInfo,
  getMultisigInfo,
  isValidAddress,
} from "@/apis/account";
import { useChainStore } from "./chain";
import type { MosaicItem } from "@/models/interfaces/MosaicItemModel";
import { getMosaicsAboutCreatedAddress } from "@/apis/mosaic";
import { getMosaicsNames } from "@/apis/namespace";

/**
 * 署名アカウント情報ストア
 */
export const useAccountStore = defineStore("account", () => {
  // Other Stores
  const settingsStore = useSettingsStore();
  const chainStore = useChainStore();
  const sssStore = useSSSStore();

  /** アドレス文字列 */
  const addressStr = ref("");
  /** アカウント */
  const account = ref<Account | undefined>(undefined);
  /** アカウント情報 */
  const accountInfo = ref<AccountInfo | undefined>(undefined);
  /** マルチシグアカウント情報 */
  const multisigInfo = ref<MultisigAccountInfo | undefined>(undefined);
  /** 作成モザイク */
  const createdMosaics = ref<Array<MosaicItem>>([]);
  /** 所有モザイク */
  const owendMosaics = ref<Array<MosaicItem>>([]);

  // Watch
  watch(
    [
      () => settingsStore.privateKey,
      () => settingsStore.useSSS,
      () => sssStore.sssLinked,
    ],
    (): void => {
      const logTitle = "account store watch (settings):";
      settingsStore.logger.debug(logTitle, "start");

      // アドレス設定
      addressStr.value = "";
      account.value = undefined;
      if (sssStore.sssLinked && settingsStore.useSSS) {
        settingsStore.logger.debug(logTitle, "sss address.");
        addressStr.value = sssStore.address;
      } else if (settingsStore.privateKey.length > 0) {
        settingsStore.logger.debug(logTitle, "private key account.");
        account.value = createAccountFromPrivateKey(
          settingsStore.privateKey,
          chainStore.networkType
        );
        if (typeof account.value === "undefined") {
          settingsStore.logger.error(logTitle, "create account failed.");
          return;
        }
        addressStr.value = account.value.address.plain();
      } else {
        settingsStore.logger.debug(logTitle, "address not settings.");
      }
      settingsStore.logger.debug(logTitle, "end");
    },
    { immediate: true }
  );
  watch(
    addressStr,
    (): void => {
      const logTitle = "account store watch (address):";
      settingsStore.logger.debug(logTitle, "start", addressStr.value);

      // アカウント情報の初期化
      accountInfo.value = undefined;
      multisigInfo.value = undefined;
      if (!isValidAddress(addressStr.value)) {
        settingsStore.logger.error(logTitle, "address invalid.");
        return;
      }

      // アカウント情報の取得
      getAccountInfo(addressStr.value)
        .then((value) => {
          accountInfo.value = value;
        })
        .catch((error) => {
          settingsStore.logger.error(
            logTitle,
            "get account info failed.",
            error
          );
          accountInfo.value = undefined;
        });

      // マルチシグアカウント情報の取得
      getMultisigInfo(addressStr.value)
        .then((value) => {
          multisigInfo.value = value;
        })
        .catch((error) => {
          settingsStore.logger.error(
            logTitle,
            "get multisig info failed.",
            error
          );
          multisigInfo.value = undefined;
        });
      settingsStore.logger.debug(logTitle, "end");
    },
    { immediate: true }
  );
  watch(
    accountInfo,
    (): void => {
      const logTitle = "account store watch (account info):";
      settingsStore.logger.debug(logTitle, "start", accountInfo.value);

      // アカウント情報の取得
      createdMosaics.value = [];
      owendMosaics.value = [];
      if (typeof accountInfo.value === "undefined") {
        settingsStore.logger.error(logTitle, "account info invalid.");
        return;
      }
      const address = accountInfo.value.address as Address;

      // 指定アドレスで作成したモザイク一覧を取得
      getMosaicsAboutCreatedAddress(address)
        .then(async (value) => {
          // 作成モザイク一覧を作成
          const mosaicIds: Array<MosaicId> = [];
          value.forEach((info) => {
            mosaicIds.push(info.id);
          });
          getMosaicsNames(mosaicIds)
            .then((value) => {
              mosaicIds.forEach((id) => {
                const name = value.find((name) => name.mosaicId.equals(id));
                const alias =
                  typeof name === "undefined" || name.names.length === 0
                    ? ""
                    : name?.names[0].name;
                createdMosaics.value.push({
                  id: id,
                  alias: alias,
                });
              });
            })
            .catch((error) => {
              settingsStore.logger.error(
                logTitle,
                "get mosaics names failed.",
                error
              );
              owendMosaics.value = [];
            });
        })
        .catch((error) => {
          settingsStore.logger.error(logTitle, "get mosaics failed.", error);
          createdMosaics.value = [];
        });

      // 所有モザイク一覧を作成
      const mosaicIds: Array<MosaicId> = [];
      accountInfo.value.mosaics.forEach((info) => {
        mosaicIds.push((info as Mosaic).id as MosaicId);
      });
      getMosaicsNames(mosaicIds)
        .then((value) => {
          mosaicIds.forEach((id) => {
            const name = value.find((name) => name.mosaicId.equals(id));
            const alias =
              typeof name === "undefined" || name.names.length === 0
                ? ""
                : name?.names[0].name;
            owendMosaics.value.push({
              id: id,
              alias: alias,
            });
          });
        })
        .catch((error) => {
          settingsStore.logger.error(
            logTitle,
            "get mosaics names failed.",
            error
          );
          owendMosaics.value = [];
        });
      settingsStore.logger.debug(logTitle, "end");
    },
    { immediate: true }
  );

  // Exports
  return {
    addressStr,
    accountInfo,
    multisigInfo,
    createdMosaics,
    owendMosaics,
  };
});
