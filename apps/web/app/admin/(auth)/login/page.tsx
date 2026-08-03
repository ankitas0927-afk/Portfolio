import { LoginForm } from '@/components/admin/login-form';

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center px-4 py-16">
      <div className="w-full rounded-[2rem] border border-border/60 bg-card/80 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.28em] text-accent/70">Administrator</p>
        <h1 className="mt-4 font-display text-3xl font-semibold">Sign in to the dashboard</h1>
        <p className="mt-3 text-sm leading-7 text-foreground/68">
          The dashboard uses short-lived access tokens, refresh rotation, and cookie-based session handling.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
