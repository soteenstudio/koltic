/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { BlockStatement, Statement } from "../../ast/index.js";
import { Scope } from "../../parser/Scope.js";
import { Instruction } from "../../vm/Instruction.js";
import { compileStatement } from "./compileStmt.js";

export function compileBlockStmt(stmt: BlockStatement, code: Instruction[], scope: Scope) {
  const s = stmt;
  const blockScope: Scope = {
    kinds: Object.create(null),
    types: Object.create(null),
    parent: scope
  };
  s.body.forEach((child: Statement) => compileStatement(child, blockScope, code));
  return [];
}