'use client';

import { useEffect, useCallback, useState } from 'react';
import { useCsvUpload } from '@/hooks/useCsvUpload';
import { useImportProcess } from '@/hooks/useImportProcess';
import UploadDropzone from '@/components/UploadDropzone';
import CsvPreviewTable from '@/components/CsvPreviewTable';
import ConfirmImportButton from '@/components/ConfirmImportButton';
import LoadingState from '@/components/LoadingState';
import SummaryCards from '@/components/SummaryCards';
import ResultTable from '@/components/ResultTable';
import ErrorBanner from '@/components/ErrorBanner';

// ─── Stepper Config ────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Upload', description: 'Select CSV file' },
  { id: 2, label: 'Preview', description: 'Review your data' },
  { id: 3, label: 'Processing', description: 'AI mapping' },
  { id: 4, label: 'Results', description: 'Import complete' },
] as const;

// ─── Stepper Component ─────────────────────────────────────
function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full mb-10">
      <div className="flex items-center justify-center gap-0 relative">
        {STEPS.map((step, index) => {
          const isComplete = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isInactive = currentStep < step.id;

          return (
            <div key={step.id} className="flex items-center">
              {/* Step bubble + label */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={[
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 relative z-10',
                    isComplete ? 'step-complete' : isActive ? 'step-active' : 'step-inactive',
                  ].join(' ')}
                  aria-label={`Step ${step.id}: ${step.label} — ${isComplete ? 'completed' : isActive ? 'current' : 'upcoming'}`}
                >
                  {isComplete ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <div className="text-center hidden sm:block">
                  <p
                    className={[
                      'text-xs font-semibold transition-colors duration-200',
                      isActive ? 'text-primary-500' : isComplete ? 'text-emerald-400' : 'text-slate-600',
                    ].join(' ')}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5 whitespace-nowrap hidden md:block">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="relative mx-2 sm:mx-4 flex-1 w-16 sm:w-24 md:w-32 h-0.5 -mt-5 sm:-mt-7">
                  <div className="absolute inset-0 bg-white/10 rounded-full" />
                  <div
                    className={[
                      'absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out',
                      currentStep > step.id
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 w-full'
                        : 'w-0',
                    ].join(' ')}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Back Button ───────────────────────────────────────────
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-4 h-4"
      >
        <path
          fillRule="evenodd"
          d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
          clipRule="evenodd"
        />
      </svg>
      Back
    </button>
  );
}

// ─── Start Over Button ─────────────────────────────────────
function StartOverButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-primary-400 hover:text-primary-300 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/30 hover:border-primary-500/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-transparent"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-4 h-4"
      >
        <path
          fillRule="evenodd"
          d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0V5.36l.31.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
          clipRule="evenodd"
        />
      </svg>
      Import Another File
    </button>
  );
}

// ─── Page Header ───────────────────────────────────────────
function PageHeader() {
  return (
    <div className="text-center mb-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
        GrowEasy{' '}
        <span className="gradient-text">CSV Importer</span>
      </h1>
      <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
        Upload your CSV file and let AI intelligently map your data to CRM fields — automatically.
      </p>
    </div>
  );
}

// ─── Step Content Wrappers ─────────────────────────────────
function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-6 sm:p-8 animate-fade-in">
      {children}
    </div>
  );
}

