/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { Identifier } from "../../ast/index.js";
import { Instruction } from "../../vm/Instruction.js";
import { Scope } from "../../parser/Scope.js";
import { findScopeForVar } from "../../utils/index.js";
import { CustomError } from "../../error.js";

export function compileIdentifierExpr(node: Identifier, code: Instruction[], scope: Scope, isTypeCheck: boolean) {
  const id = node;
  const targetScope = findScopeForVar(scope, id.name);
  if (!targetScope) {
    throw new CustomError(
      "ReferenceError",
      `Name '${id.name}' is not defined`,
      node.line ?? 0,
      node.column ?? 0
    );
  }
  if (isTypeCheck) {
    console.log(node, targetScope);
    code.push(["push", targetScope?.types[id.name]]);
  } else {
    code.push(["get", id.name]);
  }
  return code;
}