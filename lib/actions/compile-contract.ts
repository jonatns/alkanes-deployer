"use server";

import init, { compile } from "wasm-pack";

export async function compileContract(
  code: string
): Promise<{ success: boolean; output: string; wasmBase64?: string }> {
  try {
    // Initialize wasm-pack
    await init();

    // Compile the Rust code to WebAssembly
    const result = await compile(code, "wasm32-unknown-unknown");

    if (result.stderr) {
      return { success: false, output: result.stderr };
    }

    // Convert the Wasm binary to a base64 string
    const wasmBase64 = Buffer.from(result.wasm).toString("base64");

    return {
      success: true,
      output: "Compilation successful. WASM file generated.",
      wasmBase64,
    };
  } catch (error) {
    console.error("Compilation error:", error);
    return { success: false, output: "An error occurred during compilation." };
  }
}
