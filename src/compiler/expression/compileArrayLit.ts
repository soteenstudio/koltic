/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { ArrayLiteral, Expression } from "../../ast/index.js";
import { Instruction } from "../../vm/Instruction.js";
import { Scope } from "../../parser/Scope.js";
import { compileExpr } from "./compileExpr.js";

export function compileArrayLit(node: ArrayLiteral, code: Instruction[], scope: Scope): Instruction[] {
  const elemCount = node.elements.length;

  for (const elem of node.elements) {
    if (elem.type === "Literal") {
      code.push(["push", elem.value]);
    } else {
      compileExpr(elem, scope);
    }
  }

  code.push(["make_array", elemCount]);

  return code;
}