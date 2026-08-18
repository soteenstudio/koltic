/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { ObjectLiteral, FunctionExpression } from "../../ast/index.js";
import { Instructions } from "lightvm";
import { Scope } from "../../parser/Scope.js";
import { compileExpr } from "./compileExpr.js";

export function compileObjectLit(
  node: ObjectLiteral,
  code: Instructions[],
  scope: Scope,
  moduleId: string
): Instructions[] {
  const propCount = node.properties.length;

  for (const prop of node.properties) {
    // 1. Key
    const keyName = typeof prop.key === 'string' ? prop.key : (prop.key as any).name;
    code.push(["push", String(keyName)]);

    // 2. Value
    const valueInstructions = prop.value.type === "FunctionExpression" 
      ? compileExpr({ ...prop.value, params: [{ name: "this" }, ...(prop.value as any).params] }, { ...scope, vars: { ...scope.vars }, kinds: { ...scope.kinds }, types: { ...scope.types } }, false, moduleId)
      : compileExpr(prop.value, scope, false, moduleId);

    if (Array.isArray(valueInstructions)) {
      code.push(...valueInstructions);
    }
  }

  // TRIK: Paksa propCount jadi angka murni pake bitwise OR 0
  // Ini buat mastiin JS nggak ngirim object aneh-aneh ke Loader
  const finalCount = propCount | 0; 
  
  code.push(["make_obj", finalCount]);

  return code;
}
