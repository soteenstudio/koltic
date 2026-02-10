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
import { MemberExpression, Expression } from "../../ast/index.js";
import { compileExpr } from "./compileExpr.js";

export function compileMemberExpr(node: MemberExpression, code: Instruction[], scope: Scope): Instruction[] {
  code.push(...compileExpr(node.object, scope));

  if (typeof node.property === "string") {
    code.push(["access", node.property]);
  } else {
    code.push(...compileExpr(node.property as Expression, scope));
    code.push(["access_index"]);
  }

  return code;
}