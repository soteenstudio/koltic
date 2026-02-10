import { Parser } from "../index.js";
import { Statement } from "../../ast/index.js";

export function parseExportStmt(this: Parser): Statement {
  const start = this.consume("KEYWORD", "export");

  const path: string[] = [];

  // baca a.b.c.d
  path.push(this.consume("IDENTIFIER").value as string);

  while (this.peek().type === "SYMBOL" && this.peek().value === ".") {
    this.consume("SYMBOL", ".");
    path.push(this.consume("IDENTIFIER").value as string);
  }

  this.consume("SYMBOL", ";");

  const name = path.pop()!;

  return {
    type: "ExportStatement",
    package: path.join("."), // a.b.c
    name,                    // d
    line: start.line,
    column: start.column
  };
}