/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { Literal } from "../../ast/index.js";
import { Instruction } from "lightvm";
import { Scope } from "../../parser/Scope.js";
import { Lexer } from "../../lexer.js";
import { Parser } from "../../parser/index.js";
import { compileExpr } from "../expression/compileExpr.js";
import { findScopeForVar } from "../../utils/index.js";
import { CustomError } from "../../error.js";

export function compileLiteralExpr(node: Literal, code: Instruction[], scope: Scope, moduleId: string) {
  const val = node.value;

  if (typeof val === "string") {
    const parts = val.split(/(\$\{.*?\}|\$[A-Za-z_][A-Za-z0-9_]*)/g).filter(p => p.length > 0);

    let exprCount = 0;

    for (const part of parts) {
      if (part.startsWith("${") && part.endsWith("}")) {
        const exprStr = part.slice(2, -1).trim();
        const exprTokens = new Lexer(exprStr).tokenize();
        const exprAst = new Parser(exprTokens, node.line, node.column).parseExpression();
        
        const innerCode = compileExpr(exprAst, scope, false, moduleId);
        code.push(...innerCode);
        
        exprCount++;
      } else if (part.startsWith("$")) {
        const varName = part.slice(1);
        const scp = findScopeForVar(scope, varName);
        
        if (!scp) {
          throw new CustomError(
            "ReferenceError",
            `${varName} is not defined`,
            node.line ?? 0,
            node.column ?? 0
          );
        }
        
        code.push(["get", varName]);
        exprCount++;
      } else {
        code.push(["push", part]);
        exprCount++;
      }
    }

    for (let i = 0; i < exprCount - 1; i++) {
      code.push(["concat"]);
    }
  } else {
    code.push(["push", val]);
  }

  return code;
}