import { Parser } from "../index.js";
import { parseBlockStmt } from "./blockStmt.js";
import { parseFunDecl } from "./funDecl.js";
import { parseVarDecl } from "./varDecl.js";
import { FunctionDeclaration, VarDeclaration, ClassDeclaration } from "../../ast/index.js";

export function parseClassDecl(this: Parser): ClassDeclaration {
  const start = this.peek();

  this.consume("KEYWORD", "class");
  const name = this.consume("IDENTIFIER").value;
  this.consume("SYMBOL", "{");

  let constructor: FunctionDeclaration | undefined;
  const properties: VarDeclaration[] = [];
  const methods: FunctionDeclaration[] = [];

  while (this.peek() && this.peek().value !== "}") {
    let access: "public" | "private" | "protected" | undefined;

    // 🔸 Cek kalau ada modifier
    const tokenVal = this.peek().value;
    if (typeof tokenVal === "string" && ["public", "private", "protected"].includes(tokenVal)) {
      access = this.consume("KEYWORD").value as any;
    }

    const current = this.peek();

    // === CONSTRUCTOR ===
    if (current.value === "constructor") {
      const startC = this.peek(); // consume 'constructor'
      this.consume("IDENTIFIER", "constructor");
      this.consume("SYMBOL", "(");

      const params: { name: string; paramType?: string; mutable?: boolean }[] = [];

      while (this.peek() && this.peek().value !== ")") {
        // kalau paramnya val/mut -> pake parseVarDecl
        if (this.peek().value === "val" || this.peek().value === "mut") {
          const propDecl = parseVarDecl.call(this, false);
          properties.push(propDecl);

          const { identifier, varType, kind } = propDecl;
          params.push({
            name: identifier,
            paramType: (varType as string | undefined),
            mutable: kind === "mut",
          });
        } else {
          // param biasa
          const paramName = this.consume("IDENTIFIER").value;
          let paramType: string | number | boolean | null | undefined;

          if (this.peek() && this.peek().value === ":") {
            this.consume("SYMBOL", ":");
            paramType = this.consume("IDENTIFIER").value;
            if (this.peek() && this.peek().value === "?") {
              this.consume("SYMBOL", "?");
              paramType += "?";
            }
          }

          params.push({
            name: String(paramName), 
            paramType: (paramType as string | undefined) });
        }

        if (this.peek().value === ",") this.consume("SYMBOL", ",");
      }

      this.consume("SYMBOL", ")");
      const body = parseBlockStmt.call(this);

      constructor = {
        type: "FunctionDeclaration",
        name: "constructor",
        params,
        returnType: "void",
        body,
        line: startC.line,
        column: startC.column,
        access: access ?? "public", // simpan access modifier
      };
      
      continue;
    }

    // === METHOD ===
    if (current.value === "fun") {
      const method = parseFunDecl.call(this);
      (method as any).access = access ?? "public";
      methods.push(method);
      continue;
    }

    // === PROPERTY ===
    if (current.value === "val" || current.value === "mut") {
      const propDecl = parseVarDecl.call(this);
      (propDecl as any).access = access ?? "public";
      properties.push(propDecl);
      continue;
    }
    
    continue;
  }

  this.consume("SYMBOL", "}");

  return {
    type: "ClassDeclaration",
    name: String(name),
    constructor,
    properties,
    methods,
    line: start.line,
    column: start.column,
  };
}