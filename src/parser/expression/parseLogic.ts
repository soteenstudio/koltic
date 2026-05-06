// 1. Tambahin import type di paling atas
import type { Parser } from "../index.js"; 
import type { Expression, BinaryExpression } from "../../ast/index.js";
import { parseComparison } from "./parseComparison.js";

export function parseLogic(this: Parser): Expression {
  // 1. Ambil tingkat yang lebih tinggi dulu (Comparison)
  let left = parseComparison.call(this);

  // 2. Cek apakah ada && atau ||
  while (this.peek()?.value === '&&' || this.peek()?.value === '||') {
    const operator = this.consume('SYMBOL').value as string;
    const right = parseComparison.call(this); // Ambil sisi kanannya
    
    // Pastiin data line & column diambil dari token operatornya biar akurat
    const currentToken = this.peek(); 

    left = {
      type: 'BinaryExpression',
      left,
      operator,
      right,
      line: currentToken?.line || this.line,
      column: currentToken?.column || this.column
    } as BinaryExpression;
  }

  return left;
}
