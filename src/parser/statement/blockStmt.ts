import { Parser } from "../index.js";
import { BlockStatement, Statement } from "../../ast/index.js";

export function parseBlockStmt(this: Parser): BlockStatement {
  const start = this.peek();
  
  this.consume('SYMBOL', '{');
  const body: Statement[] = [];
  while (this.peek() && this.peek().value !== '}') {
    body.push(this.parseStatement());
  }
  this.consume('SYMBOL', '}');
  return {
    type: 'BlockStatement',
    body,
    line: start.line,
    column: start.column
  };
}