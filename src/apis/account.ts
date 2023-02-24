import { Address } from "symbol-sdk";
import { useEnvironmentStore } from "@/stores/environment";

const environmentStore = useEnvironmentStore();

export async function getMultisigAddresses(
  address: string
): Promise<Address[]> {
  if (
    undefined === environmentStore.accountRepo ||
    undefined === environmentStore.multisigRepo
  ) {
    return [];
  }
  const rawAddress = Address.createFromRawAddress(address);
  const accountInfo = await environmentStore.accountRepo
    .getAccountInfo(rawAddress)
    .toPromise();
  if (undefined === accountInfo) {
    return [];
  }
  const multisigInfo = await environmentStore.multisigRepo
    .getMultisigAccountInfo(accountInfo.address)
    .toPromise();
  if (undefined === multisigInfo || multisigInfo.isMultisig()) {
    return [];
  }
  return multisigInfo.multisigAddresses;
}
