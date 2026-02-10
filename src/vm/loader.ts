// BytecodeLoader.ts
import { Instruction } from "./Instruction.js";

export function parseLTC(code: string): Instruction[] {
  return code
    .replace(/\s\;\;\sIP\=(\d+)/g, "")
    .split(";")
    .map(s => s.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split(/\s+/);
      const op = parts[0] as Instruction[0];
      const args = parts.slice(1).map(arg => {
        const num = Number(arg);
        return isNaN(num) ? arg : num;
      });

      while (args.length < 4) args.push("");
      return [op, ...args] as Instruction;
    });
}

export function stringifyLTC(code: Instruction): string {
  return code
    .map((item, index) => item.join(' ') + `; ;; IP=${index}`)
    .join('\n');
  fs.writeFileSync(filename.replace(".lt", ".ltc"), stringData);
  const wEnd = process.hrtime.bigint();
  const totalEnd = process.hrtime.bigint();
}