'use client';

import { useState, useCallback } from 'react';
import { parseCsvFile } from '@/lib/csvParser';

interface UseCsvUploadReturn {
  file: File | null;
  headers: string[];
  rows: Record<string, string>[];
  error: string | null;
  handleFileSelected: (file: File) => Promise<void>;
  reset: () => void;
}

export function useCsvUpload(): UseCsvUploadReturn {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = useCallback(async (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
    setHeaders([]);
    setRows([]);

    try {
      const { headers: parsedHeaders, rows: parsedRows } = await parseCsvFile(selectedFile);
      setHeaders(parsedHeaders);
      setRows(parsedRows);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unknown error occurred while parsing the file.';
      setError(message);
      setFile(null);
    }
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setHeaders([]);
    setRows([]);
    setError(null);
  }, []);

  return {
    file,
    headers,
    rows,
    error,
    handleFileSelected,
    reset,
  };
}
