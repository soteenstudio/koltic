import { Parser } from "../index.js";
import { BreakStatement } from "../../ast/index.js";

export function parseBreakStmt(this: Parser): BreakStatement {
  this.consume('KEYWORD', 'break');
  this.consume('SYMBOL', ';');
  return {
    type: 'BreakStatement',
    line: this.line,
    column: this.column,
  };
}