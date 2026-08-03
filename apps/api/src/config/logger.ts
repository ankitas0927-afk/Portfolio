import pino from "pino";

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
  level: process.env.NODE_ENV === "test" ? "silent" : "info",
  redact
});
