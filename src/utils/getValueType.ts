import { isInt32 } from "./isInt32.js";
import { isFloat32 } from "./isFloat32.js";

export const types = [
  "$Type.Anything",
  "$Type.Unit",
  "$Type.Number",
  "$Type.Integer",
  "$Type.Float",
  "$Type.Double",
  "$Type.Long",
  "$Type.String",
  "$Type.Character",
  "$Type.Boolean",
  "$Type.Object",
  "$Type.Array",
  "$Type.Function",
];

export function getValueType(value: any): string {
  if (types.includes(value)) return value.replace("$Type.", "");
  
  if (value === undefined) return "$Type.Undefined";
  if (value === null) return "$Type.Null";
  if (typeof value === "function") return "$Type.Function";
  if (value === "Function") return "$Type.Function";
  if (typeof value === "number" && Number.isInteger(value)) {
    return isInt32(value) ? "$Type.Integer" : "$Type.Long";
  }
  if (typeof value === "number" && !Number.isInteger(value)) {
    return isFloat32(value) ? "$Type.Float" : "$Type.Double";
  }
  const first = value[0];
  const last = value[value.length - 1];
  if (
    typeof value === "string" &&
    value.length === 3 &&
    value.startsWith("'") &&
    value.endsWith("'")
  ) return "$Type.Character";
  if (typeof value === "string") return "$Type.String";
  if (typeof value === "boolean") return "$Type.Boolean";
  if (typeof value === "object" && value !== null) return "$Type.Object";
  if(Array.isArray(value)) return "$Type.Array"
  return typeof value;
}