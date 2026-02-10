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
import { Expression } from "../expression/Expression.js";
import { BlockStatement } from "./BlockStatement.js";

export interface IfStatement extends BaseNode {
  type: 'IfStatement';
  test: Expression;
  consequent: BlockStatement;
  alternate: BlockStatement | IfStatement | null;
}