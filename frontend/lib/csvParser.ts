import Papa from 'papaparse';

export interface ParsedCsvResult {
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * Parses a CSV file client-side using PapaParse.
 * Returns headers (column names) and rows (array of objects keyed by header).
 *
 * @param file - The CSV File object to parse
 * @returns Promise resolving to { headers, rows }
 * @throws Error if parsing fails or file is empty
 */
export function parseCsvFile(file: File): Promise<ParsedCsvResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete(results) {
        if (results.errors && results.errors.length > 0) {
          // 'FieldMismatch' is a soft warning (inconsistent column count); skip it.
          // 'Quotes' and 'Delimiter' are structural failures — reject on those.
          const criticalErrors = results.errors.filter(
            (e) => e.type === 'Quotes' || e.type === 'Delimiter'
          );
          if (criticalErrors.length > 0) {
            reject(new Error(`CSV parse error: ${criticalErrors[0]!.message}`));
            return;
          }
        }

        const rows = results.data as Record<string, string>[];

        if (!rows || rows.length === 0) {
          reject(new Error('The CSV file appears to be empty or has no data rows.'));
          return;
        }

        // Extract headers from the first row's keys (PapaParse sets these from the header row)
        const headers = results.meta.fields ?? Object.keys(rows[0] ?? {});

        if (headers.length === 0) {
          reject(new Error('No columns detected in the CSV file.'));
          return;
        }

        resolve({ headers, rows });
      },
      error(error: Error) {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}
