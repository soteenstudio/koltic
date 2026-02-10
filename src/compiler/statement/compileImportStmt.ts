/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { CustomError } from "../../error.js";
import { ModuleTable } from "../../module/ModuleTable.js";
import { resolveImport } from "../index.js";
import { ImportStatement } from "../../ast/index.js";
import { Scope } from "../../parser/Scope.js";
import { Instruction } from "lightvm";

export function compileImportStmt(
  stmt: ImportStatement,
  scope: Scope,
  code: Instruction[],
  CURRENT_MODULE_ID: string
) {
  const { package: pkg, name } = stmt;

  const moduleId = resolveImport(CURRENT_MODULE_ID, pkg);

  const meta = ModuleTable.get(moduleId);
  if (!meta) {
    throw new CustomError(
      "ReferenceError",
      `Module '${pkg}' not found`,
      stmt.line ?? 0,
      stmt.column ?? 0
    );
  }

  if (name === "*") {
    code.push(["import", moduleId, pkg]);

    for (const key in meta.exports) {
      scope.kinds[key] = "val";
      scope.types[key] = meta.exports[key].type;
    }
    return [];
  }

  const exported = meta.exports[name];
  if (!exported) {
    throw new CustomError(
      "ReferenceError",
      `Module '${pkg}' has no export '${name}'`,
      stmt.line ?? 0,
      stmt.column ?? 0
    );
  }

  code.push(["import", moduleId, "__tmp_import"]);
  code.push(["get", "__tmp_import"]);
  code.push(["access", name]);
  code.push(["set", name]);

  scope.kinds[name] = "val";
  scope.types[name] = exported.type;
  return [];
}