import { analyzeUsage } from "./analyzeUsage.js";
import { eliminateDeadStores } from "./eliminateDeadStores.js";
import { eliminateDeadLoops } from "./eliminateDeadLoops.js";
import { Instruction } from "./Instruction.js";

export function optimizeBytecode(bytecode: Instruction[]) {
  const usage = analyzeUsage(bytecode);

  let out = eliminateDeadStores(bytecode, usage);
  out = eliminateDeadLoops(out);

  return out;
}