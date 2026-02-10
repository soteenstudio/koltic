// === Custom Parser Error ===
import chalk from "chalk";

let filename: string = "";
export function setName(name: string) {
  filename = name;
}

function formatType(type: string) {
  if (type === "SyntaxError") {
    return chalk.redBright.bold(type);
  } else if (type === "TypeError") {
    return chalk.magentaBright.bold(type);
  } else if (type === "ReferenceError") {
    return chalk.yellowBright.bold(type);
  } else if (type === "RuntimeError") {
    return chalk.cyanBright.bold(type);
  } else if (type === "InternalError") {
    return chalk.blueBright.bold(type);
  } else {
    return chalk.bold(type);
  }
}

function highlight(message: string) {
  return message.replace(
    /\b(cannot\s+compare|cannot|name|expected|unexpected\s+token|unexpected|got|for|with)\s+(?:'?\$?Type\.?)?'?([a-zA-Z0-9_$]+)'?([.,:;!?])?/gi,
    (_, word, next, punc) => {
      // Support kata, angka, atau teks yang diapit tanda kutip
      return `${chalk.white(word)} ${chalk.blue(word.toLowerCase() === "name" ? `'${next}'` : next)}${punc || ""}`;
    }
  );
}

export class CustomError {
  public line: number;
  public column: number;

  constructor(
    name: string,
    message: string,
    line: number | null,
    column: number | null
  ) {
    const stackTrace = line !== null && column !== null ? true : false;
    console.log(`${formatType(name)}: ${highlight(message)}\n  at ${chalk.gray.underline(filename)}${stackTrace ? `\n  at ${chalk.gray(`line ${chalk.underline(line)}, column ${chalk.underline(column)}`)}` : ""}`);
    process.exit(0);
  }
}