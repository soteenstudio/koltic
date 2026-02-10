export interface Scope {
  kinds: Record<string, 'val' | 'mut'>;
  types: Record<string, string>;
  $loopBreakTargets?: number[];
  $loopContinueTargets?: number[];
  currentFunctionReturnType?: string;
  currentFunctionName?: string;
  vars?: Record<string, any>;
  parent?: Scope;
  exports?: Record<string, string>;
  modules?: Record<string, Scope>;
}