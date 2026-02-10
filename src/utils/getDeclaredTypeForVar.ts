import { findScopeForVar } from "./findScopeForVar.js";
import { Scope } from "../parser/Scope.js";

export function getDeclaredTypeForVar(
  scope: Scope,
  name: string
): string | null {
  const target = findScopeForVar(scope, name);
  if (!target) return null;
  return target.types[name] ?? null;
}