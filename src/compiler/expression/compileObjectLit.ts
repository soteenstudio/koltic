/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { ObjectLiteral, FunctionExpression } from "../../ast/index.js";
import { Instruction } from "../../vm/Instruction.js";
import { Scope } from "../../parser/Scope.js";
import { compileExpr } from "./compileExpr.js";

export function compileObjectLit(
  node: ObjectLiteral,
  code: Instruction[],
  scope: Scope
): Instruction[] {

  const propCount = node.properties.length;

  for (const prop of node.properties) {
    code.push(["push", prop.key]);

    if (prop.value.type === "FunctionExpression") {
      const fn = prop.value as FunctionExpression;

      const methodScope: Scope = {
        ...scope,
        vars: { ...scope.vars },
        kinds: { ...scope.kinds },
        types: { ...scope.types },
      };

      compileExpr(
        {
          ...fn,
          params: [{ name: "this" }, ...fn.params],
        },
        methodScope
      );

    } else {
      compileExpr(prop.value, scope);
    }
  }

  code.push(["make_obj", propCount]);

  return code;
}