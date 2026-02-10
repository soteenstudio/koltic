import { Parser } from "../index.js";
import { VarDeclaration, ForStatement, BlockStatement, Expression } from "../../ast/index.js";
import { parseVarDecl } from "./varDecl.js";
import { parseBlockStmt } from "./blockStmt.js"; 

export function parseForStmt(this: Parser): ForStatement {
  const start = this.peek();
  
  this.consume('KEYWORD', 'for');
  this.consume('SYMBOL', '(');
  
  let init: VarDeclaration | Expression = {
    type: "NoInitExpression",
    line: this.line ?? 0,
    column: this.column ?? 0
  };
  if (this.peek().value === "val" || this.peek().value === "mut") {
    init = parseVarDecl.call(this, false);
  } else if (!(this.peek().value === ";")) {
    init = this.parseExpression();
  }
  this.consume("SYMBOL", ";");
  
  let test: Expression = {
    type: "NoInitExpression",
    line: this.line ?? 0,
    column: this.column ?? 0
  };
  if (!(this.peek().value === ";")) {
    test = this.parseExpression();
  }
  this.consume("SYMBOL", ";");
  
  let update: Expression = {
    type: "NoInitExpression",
    line: this.line ?? 0,
    column: this.column ?? 0
  };
  if (!(this.peek().value === ")")) {
    update = this.parseExpression();
  }
  this.consume('SYMBOL', ')');
  
  const consequent = parseBlockStmt.call(this);

  return {
    type: 'ForStatement',
    init,
    test,
    update,
    consequent,
    line: start.line,
    column: start.column
  };
}