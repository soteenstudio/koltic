import type { Token } from '../lexer.js';
import {
  Program,
  Statement,
  Expression,
  VarDeclaration,
  PrintLnStatement,
  IfStatement,
  BlockStatement,
  Literal,
  Identifier,
  BinaryExpression,
  ObjectLiteral,
  FunctionDeclaration,
  CallExpression,
  ForStatement,
} from '../ast/index.js';
import {
  parseVarDecl,
  parseIfStmt,
  parseForStmt,
  parseFunDecl,
  parseReturnStmt,
  parseSwitchStmt,
  parseBreakStmt,
  parseContinueStmt,
  parseWhileStmt,
  parseClassDecl,
  parseImportStmt,
  parseExportStmt,
} from "./statement/index.js";
import {
  parseComparison,
  parseAddSub,
  parseMulDiv,
  parseNewExpr,
} from "./expression/index.js";
import { CustomError } from "../error.js";
import { autoInsertSemicolons } from "../utils/index.js";

// === PARSER IMPLEMENTATION ===
export class Parser {
  public tokens: Token[];
  public pos: number = 0;
  public line: number;
  public column: number;

  constructor(tokens: Token[], line?: number, column?: number) {
    this.tokens = autoInsertSemicolons(tokens);
    this.line = line ?? 0;
    this.column = column ?? 0;
  }

  public peek(): Token {
    return this.tokens[this.pos];
  }
  
  public next(): Token {
    if (this.pos < this.tokens.length - 1) this.pos++;
    return this.tokens[this.pos];
  }

  public consume(type: Token['type'], value?: string): Token {
    const token = this.tokens[this.pos];
    if (!token || token.type !== type || (value && token.value !== value)) {
      throw new CustomError(
        "SyntaxError",
        `Expected ${type} ${value || ''}, got ${token?.type} ${token?.value}`,
        this.line || token?.line,
        this.column || token?.column
      );
    }
    this.pos++;
    return token;
  }

  public parseProgram(): Program {
    const body: Statement[] = [];
    while (this.pos < this.tokens.length) {
      body.push(this.parseStatement());
    }
    return { type: 'Program', body };
  }

  public parseStatement(options = { asExprContext: false }): Statement {
    const token = this.peek();
    if (token.type === 'KEYWORD') {
      switch (token.value) {
        case 'literally':
          console.log("literally foo itu 'Hello world'");
          this.peek();
          break;
        case 'val':
        case 'mut':
          return parseVarDecl.call(this);
        case 'if':
          return parseIfStmt.call(this);
        case 'for':
          return parseForStmt.call(this);
        case 'fun':
          return parseFunDecl.call(this);
        case 'return':
          return parseReturnStmt.call(this);
        case 'switch':
          return parseSwitchStmt.call(this);
        case 'break':
          return parseBreakStmt.call(this);
        case 'continue':
          return parseContinueStmt.call(this);
        case 'while':
          return parseWhileStmt.call(this);
        case 'class':
          return parseClassDecl.call(this);
        case "import":
          return parseImportStmt.call(this);
        
        case "export":
          return parseExportStmt.call(this);
        default:
          throw new CustomError(
            "SyntaxError",
            `Unexpected keyword ${token.value}`,
            this.line || token?.line,
            this.column || token?.column
          );
      }
    }
  
    // 🔹 Tambahan: jika identifier diikuti '(', berarti function call
    if (token.type === 'IDENTIFIER' && this.tokens[this.pos + 1]?.value === '(') {
      const expr = this.parseExpression();
      if (!options?.asExprContext) {
        this.consume('SYMBOL', ';');
      } // wajib ada ';' di akhir statement
      return expr as unknown as Statement; // cast karena runtime akan handle CallExpression
    }

    if (token.type === 'IDENTIFIER' && this.tokens[this.pos + 1]?.value === '=') {
      const id = this.consume('IDENTIFIER').value;
      this.consume('SYMBOL', '=');
      const expr = this.parseExpression();
      this.consume('SYMBOL', ';');
      return {
        type: 'AssignmentStatement',
        identifier: id as string,
        expression: expr,
        line: this.line || token?.line,
        column: this.column || token?.column
      };
    }
    
    // 🔹 Tambahan: expression statement
    if (
      token.type === 'IDENTIFIER' ||
      token.type === 'NUMBER' ||
      token.type === 'STRING' ||
      token.value === '(' ||
      token.value === '++' ||
      token.value === '--'
    ) {
      const expr = this.parseExpression();
      this.consume('SYMBOL', ';');
      return expr as unknown as Statement;
    }
  
    throw new CustomError(
      "SyntaxError",
      `Unexpected token ${token.value}`,
      this.line || token?.line,
      this.column || token?.column
    );
  }

  // === EXPRESSIONS ===
  public parseExpression(): Expression {
    const token = this.peek();
  
    if (token.type === "KEYWORD" && token.value === "new") {
      return parseNewExpr.call(this);
    }
  
    return parseComparison.call(this);
  }
  
  public parseExprOrStmt(): Expression {
    const token = this.peek();
  
    // contoh: kalau token bisa start statement
    if (token.type === 'KEYWORD') {
      switch (token.value) {
        case 'val':
        case 'mut':
        case 'if':
        case 'for':
        case 'while':
        case 'return':
        case 'break':
        case 'continue':
        case 'class':
        case 'fun':
          // parse statement, tapi wrap jadi ExpressionStatement
          return this.parseStatement({ asExprContext: true }) as unknown as Expression;
      }
    }
  
    // default → parse expression
    return this.parseExpression();
  }
}