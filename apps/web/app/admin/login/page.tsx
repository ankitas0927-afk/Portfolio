import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin Login"
};

export default function AdminLoginPage() {
  return (
    <div className="mx-auto grid min-h-[70vh] max-w-6xl place-items-center px-4 py-10">
      <LoginForm />
    </div>
  );
}
