import { Parser } from "../index.js";
import { IfStatement, BlockStatement } from "../../ast/index.js";
import { parseBlockStmt } from "./blockStmt.js"; 

export function parseIfStmt(this: Parser): IfStatement {
  const start = this.peek();
  
  this.consume('KEYWORD', 'if');
  this.consume('SYMBOL', '(');
  const test = this.parseExpression();
  this.consume('SYMBOL', ')');
  const consequent = parseBlockStmt.call(this);

  let alternate: BlockStatement | IfStatement | null = null;

  if (this.peek() && this.peek().type === 'KEYWORD' && this.peek().value === 'else') {
    this.consume('KEYWORD', 'else');

    // kalau abis 'else' langsung ada 'if', berarti ini else if
    if (this.peek() && this.peek().type === 'KEYWORD' && this.peek().value === 'if') {
      alternate = parseIfStmt.call(this); // rekursif
    } else {
      alternate = parseBlockStmt.call(this);
    }
  }

  return {
    type: 'IfStatement',
    test,
    consequent,
    alternate,
    line: start.line,
    column: start.column
  };
}