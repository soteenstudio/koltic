/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { IfStatement } from "../../ast/index.js";
import { Instructions } from "lightvm";
import { Scope } from "../../parser/Scope.js";
import { compileExpr } from "../expression/compileExpr.js";
import { compileStatement } from "./compileStmt.js";

export function compileIfStmt(stmt: IfStatement, code: Instructions[], scope: Scope, moduleId: string) {
  console.log("halaoapaoaooa");
  const s = stmt;

  code.push(...compileExpr(s.test, scope, false, moduleId));

  const ifFalseIndex = code.length;
  code.push(["if_false", -1]);

  compileStatement(s.consequent, scope, code, moduleId);

  if (s.alternate) {
    // 1. Tambah jump di akhir IF biar gak bablas ke ELSE
    const jumpIndex = code.length;
    code.push(["jump", -1]);

    // 2. Alamat ELSE dimulai TEPAT setelah jump tadi
    const elseStart = jumpIndex - 1; 
    console.log("Code length: ", elseStart);
    
    // 3. Update if_false punyanya IF buat lari ke sini kalau gagal
    (code[ifFalseIndex] as [string, number])[1] = elseStart;

    // 4. Compile isi ELSE
    compileStatement(s.alternate, scope, code, moduleId);

    // 5. Update jump si IF tadi buat lari ke akhir seluruh IF-ELSE
    (code[jumpIndex] as [string, number])[1] = code.length;
  } else {
    (code[ifFalseIndex] as ["if_false", number])[1] = code.length;
  }

  return [];
}
