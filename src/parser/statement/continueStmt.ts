import { Parser } from "../index.js";
import { ContinueStatement } from "../../ast/index.js";

export function parseContinueStmt(this: Parser): ContinueStatement {
  this.consume('KEYWORD', 'continue');
  this.consume('SYMBOL', ';');
  return {
    type: 'ContinueStatement',
    line: this.line,
    column: this.column,
  };
}