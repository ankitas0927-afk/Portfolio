import type { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      admin?: {
        id: Types.ObjectId;
        email: string;
        role: "owner" | "editor";
      };
    }
  }
}

export {};
