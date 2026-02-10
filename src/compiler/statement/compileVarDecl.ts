/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { VarDeclaration, Literal, Identifier } from "../../ast/index.js";
import { CustomError } from "../../error.js";
import { normalizeType, getValueType, getDeclaredTypeForVar, exprType, isNumberFamily, isAnyType } from "../../utils/index.js";
import { types } from "../../utils/getValueType.js";
import { compileExpr } from "../expression/compileExpr.js";
import { Scope } from "../../parser/Scope.js";
import { Instruction } from "../../vm/Instruction.js";

export function compileVarDecl(stmt: VarDeclaration, code: Instruction[], scope: Scope) {
  const s = stmt;
  if (s.kind === "val" && s.expression?.type === "NoInitExpression") {
    throw new CustomError(
      "ReferenceError",
      `Name '${s.identifier}' is not initialized`,
      stmt.line ?? 0,
      stmt.column ?? 0
    );
  }
  if (scope.kinds[s.identifier] !== undefined) {
    throw new CustomError(
      "SyntaxError",
      `Name '${s.identifier}' has already been declared`,
      stmt.line ?? 0,
      stmt.column ?? 0
    );
  }
  let declared: string;
  let nullable = false;
  if (s.varType) {
    const rawType = s.varType.replace("?", "");
    if (!types.includes(normalizeType(rawType))) {
      throw new CustomError(
        "TypeError",
        `Name '${s.identifier}' has unexpected ${normalizeType(rawType)}`,
        stmt.line ?? 0,
        stmt.column ?? 0
      );
    }
    
    if (s.varType.endsWith("?")) {
      nullable = true;
      declared = normalizeType(s.varType.slice(0, -1));
    } else {
      declared = normalizeType(s.varType);
    }
    if (s.expression.type !== "NoInitExpression") {
      if (s.expression.type === "Literal") {
        const actualValue = (s.expression as Literal).value;
        const actualType = normalizeType(getValueType(actualValue));
      
        if (actualValue === null && !nullable) {
          throw new CustomError(
            "TypeError",
            `Name '${s.identifier}' is not nullable, but got null`,
            stmt.line ?? 0,
            stmt.column ?? 0
          );
        }
      
        if (!isAnyType(declared)) {
          if (actualValue !== null && !isNumberFamily(declared, actualType) && declared !== actualType) {
            throw new CustomError(
              "TypeError",
              `Name '${s.identifier}' expected ${declared}, but got ${actualType}`,
              stmt.line ?? 0,
              stmt.column ?? 0
            );
          }
        }
      } else if (s.expression.type === "Identifier") {
        const rhsId = (s.expression as Identifier).name;
        const targetType = getDeclaredTypeForVar(scope, rhsId);
        if (targetType) {
          const targetDeclared = targetType.endsWith("?") ? targetType.slice(0, -1) : targetType;
          const currentDeclared = declared;
          if (currentDeclared !== targetDeclared && !(currentDeclared === "$Type.Number" && (targetDeclared === "$Type.Integer" || targetDeclared === "$Type.Float"))) {
            throw new CustomError(
              "TypeError",
              `Name ${s.identifier} expected ${currentDeclared}, but got ${targetDeclared}`,
              stmt.line ?? 0,
              stmt.column ?? 0
            );
          }
        }
      } else if (s.expression.type === "CallExpression") {
        const exprT = exprType(s.expression, scope);
        const normalized = normalizeType(exprT);
        
        if (declared !== normalized) {
          throw new CustomError(
            "TypeError",
            `Name '${s.identifier}' expected ${declared}, but got ${normalized}`,
            s.line ?? 0,
            s.column ?? 0,
          );
        }
      }
    }
  } else {
    if (s.expression.type === "Literal") {
      const actualValue = (s.expression as Literal).value;
      const inferred = normalizeType(getValueType(actualValue));
      
      if (inferred === "Null") {
        throw new CustomError(
          "TypeError",
          `Name '${s.identifier}' cannot be null without a nullable type`,
          stmt.line ?? 0,
          stmt.column ?? 0
        );
      }
  
      declared = inferred;
    } else {
      declared = "$Type.Anything";
    }
  }
  scope.kinds[s.identifier] = s.kind;
  scope.types[s.identifier] = declared + (nullable ? "?" : "");
  code.push(["val", s.identifier]);
  if (s.expression.type !== "NoInitExpression") {
    code.push(...compileExpr(s.expression, scope));
    code.push(["set", s.identifier]);
  }
  return [];
}