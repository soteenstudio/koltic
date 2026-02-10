/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { Instruction } from "../../vm/Instruction.js";
import { Scope } from "../../parser/Scope.js";
import { FunctionExpression } from "../../ast/index.js";
import { compileStatement } from "../statement/compileStmt.js";

let anonFnId = 0;

export function compileFunctionExpr(
  node: FunctionExpression,
  code: Instruction[],
  scope: Scope
): Instruction[] {

  const fnName = `__fn_${anonFnId++}`;
  const params = ["this", ...node.params.map(p => p.name)];
  const fnStart = code.length + 1;

  code.push([
    "func",
    fnName,
    params.length,
    fnStart,
    -1,
    ...params
  ]);

  const fnScope: Scope = {
    ...scope,
    vars: { ...scope.vars },
    kinds: { ...scope.kinds },
    types: { ...scope.types },
    currentFunctionName: fnName,
    currentFunctionReturnType: node.returnType ?? "any",
  };

  for (const p of params) {
    fnScope.vars![p] = null;
    fnScope.kinds[p] = "val";
    fnScope.types[p] = "any";
  }

  compileStatement(node.body, fnScope, code);

  code.push(["return"]);

  const fnEnd = code.length;
  (code.find(i => i[0] === "func" && i[1] === fnName) as any)[4] = fnEnd;

  code.push(["push", fnName]);

  return code;
}