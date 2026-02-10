/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { ModuleTable } from "../../module/ModuleTable.js";
import { CustomError } from "../../error.js";
import { ExportStatement } from "../../ast/index.js";
import { Scope } from "../../parser/Scope.js";
import { Instruction } from "../../vm/Instruction.js";

export function compileExportStmt(
  stmt: ExportStatement,
  scope: Scope,
  code: Instruction[],
  moduleId: string
) {
  console.log("..................");
  const meta = ModuleTable.get(moduleId);

  if (!meta) {
    throw new CustomError(
      "InternalError",
      `Current module not registered`,
      stmt.line ?? 0,
      stmt.column ?? 0
    );
  }

  const type = scope.types[stmt.name];
  if (!type) {
    throw new CustomError(
      "ReferenceError",
      `Name '${stmt.name}' is not defined`,
      stmt.line ?? 0,
      stmt.column ?? 0
    );
  }

  meta.exports[stmt.name] = { type };

  code.push(["export", stmt.name]);
  return [];
}