import { Instruction } from "./Instruction.js";
import { isPureLoop } from "./isPureLoop.js";

export function eliminateDeadLoops(bytecode: Instruction[]): Instruction[] {
  const out: Instruction[] = [];

  for (let i = 0; i < bytecode.length; i++) {
    const [op, , , target] = bytecode[i];

    if (op === "if_false" && typeof target === "number") {
      const loopStart = target;
      const loopEnd = i;

      if (isPureLoop(bytecode, loopStart, loopEnd)) {
        // skip seluruh loop
        i = loopEnd;
        continue;
      }
    }

    out.push(bytecode[i]);
  }

  return out;
}