/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { getDeclaredTypeForVar } from "../utils/getDeclaredTypeForVar.js";
import { ModuleTable } from "./ModuleTable.js";
import { ExportStatement } from "../ast/index.js";
import { Scope } from "../parser/Scope.js";

export function collectExport(
  stmt: ExportStatement,
  scope: Scope,
  moduleId: string
) {
  if (!moduleId) {
    throw new Error("collectExport called without moduleId");
  }

  const meta = ModuleTable.get(moduleId);
  if (!meta) {
    throw new Error(`InternalError: module '${moduleId}' not registered`);
  }

  const type = getDeclaredTypeForVar(scope, stmt.type);
  if (!type) {
    throw new Error(`Cannot export '${stmt.name}' without type`);
  }

  meta.exports[stmt.type] = { type };
}