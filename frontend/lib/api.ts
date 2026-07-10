import type { ImportResult } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

/**
 * Uploads a CSV file and triggers the AI-powered CRM import process.
 * POSTs as multipart/form-data with field name `file`.
 *
 * @throws {Error} with the backend's error.message on non-200 responses
 */
export async function uploadAndProcess(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/import/process`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      if (errorBody && typeof errorBody.message === 'string') {
        errorMessage = errorBody.message;
      } else if (errorBody && typeof errorBody.error === 'string') {
        errorMessage = errorBody.error;
      }
    } catch {
      // Could not parse JSON — use default message
    }
    throw new Error(errorMessage);
  }

  const data: ImportResult = await response.json();
  return data;
}
