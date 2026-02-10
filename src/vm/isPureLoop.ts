import { Instruction } from "./Instruction.js";

export function isPureLoop(bytecode: Instruction[], start: number, end: number) {
  for (let i = start; i <= end; i++) {
    const [op] = bytecode[i];
    if (
      op === "print" ||
      op === "println" ||
      op === "call" ||
      op === "import" ||
      op === "return"
    ) {
      return false;
    }
  }
  return true;
}