// utils/hash.ts
import crypto from "crypto";

export function hashSource(source: string) {
  return crypto.createHash("sha1").update(source).digest("hex");
}