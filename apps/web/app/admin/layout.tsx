import type { ReactNode } from "react";
import { AuthProvider } from "@/providers/auth-provider";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
