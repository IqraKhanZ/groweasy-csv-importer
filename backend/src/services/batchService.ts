import { ImportResult } from '../types/crmRecord';
import { extractBatch } from './aiExtractionService';
import { normalizeCrmRecord, shouldSkipRecord } from './validationService';
import { withRetry } from '../utils/retry';
import { logger } from '../utils/logger';

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_BATCH_SIZE = 25;
const MAX_RETRIES_PER_BATCH = 3;
const RETRY_BACKOFF_MS = [1000, 3000, 7000];

// =============================================================================
// Chunking
// =============================================================================

/**
 * Splits a flat array of rows into sub-arrays of at most `batchSize` elements.
 */
export function chunkRecords(
  rows: Record<string, string>[],
  batchSize: number,
): Record<string, string>[][] {
  const chunks: Record<string, string>[][] = [];
  for (let i = 0; i < rows.length; i += batchSize) {
    chunks.push(rows.slice(i, i + batchSize));
  }
  return chunks;
}

// =============================================================================
// Batch processor
// =============================================================================

/**
 * Processes all rows by:
 * 1. Chunking them into batches (size from AI_BATCH_SIZE env, default 25)
 * 2. Sending each batch to the AI extraction service with retry logic
 * 3. Normalizing each partial CRM record
 * 4. Routing records to `imported` or `skipped` based on skip rule
 *
 * If an entire batch fails after all retries, every row in that batch is
 * routed to `skipped` with reason "AI extraction failed after retries".
 */
export async function processAllBatches(
  rows: Record<string, string>[],
): Promise<ImportResult> {
  const batchSizeEnv = parseInt(process.env['AI_BATCH_SIZE'] ?? '', 10);
  const batchSize = isNaN(batchSizeEnv) || batchSizeEnv <= 0
    ? DEFAULT_BATCH_SIZE
    : batchSizeEnv;

  const chunks = chunkRecords(rows, batchSize);
  const result: ImportResult = {
    imported: [],
    skipped: [],
    totalImported: 0,
    totalSkipped: 0,
  };

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex]!;
    logger.info(`Processing batch ${chunkIndex + 1}/${chunks.length} (${chunk.length} rows)`);

    try {
      const partialRecords = await withRetry(
        () => extractBatch(chunk),
        MAX_RETRIES_PER_BATCH,
        RETRY_BACKOFF_MS,
      );

      for (let rowIndex = 0; rowIndex < chunk.length; rowIndex++) {
        const originalRow = chunk[rowIndex]!;
        const partial = partialRecords[rowIndex] ?? {};
        const normalized = normalizeCrmRecord(partial);

        if (shouldSkipRecord(normalized)) {
          result.skipped.push({
            originalRow,
            reason: 'Missing both email and mobile number',
          });
        } else {
          result.imported.push(normalized);
        }
      }
    } catch (err) {
      logger.error(
        `Batch ${chunkIndex + 1} failed after ${MAX_RETRIES_PER_BATCH} retries: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );

      for (const originalRow of chunk) {
        result.skipped.push({
          originalRow,
          reason: 'AI extraction failed after retries',
        });
      }
    }
  }

  result.totalImported = result.imported.length;
  result.totalSkipped = result.skipped.length;

  logger.info(
    `Import complete: ${result.totalImported} imported, ${result.totalSkipped} skipped`,
  );

  return result;
}
