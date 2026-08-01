"use client";

import { RotateCcw } from "lucide-react";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-4 text-center">
      <div>
        <h1 className="text-3xl font-semibold text-ink dark:text-white">Something went wrong</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">The portfolio could not be loaded safely.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded bg-aqua px-4 py-2 font-medium text-white"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Retry
        </button>
      </div>
    </div>
  );
}
