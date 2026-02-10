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
import { BlockStatement } from "./BlockStatement.js";

export interface FunctionDeclaration extends BaseNode {
  type: 'FunctionDeclaration';
  name: string;
  params: {
    name: string;
    paramType?: string
  }[];
  returnType: string;
  body: BlockStatement;
  access?: 'public' | 'private' | 'protected';
}