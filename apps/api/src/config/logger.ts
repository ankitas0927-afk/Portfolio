import pino from "pino";
import { getEnv } from "./env";

const redact = [
  "req.headers.authorization",
  "req.headers.cookie",
  "res.headers.set-cookie",
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "privateTelephoneNumber",
  "fullPrivateAddress",
  "dateOfBirth",
  "parentOrGuardian"
];

export const logger = pino({
  level: getEnv().NODE_ENV === "test" ? "silent" : "info",
  redact
});
