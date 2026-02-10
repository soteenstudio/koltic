/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { Parser } from "../index.js";
import { ObjectLiteral, Expression } from "../../ast/index.js";
import { parseFunctionExpression } from "./parseFunExpr.js";

export function parseObjectLiteral(this: Parser): ObjectLiteral {
  const start = this.peek();

  this.consume("SYMBOL", "{");
  const properties: { key: string; value: Expression }[] = [];

  while (this.peek() && this.peek().value !== "}") {
    const keyToken = this.consume("IDENTIFIER");
    const key = keyToken.value as string;
 
    if (this.peek().value === "(") {
      const fn: Expression = parseFunctionExpression.call(this, key) as Expression;

      properties.push({
        key,
        value: fn,
      });
    } else {
      this.consume("SYMBOL", ":");
      const value = this.parseExprOrStmt();

      properties.push({
        key,
        value,
      });
    }

    if (this.peek().value === ",") {
      this.consume("SYMBOL", ",");
    }
  }

  this.consume("SYMBOL", "}");
  return {
    type: "ObjectLiteral",
    properties,
    line: start.line,
    column: start.column,
  };
}