import { normalizeType } from "./normalizeType.js";

export function isAnyType(type: string): boolean {
  return normalizeType(type) === "$Type.Anything";
}