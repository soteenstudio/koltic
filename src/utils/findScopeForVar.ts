import { Scope } from "../parser/Scope.js";

export function findScopeForVar(currentScope: Scope, name: string): Scope | undefined {
  let scope: Scope | undefined = currentScope;
  
  while (scope) {
    if (Object.prototype.hasOwnProperty.call(scope.kinds, name)) {
      return scope;
    }
    scope = scope.parent;
  }

  return undefined;
}