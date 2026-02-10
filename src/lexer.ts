import { CustomError } from "./error.js";

export interface Token {
  type: 'NUMBER'
      | 'STRING'
      | 'KEYWORD'
      | 'IDENTIFIER'
      | 'SYMBOL'
      | 'BOOLEAN'
      | 'NULL'
      | 'UNDEFINED';
  value: string | number | boolean | null | undefined;
  line: number;
  column: number;
}

export class Lexer {
  private input: string;
  private pos: number = 0;
  private tokens: Token[] = [];
  private keywords: Set<string>;
  private operators: Set<string>;
  private line: number = 1;
  private column: number = 1;

  constructor(input: string) {
    this.input = input;
    this.keywords = new Set(['val', 'mut', 'fun', 'if', 'else', 'for', 'while', 'switch', 'case', 'default', 'break', 'continue', 'return', 'true', 'false', 'null', 'undefined', 'class', 'new', 'import', 'export', 'from', 'literally']);
    this.operators = new Set(['+', '-', '*', '/', '%', '=', '==', '===', '!=', '!==', '<', '>', '<=', '>=', '||', '&&', '++', '--', '?', '{', '}']);
  }

  private isAlpha(ch: string): boolean {
    return /[A-Za-z_]/.test(ch);
  }

  private isDigit(ch: string): boolean {
    return /\d/.test(ch);
  }

  private isAlnum(ch: string): boolean {
    return this.isAlpha(ch) || this.isDigit(ch);
  }

  private nextChar(): string {
    return this.pos < this.input.length ? this.input[this.pos] : "\0";
  }

  private advance(): void {
    if (this.nextChar() === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    this.pos++;
  }

  public tokenize(): Token[] {
    while (this.pos < this.input.length) {
      let ch = this.nextChar();

      if (ch === undefined) break;
      
      // Skip whitespace
      if (/\s/.test(ch)) {
        this.advance();
        continue;
      }

      const tokenLine = this.line;
      const tokenColumn = this.column;

      // Number literal (support float)
      if (this.isDigit(ch)) {
        let num = '';
        let hasDot = false;
      
        while (this.isDigit(ch) || (ch === '.' && !hasDot)) {
          if (ch === '.') hasDot = true;
          num += ch;
          this.advance();
          ch = this.nextChar();
        }
      
        const value = hasDot ? parseFloat(num) : parseInt(num, 10);
        this.tokens.push({ type: 'NUMBER', value, line: tokenLine, column: tokenColumn });
        continue;
      }
      
      // String literal
      if (ch === '"' || ch === "'") {
        const quote = ch;
        this.advance(); // skip opening quote
        let str = '';

        while (this.pos < this.input.length && this.nextChar() !== quote) {
          if (this.nextChar() === '\\') {
            this.advance();
            const esc = this.nextChar();
            switch (esc) {
              case 'n': str += '\n'; break;
              case 't': str += '\t'; break;
              case '"': str += '"'; break;
              case "'": str += "'"; break;
              case '\\': str += '\\'; break;
              default: str += esc; break;
            }
          } else {
            str += this.nextChar();
          }
          this.advance();
        }

        if (this.nextChar() !== quote) throw new SyntaxError('Unterminated string literal');
        this.advance(); // skip closing quote
        
        if (quote === "'" && str.length !== 1) {
          throw new CustomError(
            "SyntaxError",
            "Expected single character for $Type.Character literal",
            tokenLine,
            tokenColumn
          );
        }
        
        this.tokens.push({ type: 'STRING', value: quote === "'" ? `'${str}'` : `"${str}"`, line: tokenLine, column: tokenColumn });
        continue;
      }

      // Identifier / keyword
      if (this.isAlpha(ch)) {
        let id = '';
        while (this.isAlnum(ch)) {
          id += ch;
          this.advance();
          ch = this.nextChar();
        }
        if (id === "true" || id === "false") {
          this.tokens.push({
            type: 'BOOLEAN', // atau bisa bikin type baru "BOOLEAN" biar rapih
            value: id === "true",
            line: tokenLine,
            column: tokenColumn,
          });
        } else if (id === "null") {
          this.tokens.push({
            type: 'NULL',
            value: null,
            line: tokenLine,
            column: tokenColumn,
          });
        } else if (id === "undefined") {
          this.tokens.push({
            type: "UNDEFINED",
            value: undefined,
            line: tokenLine,
            column: tokenColumn,
          });
        } else {
          this.tokens.push({
            type: this.keywords.has(id) ? 'KEYWORD' : 'IDENTIFIER',
            value: id,
            line: tokenLine,
            column: tokenColumn,
          });
        }
        continue;
      }

      // Operators and punctuation
      if ('+-*/=;(){}[]<>,:.!?<>$'.includes(ch)) {
        let op = ch;
        const nextCh = this.input[this.pos + 1];
        const nextNextCh = this.input[this.pos + 2];
        
        if (ch === '/' && nextCh === '/') {
          this.advance();
          this.advance();
          while (this.pos < this.input.length && this.nextChar() !== '\n') {
            this.advance();
          }
          continue;
        }
        
        // Multi-line comment + JSDoc /** */
        if (ch === '/' && nextCh === '*') {
          this.advance(); // skip '/'
          this.advance(); // skip '*'
        
          // Deteksi apakah /** (komentar dokumentasi)
          const isDocComment = this.nextChar() === '*';
          if (isDocComment) this.advance(); // skip '*' ketiga
        
          let commentText = '';
        
          while (this.pos < this.input.length) {
            if (this.nextChar() === '*' && this.input[this.pos + 1] === '/') {
              this.advance(); // skip '*'
              this.advance(); // skip '/'
              break;
            }
            commentText += this.nextChar();
            this.advance();
          }
        
          // Kalau pengen komentar /** */ dimasukin jadi token khusus:
          /*if (isDocComment) {
            this.tokens.push({
              type: 'STRING',
              value: commentText.trim(),
              line: tokenLine,
              column: tokenColumn,
            });
          }*/
        
          continue;
        }
      
        // gabung ++ atau --
        if ((ch === '+' && nextCh === '+') || (ch === '-' && nextCh === '-')) {
          op += nextCh;
          this.advance();
        }
        
        else if ((ch === '=' || ch === '!') && nextCh === '=' && nextNextCh === '=') {
          op = ch + nextCh + nextNextCh;
          this.advance();
          this.advance();
        }
        // gabung dua-char operator lainnya (==, <=, >=, !=)
        // gabung dua-char operator lainnya (==, <=, >=, !=, ===)
        else if (['=', '<', '>', '!'].includes(ch) && ['=', '='].includes(nextCh)) {
          op = ch + nextCh;
          this.advance();
        }
      
        this.tokens.push({ type: 'SYMBOL', value: op, line: tokenLine, column: tokenColumn });
        this.advance();
        continue;
      }

      throw new SyntaxError(`Unknown character: ${ch} at line ${tokenLine}, column ${tokenColumn}`);
    }

    return this.tokens;
  }
}