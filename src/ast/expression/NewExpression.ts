/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { Expression } from "./Expression.js";
import { BaseNode } from "../BaseNode.js";

export interface NewExpression extends BaseNode {
  type: "NewExpression";
  className: string;
  args: Expression[];
}