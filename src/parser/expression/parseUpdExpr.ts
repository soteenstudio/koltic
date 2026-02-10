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
import { CustomError } from "../../error.js";
import { Expression } from "../../ast/index.js";
import { parseMemberAccess } from "./parseMemAcc.js";

export function parseUpdateExpression(this: Parser): Expression {
  const token = this.peek();

  if ((token.value === '++' || token.value === '--') && token.type === 'SYMBOL') {
    const op = this.consume('SYMBOL').value as '++' | '--';
    const argToken = this.consume('IDENTIFIER');
    return {
      type: 'UpdateExpression',
      operator: op,
      argument: {
        type: 'Identifier',
        name: String(argToken.value),
        line: argToken.line,
        column: argToken.column
      },
      prefix: true
    };
  }

  let expr = parseMemberAccess.call(this);
  if (this.peek()?.value === '++' || this.peek()?.value === '--') {
    const op = this.consume('SYMBOL').value as '++' | '--';
    if (expr.type !== 'Identifier') {
      throw new CustomError(
        "SyntaxError",
        "Postfix operator can only be applied to identifier",
        expr.line || 0,
        expr.column || 0
      );
    }
    expr = {
      type: 'UpdateExpression',
      operator: op,
      argument: expr,
      prefix: false
    };
  }

  return expr;
}