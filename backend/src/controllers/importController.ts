import { Request, Response, NextFunction } from 'express';
import { parseCsvBuffer, validateCsvStructure } from '../services/csvParserService';
import { processAllBatches } from '../services/batchService';
import { ValidationError } from '../types/crmRecord';
import { logger } from '../utils/logger';

// =============================================================================
// Preview Controller
// =============================================================================

/**
 * POST /api/import/preview
 *
 * Accepts a CSV file via multipart upload, parses it, and returns the raw rows
 * plus the list of detected column headers. Does NOT call the AI.
 */
export async function previewImport(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) {
      return next(new ValidationError('No file uploaded. Please attach a CSV file.'));
    }

    const rows = parseCsvBuffer(req.file.buffer);
    const validation = validateCsvStructure(rows);

    if (!validation.valid) {
      return next(new ValidationError(validation.error ?? 'Invalid CSV structure.'));
    }

    const headers = Object.keys(rows[0] ?? {});

    logger.info(`Preview: ${rows.length} row(s), ${headers.length} column(s)`);

    res.status(200).json({ rows, headers });
  } catch (err) {
    next(err);
  }
}

// =============================================================================
// Process Controller
// =============================================================================

/**
 * POST /api/import/process
 *
 * Two modes:
 * 1. If Content-Type is application/json → reads rows from req.body.rows
 * 2. Otherwise → reads a CSV file from req.file and parses it
 *
 * Validates the row structure, then runs the full AI extraction pipeline,
 * returning the ImportResult.
 */
export async function processImport(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    let rows: Record<string, string>[];

    const contentType = req.headers['content-type'] ?? '';

    if (contentType.includes('application/json')) {
      // Pre-parsed rows supplied in JSON body
      const bodyRows = req.body?.rows;
      if (!Array.isArray(bodyRows)) {
        return next(
          new ValidationError(
            'Expected req.body.rows to be an array when Content-Type is application/json.',
          ),
        );
      }
      rows = bodyRows as Record<string, string>[];
    } else {
      // CSV file upload
      if (!req.file) {
        return next(new ValidationError('No file uploaded. Please attach a CSV file.'));
      }
      rows = parseCsvBuffer(req.file.buffer);
    }

    const validation = validateCsvStructure(rows);
    if (!validation.valid) {
      return next(new ValidationError(validation.error ?? 'Invalid CSV structure.'));
    }

    logger.info(`Processing import: ${rows.length} row(s)`);

    const importResult = await processAllBatches(rows);

    res.status(200).json(importResult);
  } catch (err) {
    next(err);
  }
}
