import { CrmRecord } from '../types/crmRecord';

// =============================================================================
// Constants
// =============================================================================

const CRM_STATUS_VALUES = [
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
] as const;

const DATA_SOURCE_VALUES = [
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
] as const;

// =============================================================================
// Validators
// =============================================================================

/**
 * Returns true if value is one of the allowed CRM status values.
 */
export function isValidCrmStatus(value: string): boolean {
  return (CRM_STATUS_VALUES as readonly string[]).includes(value);
}

/**
 * Returns true if value is one of the allowed data source values OR is an empty string.
 */
export function isValidDataSource(value: string): boolean {
  if (value === '') return true;
  return (DATA_SOURCE_VALUES as readonly string[]).includes(value);
}

/**
 * Returns true if the string is a non-empty, parseable date.
 * Returns false for empty strings or strings that yield an Invalid Date.
 */
export function isParsableDate(value: string): boolean {
  if (!value || value.trim() === '') return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
}

// =============================================================================
// Sanitization
// =============================================================================

/**
 * Sanitizes a value for safe inclusion in CSV cells.
 * - Replaces raw \n and \r with the literal two-char sequence \\n
 * - Escapes embedded double-quotes by doubling them
 */
export function sanitizeForCsv(value: string): string {
  // Replace raw newlines/carriage returns with literal \n sequence
  let sanitized = value.replace(/\r\n/g, '\\n').replace(/\r/g, '\\n').replace(/\n/g, '\\n');
  // Escape embedded double-quotes by doubling them
  sanitized = sanitized.replace(/"/g, '""');
  return sanitized;
}

// =============================================================================
// Skip rule
// =============================================================================

/**
 * Returns true if a record should be skipped:
 * both email AND mobile_without_country_code are empty strings.
 */
export function shouldSkipRecord(record: CrmRecord): boolean {
  return record.email === '' && record.mobile_without_country_code === '';
}

// =============================================================================
// Date formatting (pure JS, no external libraries)
// =============================================================================

/**
 * Formats a Date object as "YYYY-MM-DD HH:mm:ss" in local time.
 */
function formatTimestamp(date: Date): string {
  const pad = (n: number, digits = 2): string => String(n).padStart(digits, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// =============================================================================
// Normalization
// =============================================================================

/**
 * Normalizes a partial CRM record into a complete CrmRecord.
 *
 * Rules applied:
 * 1. Fills any missing field with ""
 * 2. Coerces crm_status to "" if not a valid CRM status value
 * 3. Coerces data_source to "" if not a valid data source value (empty string is valid)
 * 4. Runs sanitizeForCsv on crm_note and description
 * 5. If created_at is not a parseable date, replaces it with current server timestamp
 */
export function normalizeCrmRecord(record: Partial<CrmRecord>): CrmRecord {
  const get = (key: keyof CrmRecord): string => {
    const val = record[key];
    return typeof val === 'string' ? val : '';
  };

  const crm_status = isValidCrmStatus(get('crm_status')) ? get('crm_status') : '';
  const data_source = isValidDataSource(get('data_source')) ? get('data_source') : '';
  const crm_note = sanitizeForCsv(get('crm_note'));
  const description = sanitizeForCsv(get('description'));

  const rawCreatedAt = get('created_at');
  const created_at = isParsableDate(rawCreatedAt)
    ? rawCreatedAt
    : formatTimestamp(new Date());

  return {
    created_at,
    name: get('name'),
    email: get('email'),
    country_code: get('country_code'),
    mobile_without_country_code: get('mobile_without_country_code'),
    company: get('company'),
    city: get('city'),
    state: get('state'),
    country: get('country'),
    lead_owner: get('lead_owner'),
    crm_status,
    crm_note,
    data_source,
    possession_time: get('possession_time'),
    description,
  };
}
