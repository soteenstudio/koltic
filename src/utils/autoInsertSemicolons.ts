// 🧩 Preprocess: Tambah ";" otomatis di akhir line jika belum ada
import { Token } from "../lexer.js";

export function autoInsertSemicolons(tokens: Token[]): Token[] {
  const result: Token[] = [];
  
  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i];
    const next = tokens[i + 1];
    result.push(current);

    // 🔹 Skip baris yang jelas gak perlu ";" (kayak '{', '}', '(', 'for', 'if', 'fun', dll)
    if (
      current.type === "SYMBOL" && 
      ["{", "}", "(", ")", ",", ":"].includes((current.value as string))
    ) continue;

    if (current.type === "KEYWORD" && ["if", "for", "fun", "else"].includes((current.value as string)))
      continue;

    // 🔹 Jika ini akhir baris dan token berikutnya beda line,
    // dan token sekarang bukan ";", tambahin semicolon
    if (
      next &&
      next.line > current.line && 
      current.value !== ";"
    ) {
      result.push({
        type: "SYMBOL",
        value: ";",
        line: current.line,
        column: current.column + ((current.value as string)?.length || 1),
      });
    }

    // 🔹 Jika token terakhir file, tapi belum diakhiri ";"
    if (!next && current.value !== ";") {
      result.push({
        type: "SYMBOL",
        value: ";",
        line: current.line,
        column: current.column + ((current.value as string)?.length || 1),
      });
    }
  }

  return result;
}