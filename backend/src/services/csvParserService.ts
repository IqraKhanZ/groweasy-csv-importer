import { parse } from 'csv-parse/sync';

// =============================================================================
// CSV Parser Service
// =============================================================================

/**
 * Parses a CSV buffer into an array of row objects.
 * Each object maps column header → cell value (all strings).
 *
 * Uses the synchronous csv-parse API with:
 * - columns: true  (first row becomes keys)
 * - skip_empty_lines: true
 * - trim: true
 */
export function parseCsvBuffer(buffer: Buffer): Record<string, string>[] {
  const rows = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    cast: false,
  }) as Record<string, string>[];

  return rows;
}

/**
 * Validates that a parsed CSV has at least one row and at least one column.
 */
export function validateCsvStructure(rows: Record<string, string>[]): {
  valid: boolean;
  error?: string;
} {
  if (!rows || rows.length === 0) {
    return { valid: false, error: 'CSV file has no data rows.' };
  }

  const columns = Object.keys(rows[0] ?? {});
  if (columns.length === 0) {
    return { valid: false, error: 'CSV file has no columns.' };
  }

  return { valid: true };
}
