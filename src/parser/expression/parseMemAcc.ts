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
import { Expression } from "../../ast/index.js";
import { parsePrimary } from "./parsePrimary.js";

export function parseMemberAccess(this: Parser): Expression {
  let object = parsePrimary.call(this);

  while (this.peek() && (this.peek().value === '.' || this.peek().value === '[')) {
    if (this.peek().value === '.') {
      this.consume('SYMBOL', '.');
      const property = this.consume('IDENTIFIER').value as string;
      object = {
        type: 'MemberExpression',
        object,
        property,
      };
    } else if (this.peek().value === '[') {
      this.consume('SYMBOL', '[');
      const index = this.parseExpression();
      this.consume('SYMBOL', ']');
      object = {
        type: 'MemberExpression',
        object,
        property: index, 
      };
    }
  }

  return object;
}