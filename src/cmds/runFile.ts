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
import { LightVM } from "lightvm";
import { setName } from "../error.js";
import { formatDuration, warning, loadConfig } from "../utils/index.js";
import { figures } from "../utils/figures.js";
import { Instruction } from '../vm/Instruction.js';
import fs from "node:fs";
import path from "node:path";

const vm = new LightVM(["observe", "control", "debug"]);
export function runFile(filename: string, perform: boolean): void {
  if (filename.endsWith(".lt")) {
    setName(path.basename(filename));
    const config = loadConfig("lightconfig.json");
    
    const code = fs.readFileSync(filename, 'utf8');
  
    const totalStart = process.hrtime.bigint();
    const tStart = process.hrtime.bigint();
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    const tEnd = process.hrtime.bigint();
    
    const cStart = process.hrtime.bigint();
    const bytecode = compileProgram(filename);
    const cEnd = process.hrtime.bigint();
    
    const bStart = process.hrtime.bigint();
    vm.load(bytecode);
    vm.run();
    const bEnd = process.hrtime.bigint();
    const totalEnd = process.hrtime.bigint();
    
    if (perform) {
      const tTime = formatDuration(Number(tEnd - tStart) / 1_000_000);
      const cTime = formatDuration(Number(cEnd - cStart) / 1_000_000);
      const rTime = formatDuration(Number(bEnd - bStart) / 1_000_000);
      const totalTime = formatDuration(Number(totalEnd - totalStart) / 1_000_000);
      
      const lines = [
        `${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "} Tokenizing Time : ${tTime} ${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "}`,
        `${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "} Compile Time   : ${cTime} ${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "}`,
        `${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "} Running Time   : ${rTime} ${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "}`,
        `${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "} Total Time     : ${totalTime} ${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "}`
      ];
      
      warning(lines, config);
    }
  } else if (filename.endsWith(".ltc")) {
    setName(path.basename(filename));
    const config = loadConfig(filename);
    
    const totalStart = process.hrtime.bigint();
    const rStart= process.hrtime.bigint();
    const code = fs.readFileSync(filename, 'utf8').replace(/\s\;\;\sIP\=(\d+)/g, "");
    const rEnd = process.hrtime.bigint();
    
    const tStart = process.hrtime.bigint();
    const data: Instruction[] = code
      .split(';')
      .map((item: string) => item.trim())
      .filter(Boolean)
      .map((item: string) => {
        const parts: string[] = item.split(/\s+/); // split by whitespace
        const op: Instruction[0] = parts[0] as Instruction[0];
        const args: (number | string | undefined)[]  = parts.slice(1).map((arg: string) => {
          const num: number = Number(arg);
          return isNaN(num) ? arg : num;
        });
    
        // pad supaya panjangnya selalu 5 (op + 4 arg)
        while (args.length < 4) args.push(undefined);
    
        return [op, ...args] as Instruction;
      });
    const tEnd = process.hrtime.bigint();
    
    const rbStart = process.hrtime.bigint();
    vm.load(data);
    vm.run();
    const rbEnd = process.hrtime.bigint();
    const totalEnd = process.hrtime.bigint();
    
    if (perform) {
      const rTime = formatDuration(Number(rEnd - rStart) / 1_000_000);
      const tTime = formatDuration(Number(tEnd - tStart) / 1_000_000);
      const rbTime = formatDuration(Number(rbEnd - rbStart) / 1_000_000);
      const totalTime = formatDuration(Number(totalEnd - totalStart) / 1_000_000);
      
      const lines = [
        `${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "} Reading Time     : ${rTime} ${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "}`,
        `${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "} Transpiling Time : ${tTime} ${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "}`,
        `${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "} Running Time     : ${rbTime} ${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "}`,
        `${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "} Total Time       : ${totalTime} ${config.design === "legacy" || config.design === "modern" ? figures.pipe : " "}`
      ];
      
      warning(lines, config);
    }
  } else {
    throw new Error(`Invalid extension .${path.basename(filename).split(".")[1]}`)
  }
}