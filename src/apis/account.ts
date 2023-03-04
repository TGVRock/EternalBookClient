import { AccountInfo, Address } from "symbol-sdk";
import { useEnvironmentStore } from "@/stores/environment";

const environmentStore = useEnvironmentStore();

export function isValidAddress(address: string): boolean {
  return Address.isValidRawAddress(address);
}

export async function getAccountInfo(
  address: string
): Promise<AccountInfo | undefined> {
  if (
    typeof environmentStore.accountRepo === "undefined" ||
    !isValidAddress(address)
  ) {
    return undefined;
  }
  if (typeof environmentStore.accountRepo === "undefined") {
    return undefined;
  }
  const rawAddress = Address.createFromRawAddress(address);
  return await environmentStore.accountRepo
    .getAccountInfo(rawAddress)
    .toPromise();
}

export async function getMultisigAddresses(
  address: string
): Promise<Address[]> {
  if (
    typeof environmentStore.multisigRepo === "undefined" ||
    !isValidAddress(address)
  ) {
    return [];
  }
  const accountInfo = await getAccountInfo(address);
  if (typeof accountInfo === "undefined") {
    return [];
  }
  const multisigInfo = await environmentStore.multisigRepo
    .getMultisigAccountInfo(accountInfo.address)
    .toPromise();
  if (typeof multisigInfo === "undefined" || multisigInfo.isMultisig()) {
    return [];
  }
  return multisigInfo.multisigAddresses;
}
