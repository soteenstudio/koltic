/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import {
  Program,
  Statement,
  Expression,
  VarDeclaration,
  PrintLnStatement,
  IfStatement,
  BlockStatement,
  Identifier,
  BinaryExpression,
  Literal,
  ObjectLiteral,
  FunctionDeclaration,
  CallExpression,
  ForStatement,
  AssignmentStatement,
  UpdateExpression,
  ReturnStatement,
} from '../ast/index.js';
import {
  getValueType,
  normalizeType,
  getFromScope,
  findScopeForVar,
  getDeclaredTypeForVar,
  isNumberFamily,
  isAnyType
} from "../utils/index.js";
import {
  CustomError
} from "../error.js";
import {
  Lexer
} from "../lexer.js";
import { compileExpr } from "./expression/compileExpr.js";
import { compileStatement } from "./statement/compileStmt.js";
import { compileFunDecl } from "./statement/compileFunDecl.js";
import { exprType } from "../utils/exprType.js";
import { Scope } from "../parser/Scope.js";
import { Instruction } from "lightvm";
import { collectExport } from "../module/collectExport.js";
export const functions: Record < string, FunctionDeclaration > = Object.create(null);

export function run(ast: Program, moduleId: string): Instruction[] {
  const globalEnv: Scope = {
    kinds: Object.create(null),
    types: Object.create(null),
  };
  Object.assign(functions, Object.create(null));
  globalEnv.kinds = globalEnv.kinds || Object.create(null);
  globalEnv.types = globalEnv.types || Object.create(null);
  const bytecode: Instruction[] = [];

  for (const stmt of ast.body) {
    if (stmt.type === "FunctionDeclaration") {
      const f = stmt as FunctionDeclaration;
      globalEnv.kinds[f.name] = "val";
      globalEnv.types[f.name] = "$Type.Function";
      if (functions[f.name]) {
        throw new CustomError(
          "SyntaxError",
          `Name '${f.name}' has already been declared`,
          stmt.line ?? 0,
          stmt.column ?? 0
        );
      }
      functions[f.name] = f;
      continue;
    }
    
    if (stmt.type === "VarDeclaration") {
      globalEnv.kinds[stmt.name] = stmt.kind;
      globalEnv.types[stmt.name] = exprType(stmt.expression, globalEnv);
      continue;
    }
  }

  for (const stmt of ast.body) {
    if (stmt.type === "ExportStatement") {
      collectExport(stmt, globalEnv, moduleId);
    }
  }

  for (const stmt of ast.body) {
    if (stmt.type !== "FunctionDeclaration") {
      compileStatement(stmt, globalEnv, bytecode, moduleId);
    }
  }

  for (const fName in functions) {
    compileFunDecl(functions[fName], globalEnv, bytecode, moduleId);
  }

  return bytecode;
}