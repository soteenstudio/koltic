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
import { CustomError } from "../../error.js";
import { parseObjectLiteral } from "./parseObjectLit.js";
import { parseArrayLiteral } from "./parseArrayLit.js";
import { parseNewExpr } from "./parseNewExpr.js";

export function parsePrimary(this: Parser): Expression {
  const token = this.peek();

  if (token.type === 'NUMBER') {
    this.consume('NUMBER');
    return {
      type: 'Literal',
      value: token.value as number,
      line: token.line,
      column: token.column
    };
  }

  if (token.type === 'STRING') {
    this.consume('STRING');
  
    if (typeof token.value === "string") {
      return { type: "Literal", value: token.value, line: token.line, column: token.column };
    }
  
    throw new CustomError(
      "SyntaxError",
      `Invalid string token value`,
      token.line,
      token.column
    );
  }

  if (token.value === '{') {
    return parseObjectLiteral.call(this);
  }
  
  if (token.value === '[') {
    return parseArrayLiteral.call(this);
  }

  if (token.value === '(' || token.type === 'IDENTIFIER') {
    const startPos = this.pos;
  
    let params: any[] = [];
    let isArrow = false;
  
    if (token.type === 'IDENTIFIER' && this.tokens[this.pos + 1]?.value === '=>') {
      params = [{ type: 'Identifier', name: token.value }];
      this.consume('IDENTIFIER');
      this.consume('SYMBOL', '=>');
      isArrow = true;
    }
  
    else if (token.value === '(') {
      this.consume('SYMBOL', '(');
      params = [];
  
      while (this.peek() && this.peek().value !== ')') {
        const next = this.consume('IDENTIFIER');
        params.push({ type: 'Identifier', name: next.value });
        if (this.peek()?.value === ',') this.consume('SYMBOL', ',');
      }
  
      this.consume('SYMBOL', ')');
  
      if (this.peek()?.value === '=>') {
        this.consume('SYMBOL', '=>');
        isArrow = true;
      } else {
        this.pos = startPos;
      }
    }
  
    if (isArrow) {
      let body: Expression | any;
  
      if (this.peek()?.value === '{') {
        const blockStatements = [];
        this.consume('SYMBOL', '{');
        while (this.peek() && this.peek().value !== '}') {
          blockStatements.push(this.parseStatement());
        }
        this.consume('SYMBOL', '}');
        body = { type: 'BlockStatement', body: blockStatements };
      } else {
        body = this.parseExpression();
      }
  
      return {
        type: 'ArrowFunction',
        params,
        body,
        line: token.line,
        column: token.column
      };
    }
  }

  if (token.type === 'IDENTIFIER' || token.type === 'KEYWORD') {
    const id = this.consume(token.type).value as string;
  
    if (this.peek()?.value === '(') {
      this.consume('SYMBOL', '(');
      const args: Expression[] = [];
  
      while (this.peek() && this.peek().value !== ')') {
        args.push(this.parseExpression());
        if (this.peek()?.value === ',') this.consume('SYMBOL', ',');
      }
  
      this.consume('SYMBOL', ')');
  
      return {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: id },
        args,
        line: token.line,
        column: token.column
      };
    }
  
    return {
      type: 'Identifier',
      name: id,
      line: token.line,
      column: token.column
    };
  }

  if (token.value === '(') {
    this.consume('SYMBOL', '(');
    const expr = this.parseExpression();
    this.consume('SYMBOL', ')');
    return expr;
  }

  if (token.type === 'NULL') {
    this.consume('NULL');
    return {
      type: 'Literal',
      value: token.value,
      line: token.line,
      column: token.column
    };
  }
  
  if (token.type === 'UNDEFINED') {
    this.consume('UNDEFINED');
    console.log(token.value, typeof token.value);
    return {
      type: 'Literal',
      value: token.value,
      line: token.line,
      column: token.column
    };
  }

  if (token.type === 'BOOLEAN') {
    this.consume('BOOLEAN');
    return {
      type: 'Literal',
      value: token.value,
      line: token.line,
      column: token.column
    };
  }

  throw new CustomError(
    "SyntaxError",
    `Unexpected token ${token.value}`,
    token?.line || 0,
    token?.column || 0
  );
}