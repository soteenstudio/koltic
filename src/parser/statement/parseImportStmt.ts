import { Parser } from "../index.js";
import { Statement } from "../../ast/index.js";

export function parseImportStmt(this: Parser): Statement {
  const start = this.consume("KEYWORD", "import");

  const path: string[] = [];

  // baca a.b.c.d
  path.push(this.consume("IDENTIFIER").value as string);

  while (this.peek().type === "SYMBOL" && this.peek().value === ".") {
    this.consume("SYMBOL", ".");

    // stop kalo ketemu *
    if (this.peek().value === "*") break;

    path.push(this.consume("IDENTIFIER").value as string);
  }

  // name atau *
  let name: string | "*";
  if (this.peek().value === "*") {
    this.consume("SYMBOL", "*");
    name = "*";
  } else {
    name = path.pop()!; // ambil terakhir
  }

  this.consume("SYMBOL", ";");

  return {
    type: "ImportStatement",
    package: path.join("."), // a.b.c
    name,                     // d atau *
    line: start.line,
    column: start.column
  };
}