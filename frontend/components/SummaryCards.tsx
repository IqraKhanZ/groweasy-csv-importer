'use client';

import { useEffect, useRef, useState } from 'react';

interface SummaryCardsProps {
  totalImported: number;
  totalSkipped: number;
}

function useCountUp(target: number, duration = 1200): number {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      startTimeRef.current = null;
    };
  }, [target, duration]);

  return count;
}

export default function SummaryCards({ totalImported, totalSkipped }: SummaryCardsProps) {
  const importedCount = useCountUp(totalImported);
  const skippedCount = useCountUp(totalSkipped);

  const total = totalImported + totalSkipped;
  const importedPct = total > 0 ? Math.round((totalImported / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
      {/* Imported card */}
      <div className="glass rounded-2xl p-6 border border-emerald-500/20 glow-success transition-all duration-300 hover:border-emerald-500/40">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-emerald-400"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            {importedPct}% success
          </span>
        </div>

        <div className="animate-count-up">
          <p className="text-5xl font-bold text-emerald-400 tabular-nums leading-none mb-2">
            {importedCount.toLocaleString()}
          </p>
        </div>

        <p className="text-base font-semibold text-slate-200 mt-1">Imported</p>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          Records successfully mapped and imported into your CRM
        </p>

        {/* Mini progress bar */}
        <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${importedPct}%` }}
          />
        </div>
      </div>

      {/* Skipped card */}
      <div className="glass rounded-2xl p-6 border border-amber-500/20 glow-warning transition-all duration-300 hover:border-amber-500/40">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-amber-400"
            >
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <span className="text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            {100 - importedPct}% skipped
          </span>
        </div>

        <div className="animate-count-up" style={{ animationDelay: '100ms' }}>
          <p className="text-5xl font-bold text-amber-400 tabular-nums leading-none mb-2">
            {skippedCount.toLocaleString()}
          </p>
        </div>

        <p className="text-base font-semibold text-slate-200 mt-1">Skipped</p>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          Records that could not be processed — review below for reasons
        </p>

        {/* Mini progress bar */}
        <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${100 - importedPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
