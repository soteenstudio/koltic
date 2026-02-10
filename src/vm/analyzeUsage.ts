import { Instruction } from "./Instruction.js";
import { Usage } from "./Usage.js";

export function analyzeUsage(bytecode: Instruction[]): Usage {
  const read = new Set<string>();
  const written = new Set<string>();

  for (const [op, arg] of bytecode) {
    if (op === "get") read.add(arg as string);
    if (op === "set" || op === "inc" || op === "dec") {
      written.add(arg as string);
    }
    if (op === "print" || op === "println") {
      read.add("*IO*");
    }
    if (op === "return") {
      read.add("*RETURN*");
    }
  }

  return { read, written };
}