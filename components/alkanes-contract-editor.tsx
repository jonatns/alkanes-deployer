"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Editor from "@monaco-editor/react";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { contracts } from "@/lib/contracts";
import { setupCompletions, validateEditor } from "@/lib/validation";

const LOCAL_STORAGE_KEY = "alkanesContractCode";
const SELECTED_CONTRACT_STORAGE_KEY = "alkanesSelectedContract";
const COMPILER_API = "https://alkanes-compiler-service.fly.dev/compile";

export function AlkanesContractEditor() {
  const [code, setCode] = useState("");
  const [selectedContract, setSelectedContract] = useState("basic");
  const [compileStatus, setCompileStatus] = useState<
    "idle" | "compiling" | "success" | "error"
  >("idle");
  const [compileOutput, setCompileOutput] = useState<string>("");
  const [wasmBase64, setWasmBase64] = useState<string | null>(null);

  useEffect(() => {
    const savedCode = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    const savedSelectedContract = window.localStorage.getItem(
      SELECTED_CONTRACT_STORAGE_KEY
    );
    if (savedCode) {
      setCode(savedCode);
      setSelectedContract("custom");
    } else {
      setCode(contracts.basic);

      if (savedSelectedContract) {
        setSelectedContract(savedSelectedContract);
      }
    }
  }, []);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    // Set up initial validation
    validateEditor(editor, monaco);

    // Set up code completion
    setupCompletions(monaco);

    // Add change listener for continuous validation
    editor.onDidChangeModelContent(() => {
      validateEditor(editor, monaco);
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    setCode(value ?? "");
    if (value) {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, value);
      setSelectedContract("custom");
    }
  };

  const handleContractChange = (value: string) => {
    setSelectedContract(value);
    window.localStorage.setItem(SELECTED_CONTRACT_STORAGE_KEY, value);
    setCode(contracts[value as keyof typeof contracts]);
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const handleCompile = async () => {
    if (!code) return;

    setCompileStatus("compiling");
    setCompileOutput("");

    try {
      const response = await fetch(COMPILER_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Compilation failed");
      }

      setWasmBase64(result.wasm);
      setCompileOutput(
        `Compilation successful!\nWASM size: ${result.size} bytes\n` +
          (result.stdout ? `\nCompiler output:\n${result.stdout}` : "") +
          (result.stderr ? `\nWarnings/Errors:\n${result.stderr}` : "")
      );
      setCompileStatus("success");
    } catch (error) {
      console.error("Compilation error:", error);
      setCompileOutput(
        error instanceof Error
          ? error.message
          : "An error occurred during compilation."
      );
      setCompileStatus("error");
      setWasmBase64(null);
    }
  };

  const handleDownloadWasm = () => {
    if (wasmBase64) {
      const binaryString = window.atob(wasmBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], {
        type: "application/wasm",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "alkanes_contract.wasm";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleDeployContract = () => {};

  return (
    <Card className="p-6 bg-gray-900/50 border-gray-800">
      <div className="mb-4">
        <Select onValueChange={handleContractChange} value={selectedContract}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select a predefined contract" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem disabled value="custom">
              Custom Contract
            </SelectItem>
            <SelectItem value="basic">Basic Contract</SelectItem>
            <SelectItem value="simpleStorage">
              Simple Storage Contract
            </SelectItem>
            <SelectItem value="tokenTransfer">Token Transfer</SelectItem>
            <SelectItem value="orbital">Orbital</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mb-4">
        <Editor
          height="400px"
          defaultLanguage="rust"
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            suggestOnTriggerCharacters: true,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={handleCompile}
          disabled={compileStatus === "compiling"}
        >
          {compileStatus === "compiling" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Compiling...
            </>
          ) : (
            "Compile"
          )}
        </Button>
        {wasmBase64 && (
          <Button onClick={handleDownloadWasm}>Download WASM</Button>
        )}
      </div>
      {compileStatus !== "idle" && (
        <div
          className={`mt-4 p-4 rounded-md ${
            compileStatus === "success"
              ? "bg-green-900/20"
              : compileStatus === "error"
              ? "bg-red-900/20"
              : "bg-blue-900/20"
          }`}
        >
          <h3 className="text-lg font-semibold mb-2">
            {compileStatus === "success" ? "Compilation Successful" : ""}
            {compileStatus === "error" ? "Compilation Error" : ""}
            {compileStatus === "compiling" ? "Compiling..." : ""}
          </h3>
          <pre className="whitespace-pre-wrap overflow-auto max-h-64">
            {compileOutput}
          </pre>
        </div>
      )}
    </Card>
  );
}
