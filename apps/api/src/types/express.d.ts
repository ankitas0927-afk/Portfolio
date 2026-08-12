import type { JwtPayload } from '../utils/auth';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      auth?: JwtPayload;
    }
  }
}

export {};
