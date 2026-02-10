/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { BaseNode } from "../BaseNode.js";
import { FunctionDeclaration } from "./FunctionDeclaration.js";

export interface ClassDeclaration extends BaseNode {
  type: "ClassDeclaration";
  name: string;
  constructor?: FunctionDeclaration;
  properties: VariableDeclaration[];
  methods: FunctionDeclaration[];
}