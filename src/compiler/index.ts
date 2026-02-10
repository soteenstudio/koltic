/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import fs from "fs";
import path from "path";
import { Parser } from "../parser/index.js";
import { Lexer } from "../lexer.js";
import { run } from "./compiler.js";
import { ModuleTable } from "../module/ModuleTable.js";
import { LightCache } from "../cache/LightCache.js";
import { hashSource, loadConfig } from "../utils/index.js";
import { LightVM } from "lightvm";

const vm = new LightVM();
const optimizeBytecode = vm.tools().optimizeBytecode;

export function compileProgram(entryFile: string) {
  const config = loadConfig();
  
  if (config.compilerOptions.cache) LightCache.init();
  const visited = new Set<string>();

  function loadModule(filePath: string) {
    const abs = path.resolve(filePath);
    if (visited.has(abs)) return;
    visited.add(abs);

    const source = fs.readFileSync(abs, "utf8");
    const hash = hashSource(source);
    
    if (config.compilerOptions.cache) {
      const cachedBytecode = LightCache.get(abs, hash);
      if (cachedBytecode) {
        ModuleTable.set(abs, {
          ast: { type: "Program", body: [] },
          bytecode: cachedBytecode,
          exports: {},
        });
        return;
      }
    }
    
    const tokens = new Lexer(source).tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parseProgram();

    ModuleTable.set(abs, { ast, exports: {} });

    for (const stmt of ast.body) {
      if (stmt.type === "ImportStatement") {
        const dep = resolveImport(abs, stmt.package);
        loadModule(dep);
      }
    }
  }

  loadModule(entryFile);

  for (const [id, meta] of ModuleTable) {
    if (!meta.bytecode) {
      const source = fs.readFileSync(id, "utf8");
      const hash = hashSource(source);

      const raw = run(meta.ast, id);
      const optimized = optimizeBytecode(raw);
      
      meta.bytecode = optimized;
      
      if (config.compilerOptions.cache) LightCache.set(id, hash, optimized);
        meta.ast = { type: "Program", body: [] };
    }
  }

  return optimizeBytecode(ModuleTable.get(path.resolve(entryFile))!.bytecode);
}

export function resolveImport(from: string, pkg: string) {
  const parts = pkg.split(".");
  return path.resolve(
    path.dirname(from),
    ...parts
  ) + ".lt";
}