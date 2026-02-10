import { Parser } from "../index.js";
import { FunctionDeclaration } from "../../ast/index.js";
import { parseBlockStmt } from "./blockStmt.js"; 

export function parseFunDecl(this: Parser): FunctionDeclaration {
  const start = this.peek();
  
  this.consume('KEYWORD', 'fun');
  const name = this.consume('IDENTIFIER').value;

  this.consume('SYMBOL', '(');
  const params: { name: string; paramType?: string }[] = [];

  while (this.peek() && this.peek().value !== ')') {
    const paramName = this.consume('IDENTIFIER').value;
    let paramType: string | undefined;

    if (this.peek() && this.peek().value === ':') {
      this.consume('SYMBOL', ':');
      paramType = this.consume('IDENTIFIER').value as string;
    
      // cek nullable
      if (this.peek() && this.peek().value === '?') {
        this.consume('SYMBOL', '?');
        paramType += '?';
      }
    }

    params.push({ name: String(paramName), paramType });

    if (this.peek().value === ',') this.consume('SYMBOL', ',');
  }

  this.consume('SYMBOL', ')');
  // ambil return type kalau ada
  let returnType: string = "Anything";
  if (this.peek() && this.peek().value === ':') {
    this.consume('SYMBOL', ':');
    returnType = this.consume('IDENTIFIER').value as string;
  
    // cek nullable
    if (this.peek() && this.peek().value === '?') {
      this.consume('SYMBOL', '?');
      returnType += '?';
    }
  }
  
  const body = parseBlockStmt.call(this);
  
  return {
    type: 'FunctionDeclaration',
    name: String(name),
    params,
    returnType,       // <-- tambah di sini
    body,
    line: start.line,
    column: start.column
  };
}