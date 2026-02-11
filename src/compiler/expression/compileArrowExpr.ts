/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { Instruction } from "lightvm";
import { Scope } from "../../parser/Scope.js";
import { ArrowFunction } from "../../ast/index.js";
import { compileExpr } from "./compileExpr.js";
import { compileStatement } from "../statement/compileStmt.js";

export function compileArrowExpr(
  node: ArrowFunction,
  code: Instruction[],
  scope: Scope,
  moduleId: string
): Instruction[] {
  const fnScope: Scope = {
    kinds: {},
    types: {},
    parent: scope,
  };

  for (const param of node.params) {
    fnScope.kinds[param.name] = "val";
  }

  const bodyCode: Instruction[] = [];
  
  if (node.body.type === "BlockStatement") {
    for (const stmt of node.body.body) {
      bodyCode.push(...compileStmt(stmt, fnScope));
    }
  } else {
    bodyCode.push(...compileExpr(node.body, fnScope, false, moduleId));
    bodyCode.push(["return"]);
  }

  code.push([
    "push",
    {
      type: "Function",
      params: node.params.map((p: any) => p.name),
      code: bodyCode,
      isArrow: true,
    },
  ]);

  return code;
}