/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { CallExpression, Expression } from "../../ast/index.js";
import { Instruction } from "../../vm/Instruction.js";
import { Scope } from "../../parser/Scope.js";
import { CustomError } from "../../error.js";
import { compileExpr } from "./compileExpr.js";
import { types } from "../../utils/getValueType.js";
import {
  exprType,
  normalizeType,
  getDeclaredValue,
  getDeclaredTypeForVar,
  isAnyType
} from "../../utils/index.js";
import { functions } from "../compiler.js";

export function compileCallExpr(node: CallExpression, code: Instruction[], scope: Scope): Instruction[] {
  const call = node;

  // 🔹 built-in functions
  const builtins: Record<string, string> = {
    print: "print",
    println: "println",
    typeof: "typeof",
    string: "string",
    number: "number",
    length: "length"
  };
  
  const manyArg: string[] = ["print", "println"];

  if (builtins[call.callee.name]) {
    const isTypeCheck = call.callee.name === "typeof" ? true : false;
  
    if (manyArg.includes(call.callee.name)) {
      for (let i = 0; i < call.args.length; i++) {
        code.push(...compileExpr(call.args[i], scope, isTypeCheck));
        if (i < call.args.length - 1) {
          code.push(["print"]);
          code.push(["push", "::space"]);
          code.push(["print"]);
        } else {
          code.push([builtins[call.callee.name] as any]);
        }
      }
    } else {
      if (call.args.length !== 1) {
        throw new CustomError(
          "SyntaxError",
          `Name '${call.callee.name}' expected 1 argument, but got ${call.args.length}`,
          node.line ?? 0,
          node.column ?? 0
        );
      }
      code.push(...compileExpr(call.args[0], scope, isTypeCheck));
      code.push([builtins[call.callee.name] as any]);
    }
  
    return code;
  }

  const func = functions[call.callee.name];
  if (!func) {
    throw new CustomError(
      "ReferenceError",
      `Name '${call.callee.name}' is not defined`,
      node.line ?? 0,
      node.column ?? 0
    );
  }

  if (call.args.length !== func.params.length) {
    throw new CustomError(
      "TypeError",
      `Name '${call.callee.name}' expected ${func.params.length} arguments, but got ${call.args.length}`,
      node.line ?? 0,
      node.column ?? 0
    );
  }

  for (let i = 0; i < call.args.length; i++) {
    const arg = call.args[i];
    const param = func.params[i];
    const expected = normalizeType(String(param.paramType ?? "Anything"));
    let got = normalizeType(exprType(arg, scope));

    if (!types.includes(normalizeType(expected))) {
      throw new CustomError(
        "TypeError",
        `Name '${param.name}' has unexpected ${normalizeType(expected)}`,
        node.line ?? 0,
        node.column ?? 0
      );
    }

    const nullable = expected.endsWith("?");
    if (!nullable && got === "Null") {
      throw new CustomError(
        "TypeError",
        `Name '${param.name}' is not nullable but got null`,
        node.line ?? 0,
        node.column ?? 0
      );
    }

    if (!isAnyType(expected)) {
      if ((!nullable && got !== "Null") && expected && got && expected !== got) {
        throw new CustomError(
          "TypeError",
          `Name '${param.name}' expected ${expected}, but got ${got}`,
          node.line ?? 0,
          node.column ?? 0
        );
      }
    }
  }

  call.args.forEach((arg: Expression) => {
    code.push(...compileExpr(arg, scope));
  });

  code.push(["call", call.callee.name, call.args.length]);

  if (func.returnType) {
    const normalizedReturn = normalizeType(func.returnType);
    const gotType = normalizeType(exprType(node, scope));
    (node as any).returnType = normalizedReturn;
  }

  return code;
}