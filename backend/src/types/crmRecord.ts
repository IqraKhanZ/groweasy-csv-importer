// =============================================================================
// CRM Record types and error classes
// =============================================================================

/**
 * Represents a single CRM record with exactly 15 string fields.
 * Field order matches CRM_FIELDS_ORDER constant.
 */
export interface CrmRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
}

/**
 * The result returned after processing an entire CSV import.
 */
export interface ImportResult {
  imported: CrmRecord[];
  skipped: {
    originalRow: Record<string, string>;
    reason: string;
  }[];
  totalImported: number;
  totalSkipped: number;
}

// =============================================================================
// Custom error classes
// =============================================================================

export class AiExtractionError extends Error {
  public readonly code: string;

  constructor(message: string, code = 'AI_EXTRACTION_ERROR') {
    super(message);
    this.name = 'AiExtractionError';
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends Error {
  public readonly code: string;

  constructor(message: string, code = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class FileTooLargeError extends Error {
  public readonly code: string;

  constructor(message: string, code = 'FILE_TOO_LARGE') {
    super(message);
    this.name = 'FileTooLargeError';
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
