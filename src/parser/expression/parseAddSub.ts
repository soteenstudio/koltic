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
import { parseMulDiv } from "./parseMulDiv.js";
import { Expression } from "../../ast/index.js";

export function parseAddSub(this: Parser): Expression {
  let left = parseMulDiv.call(this);
  while (this.peek() && ['+', '-'].includes(this.peek().value as string)) {
    const op = this.consume('SYMBOL').value as string;
    const right = parseMulDiv.call(this);
    left = {
      type: 'BinaryExpression',
      operator: op,
      left,
      right,
      line: this.line,
      column: this.column
    };
  }
  return left;
}