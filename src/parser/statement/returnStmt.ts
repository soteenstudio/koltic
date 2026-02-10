import { Parser } from "../index.js";
import { ReturnStatement, Expression } from "../../ast/index.js";

export function parseReturnStmt(this: Parser): ReturnStatement {
  const start = this.peek();
  this.consume('KEYWORD', 'return');

  let expr: Expression = {
    type: "NoValueExpression",
    line: this.line ?? 0,
    column: this.column ?? 0
  };
  if (this.peek() && this.peek().value !== ';') {  // cek kalo bukan langsung semicolon
    expr = this.parseExpression();
  }

  this.consume('SYMBOL', ';');

  return {
    type: "ReturnStatement",
    expression: expr,
    line: start.line,
    column: start.column,
  };
}