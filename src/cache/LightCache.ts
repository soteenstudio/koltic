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
import { LightVM, Instruction } from "lightvm";

const vm = new LightVM();
const loader = vm.tools().loader;

const CACHE_VERSION = 1;
const CACHE_DIR = ".lightcache";
const MODULE_DIR = path.join(CACHE_DIR, "modules");
const INDEX_FILE = path.join(CACHE_DIR, "index.json");

type CacheMeta = {
  hash: string;
  bytecodeFile: string;
};

type CacheIndex = {
  version: number;
  modules: Record<string, CacheMeta>;
};

export class LightCache {
  private static mem = new Map<string, Instruction[]>();

  private static index: Record<string, CacheMeta> = {};

  static init() {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);
    if (!fs.existsSync(MODULE_DIR)) fs.mkdirSync(MODULE_DIR);

    if (!fs.existsSync(INDEX_FILE)) return;

    const data: CacheIndex = JSON.parse(
      fs.readFileSync(INDEX_FILE, "utf8")
    );

    if (data.version !== CACHE_VERSION) return;

    this.index = data.modules;
  }

  static get(moduleId: string, hash: string): Instruction[] | null {
    const memHit = this.mem.get(moduleId);
    if (memHit) {
      const meta = this.index[moduleId];
      if (meta && meta.hash === hash) {
        return memHit;
      } else {
        this.mem.delete(moduleId);
      }
    }
  
    const meta = this.index[moduleId];
    if (!meta || meta.hash !== hash) return null;
  
    const bytecode: Instruction[] = loader.parseLTC(
      fs.readFileSync(meta.bytecodeFile, "utf8")
    );
  
    this.mem.set(moduleId, bytecode);
    return bytecode;
  }

  /**
   * 🔥 Cache MISS path
   */
  static set(moduleId: string, hash: string, bytecode: Instruction[]) {
    const id = hash.slice(0, 8);
    const ltcFile = path.join(MODULE_DIR, id + ".ltc");

    fs.writeFileSync(ltcFile, loader.stringifyLTC(bytecode));

    this.index[moduleId] = {
      hash,
      bytecodeFile: ltcFile,
    };

    this.mem.set(moduleId, bytecode);

    fs.writeFileSync(
      INDEX_FILE,
      JSON.stringify(
        {
          version: CACHE_VERSION,
          modules: this.index,
        },
        null,
        2
      )
    );
  }

  /**
   * Optional: clear memory cache (debug / dev)
   */
  static clearMemory() {
    this.mem.clear();
  }
}