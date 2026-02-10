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
import { parseAddSub } from "./parseAddSub.js";
import { Expression } from "../../ast/index.js";

export function parseComparison(this: Parser): Expression {
  const start = this.peek();
  
  let left = parseAddSub.call(this);
  while (
    this.peek() &&
    ['>', '<', '>=', '<=', '==', '===', '!=', '!=='].includes(this.peek().value as string)
  ) {
    const op = this.consume('SYMBOL').value as string;
    const right = parseAddSub.call(this);
    left = {
      type: 'BinaryExpression',
      operator: op,
      left,
      right,
      line: start.line,
      column: start.column
    };
  }
  return left;
}