import { Request, Response, NextFunction } from 'express';
import { AiExtractionError, ValidationError, FileTooLargeError } from '../types/crmRecord';
import { logger } from '../utils/logger';

// =============================================================================
// Multer error type (not exported from @types/multer at runtime)
// =============================================================================

interface MulterError extends Error {
  code: string;
  field?: string;
}

function isMulterError(err: unknown): err is MulterError {
  return (
    err instanceof Error &&
    'code' in err &&
    typeof (err as MulterError).code === 'string'
  );
}

// =============================================================================
// Global error handler
// =============================================================================

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // Log the error for server-side diagnostics
  logger.error(
    `Error: ${err instanceof Error ? err.message : String(err)}`,
  );

  // ValidationError → 400
  if (err instanceof ValidationError) {
    res.status(400).json({
      error: {
        message: err.message,
        code: err.code || 'VALIDATION_ERROR',
      },
    });
    return;
  }

  // FileTooLargeError → 400
  if (err instanceof FileTooLargeError) {
    res.status(400).json({
      error: {
        message: err.message,
        code: err.code || 'FILE_TOO_LARGE',
      },
    });
    return;
  }

  // AiExtractionError → 500
  if (err instanceof AiExtractionError) {
    res.status(500).json({
      error: {
        message: err.message,
        code: 'AI_EXTRACTION_ERROR',
      },
    });
    return;
  }

  // Multer LIMIT_FILE_SIZE → 400
  if (isMulterError(err) && err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({
      error: {
        message: 'File exceeds maximum size limit',
        code: 'FILE_TOO_LARGE',
      },
    });
    return;
  }

  // Default → 500
  res.status(500).json({
    error: {
      message: err instanceof Error ? err.message : 'An unexpected error occurred.',
      code: 'INTERNAL_ERROR',
    },
  });
}
