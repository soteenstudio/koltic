/*  
 * Copyright 2026 SoTeen Studio  
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");  
 * you may not use this file except in compliance with the License.  
 * You may obtain a copy of the License at  
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0  
 */

import { Instruction } from "lightvm";
import { Scope } from "../../parser/Scope.js";
import { ClassDeclaration, VarDeclaration, FunctionDeclaration } from "../../ast/index.js";
import { compileExpr } from "../expression/compileExpr.js";
import { compileStatement } from "./compileStmt.js";

export function compileClassDecl(stmt: ClassDeclaration, code: Instruction[], scope: Scope, moduleId: string) {
  const s = stmt;
  const className = s.name;

  code.push(["push", {}]);
  code.push(["set", className]);

  const classScope: Scope = {
    ...scope,
    kinds: { ...scope.kinds },
    types: { ...scope.types },
    vars: { ...scope.vars },
    currentFunctionName: undefined,
  };

  for (const prop of s.properties) {
    const name = prop.name;
    const access = (prop as any).access ?? "public";
    const mutable = prop.mutable ?? false;

    if (prop.initializer) {
      code.push(...compileExpr(prop.initializer, classScope));
      code.push(["get", className]);
      code.push(["set_prop", name]);
    } else {
      code.push(["push", undefined]);
      code.push(["get", className]);
      code.push(["set_prop", name]);
    }

    classScope.kinds[name] = mutable ? "mut" : "val";
    classScope.types[name] = prop.varType ?? "any";
    if (!classScope.vars) classScope.vars = {};
    classScope.vars[name] = access === "private" ? undefined : null;
  }

  if (s.constructor) {
    const c = s.constructor;
    const params = c.params.map(p => p.name);
    const fnStart = code.length + 1;

    code.push(["func", `${className}_constructor`, params.length, fnStart, -1, ...params]);

    const constructorScope: Scope = {
      ...classScope,
      vars: { ...classScope.vars },
      kinds: { ...classScope.kinds },
      types: { ...classScope.types },
      currentFunctionName: `${className}_constructor`,
      currentFunctionReturnType: "void",
    };
    
    for (const param of c.params) {
      constructorScope.vars![param.name] = null;
      constructorScope.kinds[param.name] = "mut";
      constructorScope.types[param.name] = param.paramType ?? "any";
    }
    
    compileStatement(c.body, constructorScope, code, moduleId);

    code.push(["return"]);
    const fnEnd = code.length;
    (code.find(i => i[0] === "func" && i[1] === `${className}_constructor`) as any)[4] = fnEnd;
  }

  for (const method of s.methods) {
    const m = method;
    const access = (m as any).access ?? "public";
    const params = ["this", ...m.params.map(p => p.name)];
    const fnStart = code.length + 1;

    code.push(["func", `${className}_${m.name}`, params.length, fnStart, -1, ...params]);

    const methodScope: Scope = {
      ...classScope,
      vars: { ...classScope.vars },
      kinds: { ...classScope.kinds },
      types: { ...classScope.types },
      currentFunctionName: `${className}_${m.name}`,
      currentFunctionReturnType: m.returnType ?? "void",
    };
    
    for (const param of m.params) {
      methodScope.vars![param.name] = null;
      methodScope.kinds[param.name] = "mut";
      methodScope.types[param.name] = param.paramType ?? "any";
    }
    
    compileStatement(m.body, methodScope, code, moduleId);

    code.push(["return"]);

    const fnEnd = code.length;
    (code.find(i => i[0] === "func" && i[1] === `${className}_${m.name}`) as any)[4] = fnEnd;
  }

  scope.vars ??= {};
  scope.vars[className] = `class<${className}>`;
  scope.types[className] = "class";

  return [];
}