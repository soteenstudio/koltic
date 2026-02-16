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
import { compileProgram } from "../compiler/index.js";
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
  
    const tStart = process.hrtime.bigint();
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    const tEnd = process.hrtime.bigint();
    
    const pStart = process.hrtime.bigint();
    const parser = new Parser(tokens);
    const ast = parser.parseProgram();
    const pEnd = process.hrtime.bigint();
    
    const cStart = process.hrtime.bigint();
    const bytecode = compileProgram(filename);
    const cEnd = process.hrtime.bigint();
    
    const wStart = process.hrtime.bigint();
    const stringData = loader.stringifyLTC(bytecode);
    const wEnd = process.hrtime.bigint();
    
    if (perform) {
      const tDiff = tEnd - tStart;
      const pDiff = pEnd - pStart;
      const cDiff = cEnd - cStart;
      const wDiff = wEnd - wStart;
      
      const totalDiffSum = tDiff + pDiff + cDiff + wDiff;
      
      const toMs = (diff: bigint) => Number(diff) / 1_000_000;
      
      const tTime = formatDuration(toMs(tDiff));
      const pTime = formatDuration(toMs(pDiff));
      const cTime = formatDuration(toMs(cDiff));
      const wTime = formatDuration(toMs(wDiff));
      
      const totalTime = formatDuration(toMs(totalDiffSum));
      
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