import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { apiEnvSchema, type ApiEnv } from "@ankita-portfolio/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(dirname, "../../../../.env") });
dotenv.config();

let cachedEnv: ApiEnv | null = null;

export function getEnv(): ApiEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = apiEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid API environment configuration: ${details}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export function resetEnvForTests(): void {
  cachedEnv = null;
}
