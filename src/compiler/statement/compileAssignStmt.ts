/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { AssignmentStatement, Literal } from "../../ast/index.js";
import { CustomError } from "../../error.js";
import { compileExpr } from "../expression/compileExpr.js";
import { Scope } from "../../parser/Scope.js";
import { Instruction } from "../../vm/Instruction.js";
import { findScopeForVar, normalizeType, getValueType, isNumberFamily, isAnyType } from "../../utils/index.js";

export function compileAssignStmt(stmt: AssignmentStatement, code: Instruction[], scope: Scope) {
  const s = stmt;
  const targetScope = findScopeForVar(scope, s.identifier);
  if (!targetScope)
    throw new CustomError("ReferenceError", `Name '${s.identifier}' is not defined`, s.line ?? 0, s.column ?? 0);
  if (targetScope.kinds[s.identifier] === 'val')
    throw new CustomError("TypeError", `Name '${s.identifier}' is immutable`, s.line ?? 0, s.column ?? 0);
  const declaredRaw = targetScope.types[s.identifier];
  const nullable = declaredRaw.endsWith("?");
  const declared = nullable ? declaredRaw.slice(0, -1) : declaredRaw;
  if (s.expression.type === "Literal") {
    const newValue = (s.expression as Literal).value;
    const newType = normalizeType(getValueType(newValue));
  
    if (!nullable && newValue === null) {
      throw new CustomError("TypeError", `Name '${s.identifier}' is not nullable, but got null`, s.line ?? 0, s.column ?? 0);
    }
  
    if (!isAnyType(declared)) {
      if (newValue !== null && !isNumberFamily(declared, newType) && declared !== newType) {
        throw new CustomError("TypeError", `Name '${s.identifier}' expected ${nullable ? "nullable" : ""} ${declared}, but got ${newType}`, s.line ?? 0, s.column ?? 0);
      }
    }
  }
  code.push(...compileExpr(s.expression, scope));
  code.push(["set", s.identifier]);
  return code;
}