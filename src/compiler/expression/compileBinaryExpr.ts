/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { BinaryExpression } from "../../ast/index.js";
import { Instruction } from "lightvm";
import { Scope } from "../../parser/Scope.js";
import { exprType, normalizeType, getValueType } from "../../utils/index.js";
import { CustomError } from "../../error.js";
import { compileExpr } from "./compileExpr.js";

export function compileBinaryExpr(node: BinaryExpression, code: Instruction[], scope: Scope, moduleId: string) {
  const bin = node;
  const left = compileExpr(bin.left, scope, false, moduleId);
  const right = compileExpr(bin.right, scope, false, moduleId);
  const leftType = normalizeType(exprType(bin.left, scope));
  const rightType = normalizeType(exprType(bin.right, scope));
  if (leftType !== rightType) {
    const errorNode = leftType.endsWith("?") && rightType !== "Null" ? bin.right : bin.left;
    throw new CustomError(
      "TypeError",
      `Cannot compare ${leftType.endsWith("?") ? `nullable ${leftType.replace("?", "")}` : leftType} with ${rightType.endsWith("?") ? `nullable ${rightType.replace("?", "")}` : rightType}`,
      errorNode.line ?? 0,
      errorNode.column ?? 0
    );
  }
  code.push(...left);
  code.push(...right);
  switch (bin.operator) {
    case "||":
      code.push(["or"]);
      break;
    case "&&":
      code.push(["and"]);
      break;
    case ">":
      code.push(["gt"]);
      break;
    case "<":
      code.push(["lt"]);
      break;
    case ">=":
      code.push(["ge"]);
      break;
    case "<=":
      code.push(["le"]);
      break;
    case "==":
      code.push(["eq"]);
      break;
    case "===":
      code.push(["eq"]);
      break;
    case "!=":
      code.push(["neq"]);
      break;
    case "!==":
      code.push(["neq"]);
      break;
    case "+":
      if (leftType === "$Type.String" && rightType === "$Type.String") {
        code.push(["concat"])
      } else {
        code.push(["add", leftType === "Integer" ? "int" : leftType === "Long" ? "lng" : leftType === "Float" ? "flt" : "dbl"]);
      }
      break;
    case "-":
      code.push(["sub", leftType === "Integer" ? "int" : leftType === "Long" ? "lng" : leftType === "Float" ? "flt" : "dbl"]);
      break;
    case "*":
      code.push(["mul"]);
      break;
    case "/":
      code.push(["div"]);
      break;
    case "%":
      code.push(["mod"]);
      break;
    default:
      throw new CustomError(
        "RuntimeError",
        `Unknown operator ${bin.operator}`,
        node.line,
        node.column
      );
  }
  return code;
}