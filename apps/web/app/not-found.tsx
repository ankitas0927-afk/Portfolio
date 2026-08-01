import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-4 text-center">
      <div>
        <h1 className="text-3xl font-semibold text-ink dark:text-white">Page not found</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">The page is unavailable or has moved.</p>
        <Link className="mt-6 inline-flex rounded bg-aqua px-4 py-2 font-medium text-white" href="/">
          Home
        </Link>
      </div>
    </div>
  );
}
