import { Expression, BlockStatement, SwitchCase } from "../../ast/index.js";
import { Parser } from "../index.js";
import { Token } from "../../lexer.js";
import { parseBlockStmt } from "./blockStmt.js";

export function parseCaseBlock(this: Parser, test: Expression, startToken: Token): SwitchCase {
  const consequent: BlockStatement = {
    type: "BlockStatement",
    body: [],
    line: startToken.line,
    column: startToken.column,
  };

  while (
    this.peek().value !== "case" &&
    this.peek().value !== "default" &&
    this.peek().value !== "}"
  ) {
    if (this.peek().value === "{") {
      consequent.body.push(parseBlockStmt.call(this));
    } else {
      consequent.body.push(this.parseStatement());
    }
  }

  return {
    type: "SwitchCase",
    test,
    consequent,
    line: startToken.line,
    column: startToken.column,
  };
}