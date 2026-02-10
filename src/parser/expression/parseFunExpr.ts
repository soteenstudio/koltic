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
import { parseBlockStmt } from "../statement/blockStmt.js";

export function parseFunctionExpression(this: Parser, name?: string) {
  const start = this.peek();

  this.consume("SYMBOL", "(");
  const params = [];

  while (this.peek().value !== ")") {
    const p = this.consume("IDENTIFIER").value as string;
    params.push({ name: p });

    if (this.peek().value === ",") {
      this.consume("SYMBOL", ",");
    }
  }

  this.consume("SYMBOL", ")");
  const body = parseBlockStmt.call(this);

  return {
    type: "FunctionExpression",
    name,
    params,
    body,
    line: start.line,
    column: start.column,
  };
}