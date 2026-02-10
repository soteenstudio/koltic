import fs from "fs";
import path from "path";

export function loadWasm(filename: string) {
  const filePath = path.resolve("assembly/dist", filename);
  const buffer = fs.readFileSync(filePath);

  // Compile module secara sinkron
  const module = new WebAssembly.Module(buffer);

  // Bikin Import Object buat "nyuapin" kebutuhan runtime AssemblyScript
  const importObject = {
    env: {
      // Fungsi wajib kalau lo pake 'throw new Error' atau 'assert' di AS
      abort(message: number, fileName: number, line: number, column: number): void {
        console.error(`[Wasm Abort] di ${fileName}:${line}:${column}`);
      },
      // Fungsi opsional kalau lo pake trace() buat debugging di AS
      trace(message: number, n: number): void {
        console.log(`[Wasm Trace] pointer: ${message}, value: ${n}`);
      }
    }
  };

  // Masukin importObject ke sini
  const instance = new WebAssembly.Instance(module, importObject);

  return instance.exports;
}