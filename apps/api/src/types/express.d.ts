import type { JwtPayload } from '../utils/auth.js';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      auth?: JwtPayload;
    }
  }
}

export {};
