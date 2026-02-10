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
import { NewExpression } from "../../ast/index.js";
import { compileExpr } from "../expression/compileExpr.js";

export function compileNewExpr(expr: NewExpression, code: Instruction[], scope: Scope) {
  const className = expr.className;
  const args = expr.args;

  for (const argExpr of args) {
    code.push(...compileExpr(argExpr, scope));
  }

  code.push(["instantiate", className, args.length]);

  return [];
}