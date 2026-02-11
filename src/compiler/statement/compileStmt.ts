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
import { findScopeForVar, isNumberFamily, isAnyType, normalizeType, exprType, getValueType, getDeclaredTypeForVar } from "../../utils/index.js";
import {
  Identifier,
  UpdateExpression,
  CallExpression,
  ForStatement,
  ReturnStatement,
  IfStatement,
  BlockStatement,
  AssignmentStatement,
  VarDeclaration,
  Statement,
  Literal,
  Expression,
  WhileStatement,
  ClassDeclaration,
} from "../../ast/index.js";
import { compileVarDecl } from "./compileVarDecl.js";
import { compileAssignStmt } from "./compileAssignStmt.js";
import { compileBlockStmt } from "./compileBlockStmt.js";
import { compileIfStmt } from "./compileIfStmt.js";
import { compileForStmt } from "./compileForStmt.js";
import { compileClassDecl } from "./compileClassDecl.js";
import { compileFunDecl } from "./compileFunDecl.js";
import { compileImportStmt } from "./compileImportStmt.js";
import { compileExportStmt } from "./compileExportStmt.js";
import { compileExpr } from "../expression/compileExpr.js";
import { Scope } from "../../parser/Scope.js";
import { Instruction } from "lightvm";
import { types } from "../../utils/getValueType.js";

