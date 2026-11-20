import { LuRefreshCw, LuTriangleAlert } from 'react-icons/lu';

/** Placeholder blocks with the same layout as the real content, while data loads. */
export function LoadingView() {
  const block = 'glass animate-pulse';
  return (
    <div role="status" aria-label="Loading weather" className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="space-y-5 lg:col-span-5">
        <div className={`${block} h-72`} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`${block} h-28`} />
          ))}
        </div>
      </div>
      <div className="space-y-5 lg:col-span-7">
        <div className={`${block} h-48`} />
        <div className={`${block} h-80`} />
      </div>
      <span className="sr-only">Loading weather…</span>
    </div>
  );
}

export function ErrorView({ message, onRetry }) {
  return (
    <div role="alert" className="glass mx-auto mt-10 max-w-lg p-8 text-center">
      <LuTriangleAlert className="mx-auto size-10 text-amber-200" aria-hidden="true" />
      <h1 className="mt-4 font-display text-2xl font-semibold">Couldn&apos;t load the weather</h1>
      <p className="mt-2 text-white/80">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-100"
      >
        <LuRefreshCw className="size-4" aria-hidden="true" /> Try again
      </button>
    </div>
  );
}
