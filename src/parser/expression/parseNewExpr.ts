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
import { NewExpression, Expression } from "../../ast/index.js";

export function parseNewExpr(this: Parser): NewExpression {
  const start = this.peek();

  this.consume("KEYWORD", "new");

  const className = this.consume("IDENTIFIER").value as string;

  this.consume("SYMBOL", "(");

  const args: Expression[] = [];
  while (this.peek() && this.peek().value !== ")") {
    const expr = this.parseExpression();
    args.push(expr);

    if (this.peek().value === ",") {
      this.consume("SYMBOL", ",");
    }
  }

  this.consume("SYMBOL", ")");

  return {
    type: "NewExpression",
    className,
    args,
    line: start.line,
    column: start.column,
  };
}