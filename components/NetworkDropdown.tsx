import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function NetworkDropdown() {
  const [network, setNetwork] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let retryInterval: NodeJS.Timeout | null = null;

    const fetchNetwork = async () => {
      try {
        if (typeof window.oyl !== "undefined") {
          const isConnected = await window.oyl.isConnected();

          if (isConnected) {
            const currentNetwork = await window.oyl.getNetwork();
            if (isMounted && currentNetwork) {
              setNetwork(currentNetwork);
              setIsLoading(false);
              if (retryInterval) clearInterval(retryInterval);
            }
          } else {
            if (!retryInterval && isMounted) {
              retryInterval = setInterval(fetchNetwork, 2000);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching network:", error);

        if (!retryInterval && isMounted) {
          retryInterval = setInterval(fetchNetwork, 2000);
        }
      }
    };

    fetchNetwork();

    if (!retryInterval) {
      retryInterval = setInterval(fetchNetwork, 2000);
    }

    return () => {
      isMounted = false;
      if (retryInterval) clearInterval(retryInterval);
    };
  }, []);

  const switchNetwork = async (newNetwork: string) => {
    try {
      await window.oyl.switchNetwork(newNetwork);
      setNetwork(newNetwork);
    } catch (error) {
      console.error("Error switching network:", error);
    }
  };

  return (
    <Select value={network} onValueChange={switchNetwork} disabled={isLoading}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={isLoading ? "Loading..." : "Network"} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="mainnet">Mainnet</SelectItem>
          <SelectItem value="testnet">Testnet</SelectItem>
          <SelectItem value="signet">Signet</SelectItem>
          <SelectItem value="regtest">Oylnet</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
