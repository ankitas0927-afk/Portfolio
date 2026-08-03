'use client';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center gap-6 px-4 py-20 text-center">
      <div className="rounded-[2rem] border border-border/60 bg-card/80 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-accent/70">Something went wrong</p>
        <h1 className="mt-4 font-display text-3xl font-semibold">The page could not be loaded.</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-foreground/70">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] px-5 py-3 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
