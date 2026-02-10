import { Parser } from "../index.js";
import { SwitchStatement, SwitchCase, Expression, BlockStatement } from "../../ast/index.js";
import { parseCaseBlock } from "./parseCaseBlock.js";

export function parseSwitchStmt(this: Parser): SwitchStatement {
  const start = this.peek();

  this.consume("KEYWORD", "switch");
  this.consume("SYMBOL", "(");
  const discriminant = this.parseExpression();
  this.consume("SYMBOL", ")");

  this.consume("SYMBOL", "{");

  const cases: SwitchCase[] = [];

  while (this.peek().value !== "}") {
    const caseStart = this.peek();

    if (this.peek().value === "case") {
      this.consume("KEYWORD", "case");
      const test = this.parseExpression();
      this.consume("SYMBOL", ":");
      cases.push(parseCaseBlock.call(this, test, caseStart));
    } else if (this.peek().value === "default") {
      this.consume("KEYWORD", "default");
      this.consume("SYMBOL", ":");
      cases.push(parseCaseBlock.call(
        this,
        {
          type: "Literal",
          value: null
        },
        caseStart
      ));
    } else {
      throw new Error(`Unexpected token in switch: ${this.peek().value}`);
    }
  }

  this.consume("SYMBOL", "}");

  return {
    type: "SwitchStatement",
    discriminant,
    cases,
    line: start.line,
    column: start.column,
  };
}