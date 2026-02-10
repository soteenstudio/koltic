/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { ForStatement } from "../../ast/index.js";
import { Instruction } from "../../vm/Instruction.js";
import { Scope } from "../../parser/Scope.js";
import { compileExpr } from "../expression/compileExpr.js";
import { compileStatement } from "./compileStmt.js";

export function compileForStmt(stmt: ForStatement, code: Instruction[], scope: Scope, moduleId: string) {
  const s = stmt;
  const forScope: Scope = {
    kinds: Object.create(null),
    types: Object.create(null),
    parent: scope
  };

  (forScope as any).$loopBreakTargets = [];
  (forScope as any).$loopContinueTargets = [];

  if (s.init) compileStatement(s.init, forScope, code, moduleId);

  const testStart = code.length;

  if (s.test) {
    code.push(...compileExpr(s.test, forScope));
    code.push(["if_false", -1]);
  }

  const jumpToExitIndex = code.length - 1;

  const loopStart = code.length;
  compileStatement(s.consequent, forScope, code, moduleId);

  const updateStart = code.length;
  if (s.update) compileStatement(s.update, forScope, code, moduleId);

  code.push(["jump", testStart]);

  const loopEnd = code.length;
  (code[jumpToExitIndex] as ["if_false", number])[1] = loopEnd;

  for (const idx of (forScope as any).$loopBreakTargets) {
    (code[idx] as ["jump", number])[1] = loopEnd;
  }
  for (const idx of (forScope as any).$loopContinueTargets) {
    (code[idx] as ["jump", number])[1] = updateStart;
  }

  return [];
}