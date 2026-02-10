/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { Program } from "../ast/index.js";

export const ModuleTable = new Map<
  string,
  {
    ast: Program
    exports: Record<string, any>
    bytecode?: any[]
  }
>();