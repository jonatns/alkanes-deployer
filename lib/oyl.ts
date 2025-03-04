import { Account, networks, Provider } from "@oyl/sdk";

export function getOyl() {
  if (typeof window.oyl !== "undefined") {
    return window.oyl;
  }
}

export function getProvider() {
  return new Provider({
    url: "https://oylnet.oyl.gg",
    version: "v2",
    projectId: "regtest",
    network: networks.regtest,
    networkType: "regtest",
  });
}

export function addressesToAccount(
  addresses: Awaited<ReturnType<Window["oyl"]["getAddresses"]>>
): Account {
  const { taproot, nativeSegwit, nestedSegwit, legacy } = addresses;

  return {
    taproot: {
      address: taproot.address,
      pubkey: taproot.publicKey,
      pubKeyXOnly: "",
      hdPath: "",
    },
    nativeSegwit: {
      address: nativeSegwit.address,
      pubkey: nativeSegwit.publicKey,
      hdPath: "",
    },
    nestedSegwit: {
      address: nestedSegwit.address,
      pubkey: nestedSegwit.publicKey,
      hdPath: "",
    },
    legacy: {
      address: legacy.address,
      pubkey: legacy.publicKey,
      hdPath: "",
    },
    spendStrategy: {
      addressOrder: ["nativeSegwit", "nestedSegwit", "legacy", "taproot"],
      utxoSortGreatestToLeast: true,
      changeAddress: "nativeSegwit",
    },
    network: networks.regtest,
  };
}
