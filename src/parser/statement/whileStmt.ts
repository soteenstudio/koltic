import { Parser } from "../index.js";
import { WhileStatement, BlockStatement, Expression } from "../../ast/index.js";
import { parseBlockStmt } from "./blockStmt.js"; 

export function parseWhileStmt(this: Parser): WhileStatement {
  const start = this.peek();

  this.consume('KEYWORD', 'while');
  this.consume('SYMBOL', '(');

  let test: Expression = {
    type: "NoInitExpression",
    line: this.line ?? 0,
    column: this.column ?? 0
  };

  if (!(this.peek().value === ")")) {
    test = this.parseExpression();
  }

  this.consume('SYMBOL', ')');

  const body = parseBlockStmt.call(this);

  console.debug({
    type: 'WhileStatement',
    test,
    body,
    line: start.line,
    column: start.column
  });
  return {
    type: 'WhileStatement',
    test,
    body,
    line: start.line,
    column: start.column
  };
}