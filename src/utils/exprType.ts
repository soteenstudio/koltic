import { normalizeType } from "./normalizeType.js";
import { getDeclaredTypeForVar } from "./getDeclaredTypeForVar.js";
import { getValueType } from "./getValueType.js";
import { CustomError } from "../error.js";
import {
  CallExpression,
  BinaryExpression,
  ReturnStatement,
  UpdateExpression,
  Identifier,
  Literal,
  Expression,
  Statement
} from "../ast/index.js";
import { Scope } from "../parser/Scope.js";
import { functions } from "../compiler/compiler.js";

export function exprType(node: Expression | Statement, scope: Scope): string {
  switch (node.type) {
    case "Literal":
      return getValueType((node as Literal).value);
    case "Identifier":
      return getDeclaredTypeForVar(scope, (node as Identifier).name) || "Any1";
    case "BinaryExpression": {
      const bin = node as BinaryExpression;
      const left = exprType(bin.left, scope);
      const right = exprType(bin.right, scope);
      if (left === right) {
        return left;
      }
      return "Any2";
    }
    case "CallExpression": {
      const call = node as CallExpression;
      if (call.callee.name === "print" || call.callee.name === "println") return "Unit";
      if (call.callee.name === "typeof") return "Object";
      if (call.callee.name === "length") return "Integer";
      if (call.callee.name === "string") return "String";
      if (call.callee.name === "number") return "Number";
      const func = functions[call.callee.name];
      if (!func) return "Anything";
      return normalizeType(func.returnType || "Anything");
    }
    case "ReturnStatement": {
      const ret = node as ReturnStatement;
      return normalizeType(getValueType(ret.expression)).replace("$Type.", "");
    }
    case "UpdateExpression": {
      const upd = node as UpdateExpression;
      return exprType(upd.argument, scope);
    }
    default:
      if (node.type === "NoValueExpression") {
        return "Unit";
      }
      return "Any4";
  }
}