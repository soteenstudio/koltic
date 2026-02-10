/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { BlockStatement, FunctionDeclaration } from "../../ast/index.js";
import { compileStatement } from "./compileStmt.js";
import { normalizeType } from "../../utils/index.js";
import { Scope } from "../../parser/Scope.js";
import { Instruction } from "lightvm";

export function compileFunDecl(f: FunctionDeclaration, globalScope: Scope, code: Instruction[], moduleId: string) {
  const jumpOverIndex = code.length;
  code.push(["jump", -1]);

  const startIndex = code.length + 1;
  const funcHeaderIndex = code.length;

  const returnType = f.returnType ?? "$Type.Anything";
  code.push([
    "func",
    f.name,
    f.params.length,
    startIndex,
    -1,
    ...f.params.map((p: any) => p.name)
  ]);

  const funcScope: Scope = {
    kinds: Object.create(null),
    types: Object.create(null),
    parent: globalScope,
  };

  for (const p of f.params) {
    funcScope.kinds[p.name] = "mut";

    let paramType = p.paramType ?? "$Type.Anything";
    let nullable = false;
    if (paramType.endsWith("?")) {
      nullable = true;
      paramType = paramType.slice(0, -1);
    }
    funcScope.types[p.name] = normalizeType(paramType) + (nullable ? "?" : "");
    code.push(["val", p.name]);
  }
  
  funcScope.currentFunctionReturnType = returnType;
  funcScope.currentFunctionName = f.name;

  compileStatement(f.body, funcScope, code, moduleId);

  const endIndex = code.length - 1;
  (code[funcHeaderIndex] as ["func", string, number, number, number])[4] = endIndex;
  
  const hasExplicitReturn = f.body.type === "BlockStatement" && 
    (f.body as BlockStatement).body.length > 0 && 
    (f.body as BlockStatement).body[(f.body as BlockStatement).body.length - 1].type === "ReturnStatement";
  
  if (!hasExplicitReturn) {
    if (normalizeType(returnType) === "$Type.Unit") {
      code.push(["push", "NoValueExpression"]);
      code.push(["return"]);
    }
  }

  code.push(["stop"]);
  (code[jumpOverIndex] as ["jump", number])[1] = code.length;
  return [];
}