'use client';

interface LoadingStateProps {
  message?: string;
}

const DEFAULT_MESSAGE = 'Extracting CRM fields with AI… this may take a moment for large files';

export default function LoadingState({ message = DEFAULT_MESSAGE }: LoadingStateProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-20 px-6 animate-fade-in">
      {/* Glow ring + spinner */}
      <div className="relative mb-10">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-xl animate-pulse scale-150" />
        {/* Middle ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary-500/30 animate-ping" />
        {/* Spinner */}
        <div className="relative w-20 h-20 rounded-full border-[3px] border-primary-500/20 border-t-primary-400 animate-spin" />
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-primary-500 animate-pulse" />
        </div>
      </div>

      {/* Main message */}
      <div className="text-center max-w-md space-y-4">
        <h3 className="text-xl font-semibold text-slate-200 animate-pulse-glow">
          {message}
        </h3>

        {/* Animated dots */}
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce [animation-delay:300ms]" />
        </div>

        {/* Secondary note */}
        <div className="glass rounded-xl px-5 py-3.5 mt-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-amber-400 flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-slate-400">
                Processing in batches of 25 records
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                AI is mapping your CSV columns to CRM fields intelligently.
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 rounded-full animate-[progressBar_2s_ease-in-out_infinite]" />
        </div>
      </div>

      <style jsx>{`
        @keyframes progressBar {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 70%; margin-left: 15%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
