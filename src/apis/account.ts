import { defineStore } from "pinia";
import { Account } from "symbol-sdk";
import { useEnvironmentStore } from "@/stores/environment";

const environmentStore = useEnvironmentStore();

export const useAccountStore = defineStore("account", () => {
  function createAccount(): Account {
    return Account.generateNewAccount(environmentStore.networkType);
  }

  return { createAccount };
});
