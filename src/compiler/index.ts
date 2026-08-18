/* * Copyright 2026 SoTeen Studio  
 * * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 * * http://www.apache.org/licenses/LICENSE-2.0  
 */

import fs from "fs";
import path from "path";
import { Parser } from "../parser/index.js";
import { Lexer } from "../lexer.js";
import { run } from "./compiler.js";
import { ModuleTable } from "../module/ModuleTable.js";
import { setProcessTimes } from "../utils/index.js";
import { LightVM, Capability } from "lightvm";

const vm = new LightVM();

export function compileProgram(entryFile: string) {
  const tools = vm.tools();
  
  let cEnd = 0n;
  let cStart = 0n;
  
  cStart = process.hrtime.bigint();
  const visited = new Set<string>();

  function loadModule(filePath: string) {
    const abs = path.resolve(filePath);
    if (visited.has(abs)) return;
    visited.add(abs);

    const source = fs.readFileSync(abs, "utf8");
    
    const tokens = new Lexer(source).tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parseProgram();

    // Langsung set tanpa mikirin hash atau cache
    ModuleTable.set(abs, { ast, exports: {} });

    for (const stmt of ast.body) {
      if (stmt.type === "ImportStatement") {
        const dep = resolveImport(abs, stmt.package);
        loadModule(dep);
      }
    }
  }

  // Phase 1: Parsing & Dependency Discovery
  loadModule(entryFile);

  // Phase 2: Bytecode Generation & Optimization
  for (const [id, meta] of ModuleTable) {
    // Generate bytecode dari AST
    const raw = run(meta.ast, id);
    
    // Optimasi lewat Rust bridge
    const optimizedStr = tools.optimizeBytecode(raw);
    
    meta.bytecode = optimizedStr;
    
    // Clear AST buat hemat memori setelah jadi bytecode
    meta.ast = { type: "Program", body: [] };
  }
  
  cEnd = process.hrtime.bigint();
  setProcessTimes({
    cTime: Number(cEnd - cStart)
  });

  return ModuleTable.get(path.resolve(entryFile))!.bytecode;
}

export function resolveImport(from: string, pkg: string) {
  const parts = pkg.split(".");
  return path.resolve(
    path.dirname(from),
    ...parts
  ) + ".lt";
}
