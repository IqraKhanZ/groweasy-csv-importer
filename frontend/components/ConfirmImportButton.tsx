'use client';

interface ConfirmImportButtonProps {
  disabled: boolean;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function ConfirmImportButton({
  disabled,
  onConfirm,
  isLoading,
}: ConfirmImportButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      onClick={onConfirm}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-label={isLoading ? 'Processing import…' : 'Confirm and start import'}
      className={[
        'relative w-full sm:w-auto min-w-[220px] px-8 py-4 rounded-xl',
        'text-white font-semibold text-base',
        'flex items-center justify-center gap-3',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-transparent',
        isDisabled
          ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
          : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(255,59,92,0.4)] active:scale-[0.99] cursor-pointer shadow-[0_4px_20px_rgba(255,59,92,0.2)]',
      ].join(' ')}
    >
      {isLoading ? (
        <>
          {/* Spinner */}
          <span
            aria-hidden="true"
            className="w-5 h-5 rounded-full border-2 border-white/25 border-t-white animate-spin flex-shrink-0"
          />
          <span>Processing…</span>
        </>
      ) : (
        <>
          {/* Rocket icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 flex-shrink-0"
            aria-hidden="true"
          >
            <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.784l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684zM13.949 13.684a1 1 0 00-1.898 0l-.184.551a1 1 0 01-.632.633l-.551.183a1 1 0 000 1.898l.551.183a1 1 0 01.633.633l.183.551a1 1 0 001.898 0l.184-.551a1 1 0 01.632-.633l.551-.183a1 1 0 000-1.898l-.551-.184a1 1 0 01-.633-.632l-.183-.551z" />
          </svg>
          <span>Confirm Import</span>
        </>
      )}
    </button>
  );
}
