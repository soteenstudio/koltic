/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { Literal } from "./Literal.js";
import { Identifier } from "./Identifier.js";
import { BinaryExpression } from "./BinaryExpression.js";
import { CallExpression } from "./CallExpression.js";
import { ObjectLiteral } from "./ObjectLiteral.js";
import { MemberExpression } from "./MemberExpression.js";
import { UpdateExpression } from "./UpdateExpression.js";
import { NoInitExpression } from "./NoInitExpression.js";
import { NoValueExpression } from "./NoValueExpression.js";
import { ArrayLiteral } from "./ArrayLiteral.js";
import { NewExpression } from "./NewExpression.js";
import { ArrowFunction } from "./ArrowFunction.js";

export type Expression =
  | Literal
  | Identifier
  | BinaryExpression
  | CallExpression
  | ObjectLiteral
  | MemberExpression
  | UpdateExpression
  | NoInitExpression
  | NoValueExpression
  | ArrayLiteral
  | NewExpression
  | ArrowFunction;