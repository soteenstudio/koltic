import fs from "fs";
import path from "path";
import wabt from "wabt";

async function compileAllWat() {
  const srcDir = path.resolve("src/wasm");
  const outDir = path.resolve("dist/wasm");

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith(".wat"));
  const wabtModule = await wabt();

  for (const file of files) {
    const watPath = path.join(srcDir, file);
    const watSource = fs.readFileSync(watPath, "utf-8");

    const wasmModule = wabtModule.parseWat(file, watSource);
    const { buffer } = wasmModule.toBinary({ write_debug_names: true });

    const outFile = path.join(outDir, file.replace(/\.wat$/, ".wasm"));
    fs.writeFileSync(outFile, Buffer.from(buffer));
    console.log(`Compiled ${file} → ${outFile}`);
  }
}

compileAllWat().catch(console.error);