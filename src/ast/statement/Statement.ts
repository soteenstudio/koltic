/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { VarDeclaration } from "./VarDeclaration.js";
import { PrintLnStatement } from "./PrintLnStatement.js";
import { ErrorLnStatement } from "./ErrorLnStatement.js";
import { IfStatement } from "./IfStatement.js";
import { ForStatement } from "./ForStatement.js";
import { BlockStatement } from "./BlockStatement.js";
import { FunctionDeclaration } from "./FunctionDeclaration.js";
import { AssignmentStatement } from "./AssignmentStatement.js";
import { ReturnStatement } from "./ReturnStatement.js";
import { NoInitStatement } from "./NoInitStatement.js";
import { WhileStatement } from "./WhileStatement.js";
import { SwitchStatement } from "./SwitchStatement.js";
import { SwitchCase } from "./CaseBlock.js";
import { ContinueStatement } from "./ContinueStatement.js";
import { BreakStatement } from "./BreakStatement.js";
import { ClassDeclaration } from "./ClassDeclaration.js";
import { ImportStatement } from "./ImportStatement.js";
import { ExportStatement } from "./ExportStatement.js";

export type Statement =
  | VarDeclaration
  | PrintLnStatement
  | ErrorLnStatement
  | IfStatement
  | ForStatement
  | BlockStatement
  | FunctionDeclaration
  | AssignmentStatement
  | ReturnStatement
  | NoInitStatement
  | WhileStatement
  | SwitchStatement
  | SwitchCase
  | ContinueStatement
  | BreakStatement
  | ClassDeclaration
  | ImportStatement
  | ExportStatement;