export function compileStatement(
  stmt: Statement | Expression,
  scope: Scope,
  code: Instruction[],
  moduleId: string
): Instruction[] {
  switch (stmt.type) {
    case "VarDeclaration": {
      return compileVarDecl(stmt, code, scope, moduleId);
    }
    case 'AssignmentStatement': {
      return compileAssignStmt(stmt, code, scope, moduleId);
    }
    case "BlockStatement": {
      return compileBlockStmt(stmt, code, scope, moduleId);
    }
    case "IfStatement": {
      return compileIfStmt(stmt, code, scope, moduleId);
    }
    case "ForStatement": {
      return compileForStmt(stmt, code, scope, moduleId);
    }
    case 'ReturnStatement': {
      const s = stmt as ReturnStatement;
    
      const funcName = scope.parent
        ? scope.parent.currentFunctionName
        : "UnknownFunctionName";
      const funcReturnType = scope.parent 
        ? normalizeType(scope.parent.currentFunctionReturnType ?? "$Type.Anything")
        : "$Type.Anything";
    
      if (funcReturnType === "$Type.Unit") {
        if (s.expression && s.expression.type !== "NoValueExpression") {
          throw new CustomError(
            "TypeError",
            `Name '${funcName}' cannot return a value`,
            s.line ?? 0,
            s.column ?? 0,
          );
        }
        code.push(["push", s.expression.type]);
        code.push(["return"]);
        return [];
      }
      
      if (s.expression) {
        code.push(...compileExpr(s.expression, scope, false, moduleId));
    
        const exprT = exprType(s.expression, scope);
        const normalized = normalizeType(exprT);
        
        if (!isAnyType(funcReturnType)) {
          const nullable = funcReturnType.endsWith("?");
          const declared = nullable ? funcReturnType.slice(0, -1) : funcReturnType;
    
          if (normalized === "Null" && !nullable) {
            throw new CustomError("TypeError", `Cannot return null for non-nullable ${declared}`, s.line ?? 0, s.column ?? 0);
          }
    
          if (normalized !== "Null" && !isNumberFamily(declared, normalized) && declared !== normalized) {
            throw new CustomError("TypeError", `Name '${funcName}' expectedd ${funcReturnType}, but got ${normalized}`, s.line ?? 0, s.column ?? 0);
          }
        }
    
        code.push(["return"]);
      }
      return [];
    }
    case 'CallExpression': {
      code.push(...compileExpr(stmt as CallExpression, scope, false, moduleId) ?? []);
      return [];
    }
    case "UpdateExpression": {
      const upd = stmt as UpdateExpression;
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
    
      if (isAnyType(declared)) {
        if (upd.operator === "++") code.push(["inc", id]);
        else code.push(["dec", id]);
        return [];
      }
    
      if (!isNumberFamily("$Type.Number", declared)) {
        throw new CustomError(
          "TypeError",
          `Cannot ${upd.operator === "++" ? "increment" : "decrement"} non-numeric name '${id}'`,
          upd.argument.line ?? 0,
          upd.argument.column ?? 0
        );
      }
    
      if (upd.operator === "++") code.push(["inc", id]);
      else code.push(["dec", id]);
    
      return [];
    }
    case "SwitchStatement": {
      const s = stmt as any;
      code.push(...compileExpr(s.discriminant, scope, false, moduleId));
    
      const endOfSwitchIndexList: number[] = []; 
      const jumpToDefaultIndexList: number[] = [];
    
      for (let i = 0; i < s.cases.length; i++) {
        const c = s.cases[i];
    
        if (!c.test) {
          jumpToDefaultIndexList.push(code.length);
          continue;
        }
    
        code.push(["get", s.discriminant.name ?? "__switch_temp"]);
    
        code.push(...compileExpr(c.test, scope, false, moduleId));
    
        code.push(["eq"]);
    
        const ifFalseIndex = code.length;
        code.push(["if_false", -1]);
    
        compileStatement(c.consequent, scope, code, moduleId);
    
        const jumpIndex = code.length;
        code.push(["jump", -1]);
        endOfSwitchIndexList.push(jumpIndex);
    
        (code[ifFalseIndex] as ["if_false", number])[1] = code.length;
      }
    
      const defaultCase = s.cases.find((c: any) => c.test === null);
      if (defaultCase) {
        compileStatement(defaultCase.consequent, scope, code, moduleId);
      }
    
      for (const idx of endOfSwitchIndexList) {
        (code[idx] as ["jump", number])[1] = code.length;
      }
    
      return [];
    }
    case "BreakStatement": {
      let searchScope: any = scope;
      while (searchScope && !searchScope.$loopBreakTargets) {
        searchScope = searchScope.parent;
      }
      if (!searchScope) {
        throw new CustomError("SyntaxError", "break not inside loop", stmt.line ?? 0, stmt.column ?? 0);
      }
    
      searchScope.$loopBreakTargets.push(code.length);
      code.push(["jump", -1]);
      return [];
    }
    
    case "ContinueStatement": {
      let searchScope: any = scope;
      while (searchScope && !searchScope.$loopContinueTargets) {
        searchScope = searchScope.parent;
      }
      if (!searchScope) {
        throw new CustomError("SyntaxError", "continue not inside loop", stmt.line ?? 0, stmt.column ?? 0);
      }
    
      searchScope.$loopContinueTargets.push(code.length);
      code.push(["jump", -1]);
      return [];
    }
    case "WhileStatement": {
      const s = stmt as WhileStatement;
    
      const whileScope: Scope = {
        kinds: Object.create(null),
        types: Object.create(null),
        parent: scope,
        $loopBreakTargets: [],
        $loopContinueTargets: []
      };
    
      const testStart = code.length;
    
      if (s.test) {
        code.push(...compileExpr(s.test, whileScope, false, moduleId));
        code.push(["if_false", -1]);
      }
      const jumpToExitIndex = code.length - 1;
    
      const loopStart = code.length;
    
      compileStatement(s.body, whileScope, code, moduleId);
    
      code.push(["jump", testStart]);
    
      const loopEnd = code.length;
    
      if (jumpToExitIndex >= 0) {
        (code[jumpToExitIndex] as ["if_false", number])[1] = loopEnd;
      }
    
      for (const idx of whileScope.$loopBreakTargets!) {
        (code[idx] as ["jump", number])[1] = loopEnd;
      }
      for (const idx of whileScope.$loopContinueTargets!) {
        (code[idx] as ["jump", number])[1] = testStart;
      }
    
      return [];
    }
    case "ClassDeclaration": {
      return compileClassDecl(stmt, code, scope, moduleId);
    }
    case "FunctionDeclaration":
      return compileFunDecl(stmt, scope, code, moduleId);
    case "ImportStatement":
      return compileImportStmt(stmt, scope, code, moduleId);

    case "ExportStatement":
      return compileExportStmt(stmt, scope, code, moduleId);
    default:
      throw new CustomError(
        "RuntimeError",
        `Unknown statement ${(stmt as any).type}`,
        stmt.line ?? 0,
        stmt.column ?? 0
      );
  }
}