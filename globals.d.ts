export interface OylAddresses {
  taproot: Taproot;
  nativeSegwit: NativeSegwit;
  nestedSegwit: NestedSegwit;
  legacy: Legacy;
}

export interface Taproot {
  address: string;
  publicKey: string;
}

export interface NativeSegwit {
  address: string;
  publicKey: string;
}

export interface NestedSegwit {
  address: string;
  publicKey: string;
}

export interface Legacy {
  address: string;
  publicKey: string;
}

declare global {
  interface Window {
    oyl: {
      isConnected(): Promise<boolean>;
      getNetwork(): Promise<string>;
      switchNetwork(network: string): Promise<void>;
      getAddresses(): Promise<OylAddresses>;
      signPsbt(params: {
        psbt: string;
        broadcast?: boolean;
        finalize?: boolean;
      }): Promise<{
        psbt: string;
        txid?: string;
      }>;
    };
  }
}
