'use client';

import { useState, useCallback } from 'react';
import { uploadAndProcess } from '@/lib/api';
import type { ImportResult } from '@/lib/types';

interface UseImportProcessReturn {
  result: ImportResult | null;
  isLoading: boolean;
  error: string | null;
  runImport: (file: File) => Promise<void>;
  reset: () => void;
}

export function useImportProcess(): UseImportProcessReturn {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const runImport = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const importResult = await uploadAndProcess(file);
      setResult(importResult);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'An unknown error occurred while processing the file.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    result,
    isLoading,
    error,
    runImport,
    reset,
  };
}
