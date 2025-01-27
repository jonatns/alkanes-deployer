import { networks, Provider } from "@oyl/sdk";

export function getProvider() {
  return new Provider({
    url: "https://oylnet.oyl.gg",
    version: "v2",
    projectId: "regtest",
    network: networks.regtest,
    networkType: "regtest",
  });
}
