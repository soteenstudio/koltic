/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { Lexer } from "../lexer.js";
import { Parser } from "../parser/index.js";
import { run } from "../compiler/compiler.js";
import { LightVM, Instruction } from "lightvm";
import { setName } from "../error.js";
import { formatDuration, warning, loadConfig } from "../utils/index.js";
import { figures } from "../utils/figures.js";
import fs from "node:fs";
import path from "node:path";

const vm = new LightVM();
const loader = vm.tools().loader;

export function compileFile(filename: string, perform: boolean): void {
  if (filename.endsWith(".lt")) {
    setName(path.basename(filename));
    const config = loadConfig(filename);
    
    const code = fs.readFileSync(filename, 'utf8');
  
    const totalStart = process.hrtime.bigint();
    const tStart = process.hrtime.bigint();
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    const tEnd = process.hrtime.bigint();
    
    const pStart = process.hrtime.bigint();
    const parser = new Parser(tokens);
    const ast = parser.parseProgram();
    const pEnd = process.hrtime.bigint();
    
    const cStart = process.hrtime.bigint();
    const bytecode = run(ast);
    const cEnd = process.hrtime.bigint();
    
    const wStart = process.hrtime.bigint();
    const stringData = loader.stringifyLTC(bytecode);
    
    if (perform) {
      const tTime = formatDuration(Number(tEnd - tStart) / 1_000_000);
      const pTime = formatDuration(Number(pEnd - pStart) / 1_000_000);
      const cTime = formatDuration(Number(cEnd - cStart) / 1_000_000);
      const wTime = formatDuration(Number(wEnd - wStart) / 1_000_000);
      const totalTime = formatDuration(Number(totalEnd - totalStart) / 1_000_000);
      
      const lines = [
        `${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "} Tokenizing Time : ${tTime} ${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "}`,
        `${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "} Parsing Time   : ${pTime} ${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "}`,
        `${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "} Compile Time   : ${cTime} ${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "}`,
        `${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "} Writing Time   : ${wTime} ${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "}`,
        `${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "} Total Time     : ${totalTime} ${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "}`
      ];
      
      warning(lines, config);
    }
  } else {
    throw new Error(`Invalid extension ${filename.split(".")[1]}`)
  }
}