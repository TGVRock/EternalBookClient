import { Address } from "symbol-sdk";
import { useEnvironmentStore } from "@/stores/environment";

const environmentStore = useEnvironmentStore();

export async function getMultisigAddresses(
  address: string
): Promise<Address[]> {
  if (
    typeof environmentStore.accountRepo === "undefined" ||
    typeof environmentStore.multisigRepo === "undefined"
  ) {
    return [];
  }
  const rawAddress = Address.createFromRawAddress(address);
  const accountInfo = await environmentStore.accountRepo
    .getAccountInfo(rawAddress)
    .toPromise();
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
