/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { compileLiteralExpr } from "./compileLiteralExpr.js";
import { compileIdentifierExpr } from "./compileIdentifierExpr.js";
import { compileBinaryExpr } from "./compileBinaryExpr.js";
import { compileObjectLit } from "./compileObjectLit.js";
import { compileArrayLit } from "./compileArrayLit.js";
import { compileMemberExpr } from "./compileMemberExpr.js";
import { compileCallExpr } from "./compileCallExpr.js";
import { compileUpdExpr } from "./compileUpdExpr.js";
import { compileArrowExpr } from "./compileArrowExpr.js";
import { compileFunctionExpr } from "./compileFunExpr.js";
import { CustomError } from "../../error.js";
import { Instruction } from "lightvm";
import { Expression, CallExpression, ObjectLiteral } from "../../ast/index.js";
import { Scope } from "../../parser/Scope.js";

export function compileExpr(
  node: Expression,
  scope: Scope,
  isTypeCheck: boolean = false,
  moduleId: string
): Instruction[] {
  const code: Instruction[] = [];
  switch (node.type) {
    case "Literal": {
      return compileLiteralExpr(node, code, scope, moduleId);
    }
    case "Identifier": {
      return compileIdentifierExpr(node, code, scope, isTypeCheck);
    }
    case "BinaryExpression": {
      return compileBinaryExpr(node, code, scope, moduleId);
    }
    case "ObjectLiteral": {
      return compileObjectLit(node, code, scope, moduleId);
    }
    case "ArrayLiteral": {
      return compileArrayLit(node, code, scope);
    }
    case "MemberExpression": {
      return compileMemberExpr(node, code, scope, moduleId);
    }
    case "CallExpression": {
      return compileCallExpr(node, code, scope, moduleId);
    }
    case "UpdateExpression": {
      return compileUpdExpr(node, code, scope);
    }
    case "ArrowFunction": {
      return compileArrowExpr(node, code, scope);
    }
    case "FunctionExpression": {
      return compileFunctionExpr(node, code, scope, moduleId);
    }
    default:
      return [];
      throw new CustomError(
        "RuntimeError",
        `Unknown expression type ${(node as any).type}`,
        node.line ?? 0,
        node.column ?? 0
      );
  }
}