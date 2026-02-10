import { findScopeForVar } from "./findScopeForVar.js";
import { CustomError } from "../error.js";
import { Scope } from "../parser/Scope.js";

export function getFromScope(
  scope: Scope,
  name: string,
  line: number,
  column: number
): any {
  const target = findScopeForVar(scope, name);
  if (target?.vars) return target.vars[name];
  throw new CustomError("ReferenceError", `${name} is not defined`, line, column);
}