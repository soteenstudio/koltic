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
import { Instruction } from "lightvm";
import { Scope } from "../../parser/Scope.js";
import { compileExpr } from "../expression/compileExpr.js";
import { compileStatement } from "./compileStmt.js";

export function compileIfStmt(stmt: IfStatement, code: Instruction[], scope: Scope, moduleId: string) {
  const s = stmt;

  code.push(...compileExpr(s.test, scope, false, moduleId));

  const ifFalseIndex = code.length;
  code.push(["if_false", -1]);

  compileStatement(s.consequent, scope, code, moduleId);

  if (s.alternate) {
    const jumpIndex = code.length;
    code.push(["jump", -1]);

    const elseStart = code.length;
    (code[ifFalseIndex] as ["if_false", number])[1] = elseStart;

    if ((s.alternate as any).type === "IfStatement") {
      compileStatement(s.alternate as IfStatement, scope, code, moduleId);
    } else {
      compileStatement(s.alternate, scope, code, moduleId);
    }

    (code[jumpIndex] as ["jump", number])[1] = code.length;
  } else {
    const afterIf = code.length;
    (code[ifFalseIndex] as ["if_false", number])[1] = afterIf;
  }

  return [];
}