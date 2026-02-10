import { Parser } from "../../parser/index.js";
import { VarDeclaration, NoInitExpression, Expression } from "../../ast/index.js";

export function parseVarDecl(this: Parser, eatSemicolon: boolean = true): VarDeclaration {
  const start = this.peek();
  
  const kind = this.consume('KEYWORD').value as 'val' | 'mut';
  const id = this.consume('IDENTIFIER').value as string;

  let varType: string | undefined;
  if (this.peek() && this.peek().value === ':') {
    this.consume('SYMBOL', ':');
  
    let typeName = this.consume('IDENTIFIER').value as string;
  
    if (this.peek()?.value === '?') {
      this.consume('SYMBOL', '?');
      typeName += '?';
    }
  
    varType = typeName;
  }

  let expr: Expression;
  if (this.peek()?.value === '=') {
    this.consume('SYMBOL', '=');
    expr = this.parseExpression();
  } else {
    expr = {
      type: 'NoInitExpression',
      line: start.line,
      column: start.column
    } as NoInitExpression;
  }

  if (eatSemicolon) {
    this.consume('SYMBOL', ';');
  }
  
  return {
    type: 'VarDeclaration',
    kind,
    identifier: id,
    varType,
    expression: expr,
    line: start.line,
    column: start.column
  };
}