import { findScopeForVar } from "./findScopeForVar.js";
import { Scope } from "../parser/Scope.js";

export function getDeclaredValue(
  scope: Scope,
  name: string
): string | null {
  const target = findScopeForVar(scope, name);
  if (!target) return null;
  if (target?.vars) return target.vars[name] ?? null;
  return null;
}