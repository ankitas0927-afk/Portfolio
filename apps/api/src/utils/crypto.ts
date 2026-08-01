import { createHash, randomBytes } from "node:crypto";

export function sha256(value: Buffer | string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function createOpaqueToken(): string {
  return randomBytes(48).toString("base64url");
}
