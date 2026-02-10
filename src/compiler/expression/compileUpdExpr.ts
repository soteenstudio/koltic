/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { UpdateExpression, Identifier } from "../../ast/index.js";
import { Scope } from "../../parser/Scope.js";
import { Instruction } from "lightvm";
import { CustomError } from "../../error.js";
import { findScopeForVar, normalizeType, isNumberFamily } from "../../utils/index.js";

export function compileUpdExpr(node: UpdateExpression, code: Instruction[], scope: Scope) {
  const upd = node;
  const id = (upd.argument as Identifier).name;
  const targetScope = findScopeForVar(scope, id);

  if (!targetScope) {
    throw new CustomError(
      "ReferenceError",
      `Name '${id}' is not defined`,
      upd.argument.line ?? 0,
      upd.argument.column ?? 0
    );
  }

  if (targetScope.kinds[id] === "val") {
    throw new CustomError(
      "TypeError",
      `Name '${id}' is immutable`,
      upd.argument.line ?? 0,
      upd.argument.column ?? 0
    );
  }

  const declaredRaw = targetScope.types[id];
  const nullable = declaredRaw.endsWith("?");
  const declared = normalizeType(declaredRaw.replace("?", ""));

  if (nullable) {
    throw new CustomError(
      "TypeError",
      `Cannot ${upd.operator === "++" ? "increment" : "decrement"} nullable name '${id}'`,
      upd.argument.line ?? 0,
      upd.argument.column ?? 0
    );
  }

  if (!isNumberFamily("$Type.Number", declared)) {
    throw new CustomError(
      "TypeError",
      `Cannot ${upd.operator === "++" ? "increment" : "decrement"} non-numeric name '${id}'`,
      upd.argument.line ?? 0,
      upd.argument.column ?? 0
    );
  }

  if (upd.prefix) {
    code.push([upd.operator === "++" ? "inc" : "dec", id]);
    code.push(["get", id]);
  } else {
    code.push(["get", id]);
    code.push(["dup"]);
    code.push([upd.operator === "++" ? "inc" : "dec", id]);
  }

  return code;
}