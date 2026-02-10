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
import { ArrayLiteral, Expression } from "../../ast/index.js";

export function parseArrayLiteral(this: Parser): ArrayLiteral {
  const start = this.peek();

  this.consume("SYMBOL", "[");
  const elements: Expression[] = [];

  while (this.peek() && this.peek().value !== "]") {
    const element = this.parseExpression();
    elements.push(element);

    if (this.peek().value === ",") this.consume("SYMBOL", ",");
  }

  this.consume("SYMBOL", "]");
  return {
    type: "ArrayLiteral",
    elements,
    line: start.line,
    column: start.column
  };
}