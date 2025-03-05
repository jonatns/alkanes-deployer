"use client";

import { useCallback, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import pako from "pako";
import { useDropzone } from "react-dropzone";
import { getProvider } from "@/lib/provider";

import { Account, alkanes, networks, utxo } from "@oyl/sdk";

const RESERVED_NUMBER = 5;

export function TokenDeployForm() {
  const [formData, setFormData] = useState({
    tokenName: "",
    tokenSymbol: "",
    contentType: "none",
    totalSupply: "21000000",
    amountPerMint: "2000",
    reserve: "10000",
    cap: "20000",
    feeRate: 2,
  });

  const [file, setFile] = useState<File | null>(null);
  const [contentType, setContentType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0];
      setFile(uploadedFile);
      setContentType(uploadedFile.type);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    const addresses = await window.oyl?.getAddresses();

    const calldata = [
      BigInt(6),
      BigInt(RESERVED_NUMBER),
      BigInt(0),
      BigInt(formData.reserve ?? 0),
      BigInt(formData.amountPerMint),
      BigInt(formData.cap),
      BigInt(
        "0x" +
          Buffer.from(formData.tokenName.split("").reverse().join("")).toString(
            "hex"
          )
      ),
      BigInt(
        "0x" +
          Buffer.from(
            formData.tokenSymbol.split("").reverse().join("")
          ).toString("hex")
      ),
    ];

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const compressed = pako.gzip(uint8Array, { level: 9 });

      const payload = {
        body: compressed,
        cursed: false,
        tags: { contentType },
      };
    }

    const provider = getProvider();

    const { taproot, nativeSegwit, nestedSegwit, legacy } = addresses;

    const account: Account = {
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

    const { accountSpendableTotalUtxos, accountSpendableTotalBalance } =
      await utxo.accountUtxos({
        account,
        provider,
      });

    try {
      const { psbtHex } = await alkanes.createExecutePsbt({
        calldata,
        gatheredUtxos: {
          utxos: accountSpendableTotalUtxos,
          totalAmount: accountSpendableTotalBalance,
        },
        feeRate: formData.feeRate,
        account,
        provider,
      });

      await window.oyl.signPsbt({
        psbt: psbtHex,
        finalize: true,
        broadcast: true,
      });

      toast.success("Transaction broadcasted!");
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Error deploying token");
      }
    }

    setIsLoading(false);
  };

  return (
    <>
      <Toaster position="bottom-right" />
      <Card className="p-6 bg-gray-900/50 border-gray-800">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex gap-12">
            <div className="space-y-4">
              <div className="space-y-4">
                <Label>Icon</Label>
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <div className="relative w-24 h-24 bg-gray-800 rounded-[20%] cursor-pointer hover:bg-gray-700 transition-colors">
                    {file ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img
                          src={URL.createObjectURL(file) || "/placeholder.svg"}
                          alt="Token icon"
                          className="w-full h-full object-cover rounded-[20%]"
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {file && (
                    <p className="mt-2 text-xs text-gray-400">{file.name}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8 w-full">
              <div>
                <Label htmlFor="tokenName">Token Name</Label>
                <Input
                  required
                  id="tokenName"
                  placeholder="Filled With Air"
                  className="mt-1.5 bg-gray-800/50"
                  value={formData.tokenName}
                  onChange={(e) =>
                    setFormData({ ...formData, tokenName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="tokenSymbol">Token Symbol</Label>
                <Input
                  required
                  id="tokenSymbol"
                  placeholder="Lorem Ipsum"
                  className="mt-1.5 bg-gray-800/50"
                  value={formData.tokenSymbol}
                  onChange={(e) =>
                    setFormData({ ...formData, tokenSymbol: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="totalSupply">Total Supply</Label>
              <Input
                required
                id="totalSupply"
                type="number"
                className="mt-1.5 bg-gray-800/50"
                value={formData.totalSupply}
                onChange={(e) =>
                  setFormData({ ...formData, totalSupply: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="amountPerMint">Amount per mint</Label>
              <Input
                required
                id="amountPerMint"
                type="number"
                className="mt-1.5 bg-gray-800/50"
                value={formData.amountPerMint}
                onChange={(e) =>
                  setFormData({ ...formData, amountPerMint: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="reserve">Reserve (sent to deployer wallet)</Label>
              <Input
                required
                id="reserve"
                type="number"
                className="mt-1.5 bg-gray-800/50"
                value={formData.reserve}
                onChange={(e) =>
                  setFormData({ ...formData, reserve: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="cap">Cap (max amount of mints)</Label>
              <Input
                required
                id="cap"
                type="number"
                className="mt-1.5 bg-gray-800/50"
                value={formData.cap}
                onChange={(e) =>
                  setFormData({ ...formData, cap: e.target.value })
                }
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800">
            {/* <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Transaction fee</span>
              <span className="font-mono">~$6.02</span>
            </div>
            <div className="flex justify-between text-sm mb-6">
              <span>Total</span>
              <div>
                <span className="text-white font-mono">$11.28</span>
                <span className="text-gray-400 ml-2 font-mono">≈0.102 ETH</span>
              </div>
            </div> */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deploying...
                </>
              ) : (
                "Deploy Token"
              )}
            </Button>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        </form>
      </Card>
    </>
  );
}