function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────
export default function Home() {
  const [step, setStep] = useState<number>(1);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    file,
    headers,
    rows,
    error: csvError,
    handleFileSelected,
    reset: resetCsv,
  } = useCsvUpload();

  const {
    result,
    isLoading,
    error: importError,
    runImport,
    reset: resetImport,
  } = useImportProcess();

  // Combined error (prefer import error on later steps)
  const activeError = step >= 3 ? (importError ?? uploadError) : (csvError ?? uploadError);

  // Advance from step 3 → 4 when result arrives
  useEffect(() => {
    if (result && step === 3 && !isLoading) {
      setStep(4);
    }
  }, [result, isLoading, step]);

  // ── Handlers ──
  const handleFileDropped = useCallback(
    async (selectedFile: File) => {
      setUploadError(null);
      await handleFileSelected(selectedFile);
    },
    [handleFileSelected]
  );

  const handleFileValid = useCallback(
    async (selectedFile: File) => {
      setUploadError(null);
      await handleFileSelected(selectedFile);
      // Advance to preview after a tiny tick (state settle)
      setTimeout(() => setStep(2), 0);
    },
    [handleFileSelected]
  );

  const handleUploadError = useCallback((msg: string) => {
    setUploadError(msg);
  }, []);

  const handleConfirmImport = useCallback(async () => {
    if (!file) return;
    setStep(3);
    await runImport(file);
  }, [file, runImport]);

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(1, s - 1));
  }, []);

  const handleStartOver = useCallback(() => {
    resetCsv();
    resetImport();
    setStep(1);
    setUploadError(null);
  }, [resetCsv, resetImport]);

  const handleDismissError = useCallback(() => {
    setUploadError(null);
  }, []);

  const handleRetryImport = useCallback(async () => {
    if (!file) return;
    resetImport();
    setStep(3);
    await runImport(file);
  }, [file, runImport, resetImport]);

  // ── Render ──
  return (
    <main className="min-h-screen bg-animated-gradient relative overflow-x-hidden">
      {/* Ambient glow blobs */}
      <div
        aria-hidden="true"
        className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-white/[0.03] blur-[120px] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-[120px] pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Page header */}
        <PageHeader />

        {/* Stepper */}
        <Stepper currentStep={step} />

        {/* Error banner — shown above step content */}
        {activeError && step !== 3 && (
          <div className="mb-6">
            <ErrorBanner
              message={activeError}
              onDismiss={step === 1 || step === 2 ? handleDismissError : undefined}
              onRetry={step === 4 && importError ? handleRetryImport : undefined}
            />
          </div>
        )}

        {/* ── Step 1: Upload ── */}
        {step === 1 && (
          <StepCard>
            <StepHeading
              title="Upload Your CSV File"
              subtitle="Drag and drop or click to select a CSV file to import into your CRM."
            />
            <UploadDropzone
              onFileSelected={handleFileValid}
              onError={handleUploadError}
            />
            {/* Instructions */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                  ),
                  title: 'Any CSV Format',
                  body: 'Our AI automatically maps your column names to CRM fields.',
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                    </svg>
                  ),
                  title: 'Secure Processing',
                  body: 'Files are processed server-side and never stored permanently.',
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.784-.784l-.238-1.192z" />
                    </svg>
                  ),
                  title: 'AI-Powered Mapping',
                  body: 'Intelligent field recognition processes records in batches of 25.',
                },
              ].map(({ icon, title, body }) => (
                <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/8">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/15 flex items-center justify-center text-primary-400 flex-shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-300">{title}</p>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </StepCard>
        )}

        {/* ── Step 2: Preview ── */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            {/* Actions row */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <BackButton onClick={handleBack} />
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="hidden sm:inline">
                  {file?.name && (
                    <span className="text-slate-400 font-medium">{file.name}</span>
                  )}
                </span>
                <ConfirmImportButton
                  disabled={!file || rows.length === 0}
                  onConfirm={handleConfirmImport}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Preview heading */}
            <div className="glass rounded-2xl px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-bold text-white">Data Preview</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Review your CSV data before sending it to the AI for CRM mapping.
                </p>
              </div>
              <div className="flex gap-2 text-xs text-slate-500">
                <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-medium">
                  {rows.length} rows
                </span>
                <span className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-medium">
                  {headers.length} cols
                </span>
              </div>
            </div>
            {/* Table */}
            <CsvPreviewTable headers={headers} rows={rows} />
          </div>
        )}

        {/* ── Step 3: Processing ── */}
        {step === 3 && (
          <StepCard>
            {importError ? (
              <>
                <ErrorBanner
                  message={importError}
                  onRetry={handleRetryImport}
                  onDismiss={handleStartOver}
                />
                <div className="mt-6 flex justify-center">
                  <StartOverButton onClick={handleStartOver} />
                </div>
              </>
            ) : (
              <LoadingState />
            )}
          </StepCard>
        )}

        {/* ── Step 4: Results ── */}
        {step === 4 && result && (
          <div className="space-y-6 animate-fade-in">
            {/* Results header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl font-bold text-white">Import Complete</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Your CSV has been processed and mapped to CRM fields.
                </p>
              </div>
              <StartOverButton onClick={handleStartOver} />
            </div>

            {/* Summary cards */}
            <SummaryCards
              totalImported={result.totalImported}
              totalSkipped={result.totalSkipped}
            />

            {/* Result table */}
            <ResultTable imported={result.imported} skipped={result.skipped} />

            {/* Footer note */}
            <div className="glass rounded-xl px-5 py-4 flex items-start gap-3">
              <div className="text-indigo-400 mt-0.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Export Note</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  The data shown above has been processed and is ready to be used in your CRM. Contact your administrator to configure automated CRM sync.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
