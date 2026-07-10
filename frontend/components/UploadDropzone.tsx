'use client';

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  onError: (msg: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function CloudUploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-16 h-16"
      aria-hidden="true"
    >
      <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6"
      aria-hidden="true"
    >
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

export default function UploadDropzone({ onFileSelected, onError }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = useCallback(
    (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'csv') {
        onError('Invalid file type. Please upload a .csv file.');
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        onError(`File is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }
      setSelectedFile(file);
      onFileSelected(file);
    },
    [onFileSelected, onError]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        validateAndSelect(files[0]);
      }
    },
    [validateAndSelect]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        validateAndSelect(files[0]);
      }
    },
    [validateAndSelect]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    []
  );

  return (
    <div className="w-full space-y-4">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload CSV file — click or drag and drop"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        className={[
          'relative w-full min-h-[300px] rounded-2xl cursor-pointer',
          'flex flex-col items-center justify-center gap-6',
          'transition-all duration-300 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-transparent',
          isDragging
            ? 'drag-active border-2 border-indigo-500'
            : 'glass border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/60 hover:bg-white/[0.03]',
        ].join(' ')}
      >
        {/* Animated gradient overlay when dragging */}
        {isDragging && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-transparent animate-pulse pointer-events-none" />
        )}

        {/* Icon */}
        <div
          className={[
            'transition-all duration-300',
            isDragging ? 'text-primary-400 scale-110' : 'text-slate-500',
          ].join(' ')}
        >
          <CloudUploadIcon />
        </div>

        {/* Text */}
        <div className="text-center px-6">
          <p className="text-lg font-semibold text-slate-200 mb-1">
            {isDragging ? 'Drop your CSV file here' : 'Drag & drop your CSV file'}
          </p>
          <p className="text-sm text-slate-500 mb-4">
            or{' '}
            <span className="text-primary-400 hover:text-primary-300 underline underline-offset-2 transition-colors">
              click to browse
            </span>
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-slate-600">
            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
              .csv only
            </span>
            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
              max {MAX_FILE_SIZE_MB}MB
            </span>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          id="csv-file-input"
          accept=".csv"
          className="hidden"
          onChange={handleInputChange}
          aria-hidden="true"
        />
      </div>

      <div className="text-center px-4">
        <p className="text-xs text-slate-500 leading-relaxed max-w-xl mx-auto">
          Required / mapped fields: <code className="text-primary-400">created_at</code>, <code className="text-primary-400">name</code>, <code className="text-primary-400">email</code>, <code className="text-primary-400">country_code</code>, <code className="text-primary-400">mobile_without_country_code</code>, <code className="text-primary-400">company</code>, <code className="text-primary-400">city</code>, <code className="text-primary-400">state</code>, <code className="text-primary-400">country</code>, <code className="text-primary-400">lead_owner</code>, <code className="text-primary-400">crm_status</code>, <code className="text-primary-400">crm_note</code>, <code className="text-primary-400">data_source</code>, <code className="text-primary-400">possession_time</code>, <code className="text-primary-400">description</code>. AI will match these automatically from your CSV columns.
        </p>
      </div>

      {/* Download Sample CSV Template Button */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const headers = "created_at,name,email,country_code,mobile_without_country_code,company,city,state,country,lead_owner,crm_status,crm_note,data_source,possession_time,description\n";
            const sampleRow = "2026-05-13 14:20:48,John Doe,john.doe@example.com,+91,9876543210,GrowEasy,Mumbai,Maharashtra,India,test@gmail.com,GOOD_LEAD_FOLLOW_UP,Client is asking to reschedule demo,leads_on_demand,,\n";
            const blob = new Blob([headers + sampleRow], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "groweasy_crm_template.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-primary-300 hover:text-primary-200 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all duration-200 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 01.75-.75h10.638L10.22 5.28a.75.75 0 111.06-1.06l5.5 5.5a.75.75 0 010 1.06l-5.5 5.5a.75.75 0 11-1.06-1.06l4.168-4.17H3.75A.75.75 0 013 10z"
              clipRule="evenodd"
            />
          </svg>
          Download Sample CSV Template
        </button>
      </div>

      {/* Selected file preview */}
      {selectedFile && (
        <div className="animate-fade-in glass rounded-xl px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400 flex-shrink-0">
            <FileIcon />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{selectedFile.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{formatFileSize(selectedFile.size)}</p>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs font-medium">Ready</span>
          </div>
        </div>
      )}
    </div>
  );
}
