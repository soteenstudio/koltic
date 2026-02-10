import { Instruction } from "./Instruction.js";
import { Usage } from "./Usage.js";

export function eliminateDeadStores(
  bytecode: Instruction[],
  usage: Usage
): Instruction[] {
  const result = [];
  // Kita pake stack bantuan buat tau: "Apakah instruksi di atas gue hasilnya bakal dipake?"
  let neededByNext = 0; 

  // Jalan mundur dari instruksi paling bawah
  for (let i = bytecode.length - 1; i >= 0; i--) {
    const [op, arg] = bytecode[i];

    // 1. Cek instruksi 'set'
    if (op === "set") {
      if (typeof arg === "string" && !usage.read.has(arg)) {
        // Kalau variabelnya mati, kita buang 'set' nya
        // Dan kita tandai kalau instruksi 'add' di atasnya (yang ngasih nilai ke stack) juga gak perlu
        continue; 
      }
      // Kalau 'set' nya dipake, berarti dia butuh input dari stack (misal dari 'add')
      neededByNext++;
      result.unshift(bytecode[i]);
    } 
    
    // 2. Cek instruksi 'add', 'sub', dsb (yang ambil 2 nilai stack, balikin 1 nilai)
    else if (op === "add") {
      if (neededByNext > 0) {
        // Kalau ada instruksi di bawah (seperti 'set') yang nungguin hasil ini
        neededByNext--; // Kita "kasih" hasilnya ke bawah
        neededByNext += 2; // Tapi 'add' sendiri butuh 2 nilai dari stack (push-push di atasnya)
        result.unshift(bytecode[i]);
      } else {
        // Kalau gak ada yang butuh hasil 'add' ini, hapus! (Gak dimasukin ke result)
        continue;
      }
    }

    
    // 4. Instruksi side-effect (kayak print atau inc/dec yang mutasi variable)
    else {
      if ((op === "inc" || op === "dec") && typeof arg === "string" && !usage.read.has(arg)) {
        continue;
      }
      // Instruksi lain yang gak pake stack (atau side effect) tetep dimasukin
      result.unshift(bytecode[i]);
    }
  }

  return result;
}