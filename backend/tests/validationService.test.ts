import {
  isValidCrmStatus,
  isValidDataSource,
  isParsableDate,
  sanitizeForCsv,
  shouldSkipRecord,
  normalizeCrmRecord,
} from '../src/services/validationService';
import { CrmRecord } from '../src/types/crmRecord';

// =============================================================================
// Helper: build a complete CrmRecord with all defaults
// =============================================================================
function makeRecord(overrides: Partial<CrmRecord> = {}): CrmRecord {
  return {
    created_at: '2024-01-01 10:00:00',
    name: 'Test User',
    email: 'test@example.com',
    country_code: '91',
    mobile_without_country_code: '9876543210',
    company: 'Acme',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    lead_owner: 'Sales Rep',
    crm_status: 'GOOD_LEAD_FOLLOW_UP',
    crm_note: '',
    data_source: 'leads_on_demand',
    possession_time: '2025-Q1',
    description: '',
    ...overrides,
  };
}

// =============================================================================
// isValidCrmStatus
// =============================================================================

describe('isValidCrmStatus', () => {
  it('returns true for all valid CRM status values', () => {
    expect(isValidCrmStatus('GOOD_LEAD_FOLLOW_UP')).toBe(true);
    expect(isValidCrmStatus('DID_NOT_CONNECT')).toBe(true);
    expect(isValidCrmStatus('BAD_LEAD')).toBe(true);
    expect(isValidCrmStatus('SALE_DONE')).toBe(true);
  });

  it('returns false for invalid CRM status values', () => {
    expect(isValidCrmStatus('INVALID_STATUS')).toBe(false);
    expect(isValidCrmStatus('good_lead_follow_up')).toBe(false); // case-sensitive
    expect(isValidCrmStatus('PENDING')).toBe(false);
    expect(isValidCrmStatus('sale done')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isValidCrmStatus('')).toBe(false);
  });
});

// =============================================================================
// isValidDataSource
// =============================================================================

describe('isValidDataSource', () => {
  it('returns true for all valid data source values', () => {
    expect(isValidDataSource('leads_on_demand')).toBe(true);
    expect(isValidDataSource('meridian_tower')).toBe(true);
    expect(isValidDataSource('eden_park')).toBe(true);
    expect(isValidDataSource('varah_swamy')).toBe(true);
    expect(isValidDataSource('sarjapur_plots')).toBe(true);
  });

  it('returns true for an empty string (unknown data source)', () => {
    expect(isValidDataSource('')).toBe(true);
  });

  it('returns false for invalid data source values', () => {
    expect(isValidDataSource('unknown_source')).toBe(false);
    expect(isValidDataSource('LEADS_ON_DEMAND')).toBe(false); // case-sensitive
    expect(isValidDataSource('garbage')).toBe(false);
    expect(isValidDataSource('facebook_ads')).toBe(false);
  });
});

// =============================================================================
// isParsableDate
// =============================================================================

describe('isParsableDate', () => {
  it('returns true for valid date strings', () => {
    expect(isParsableDate('2024-01-15 09:30:00')).toBe(true);
    expect(isParsableDate('2024-01-15')).toBe(true);
    expect(isParsableDate('January 15, 2024')).toBe(true);
    expect(isParsableDate('2024-12-31T23:59:59Z')).toBe(true);
  });

  it('returns false for clearly invalid date strings', () => {
    expect(isParsableDate('not-a-date')).toBe(false);
    expect(isParsableDate('32/13/9999')).toBe(false);
    expect(isParsableDate('hello world')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isParsableDate('')).toBe(false);
  });

  it('returns false for whitespace-only strings', () => {
    expect(isParsableDate('   ')).toBe(false);
  });
});

// =============================================================================
// sanitizeForCsv
// =============================================================================

describe('sanitizeForCsv', () => {
  it('replaces raw \\n with the literal two-char sequence \\\\n', () => {
    const input = 'line1\nline2';
    const result = sanitizeForCsv(input);
    expect(result).toBe('line1\\nline2');
    expect(result).not.toContain('\n');
  });

  it('replaces raw \\r with the literal two-char sequence \\\\n', () => {
    const input = 'line1\rline2';
    const result = sanitizeForCsv(input);
    expect(result).toBe('line1\\nline2');
    expect(result).not.toContain('\r');
  });

  it('replaces \\r\\n (CRLF) with the literal two-char sequence \\\\n', () => {
    const input = 'line1\r\nline2';
    const result = sanitizeForCsv(input);
    expect(result).toBe('line1\\nline2');
    expect(result).not.toContain('\r');
    expect(result).not.toContain('\n');
  });

  it('escapes embedded double-quotes by doubling them', () => {
    const input = 'He said "hello"';
    const result = sanitizeForCsv(input);
    expect(result).toBe('He said ""hello""');
  });

  it('handles strings with both newlines and double-quotes', () => {
    const input = 'Note: "urgent"\nfollow up';
    const result = sanitizeForCsv(input);
    expect(result).toBe('Note: ""urgent""\\nfollow up');
  });

  it('returns the same string when no special characters are present', () => {
    const input = 'Plain text without special chars';
    expect(sanitizeForCsv(input)).toBe(input);
  });

  it('handles empty string', () => {
    expect(sanitizeForCsv('')).toBe('');
  });
});

// =============================================================================
// shouldSkipRecord
// =============================================================================

describe('shouldSkipRecord', () => {
  it('returns true when both email and mobile are empty', () => {
    const record = makeRecord({ email: '', mobile_without_country_code: '' });
    expect(shouldSkipRecord(record)).toBe(true);
  });

  it('returns false when email is present and mobile is empty', () => {
    const record = makeRecord({ email: 'test@example.com', mobile_without_country_code: '' });
    expect(shouldSkipRecord(record)).toBe(false);
  });

  it('returns false when mobile is present and email is empty', () => {
    const record = makeRecord({ email: '', mobile_without_country_code: '9876543210' });
    expect(shouldSkipRecord(record)).toBe(false);
  });

  it('returns false when both email and mobile are present', () => {
    const record = makeRecord({
      email: 'test@example.com',
      mobile_without_country_code: '9876543210',
    });
    expect(shouldSkipRecord(record)).toBe(false);
  });
});

// =============================================================================
// normalizeCrmRecord
// =============================================================================

describe('normalizeCrmRecord', () => {
  it('fills all missing fields with empty strings', () => {
    const result = normalizeCrmRecord({});
    const expectedKeys: Array<keyof CrmRecord> = [
      'created_at', 'name', 'email', 'country_code', 'mobile_without_country_code',
      'company', 'city', 'state', 'country', 'lead_owner', 'crm_status',
      'crm_note', 'data_source', 'possession_time', 'description',
    ];
    for (const key of expectedKeys) {
      expect(typeof result[key]).toBe('string');
    }
    // Non-date fields without input should be ""
    expect(result.name).toBe('');
    expect(result.email).toBe('');
  });

  it('coerces an invalid crm_status to ""', () => {
    const result = normalizeCrmRecord({
      crm_status: 'INVALID_STATUS',
      created_at: '2024-01-01 10:00:00',
    });
    expect(result.crm_status).toBe('');
  });

  it('keeps a valid crm_status unchanged', () => {
    const result = normalizeCrmRecord({
      crm_status: 'SALE_DONE',
      created_at: '2024-01-01 10:00:00',
    });
    expect(result.crm_status).toBe('SALE_DONE');
  });

  it('coerces an invalid data_source to ""', () => {
    const result = normalizeCrmRecord({
      data_source: 'facebook_ads',
      created_at: '2024-01-01 10:00:00',
    });
    expect(result.data_source).toBe('');
  });

  it('keeps a valid data_source unchanged', () => {
    const result = normalizeCrmRecord({
      data_source: 'eden_park',
      created_at: '2024-01-01 10:00:00',
    });
    expect(result.data_source).toBe('eden_park');
  });

  it('keeps empty string data_source as "" (valid unknown)', () => {
    const result = normalizeCrmRecord({
      data_source: '',
      created_at: '2024-01-01 10:00:00',
    });
    expect(result.data_source).toBe('');
  });

  it('replaces an invalid created_at with a current timestamp in YYYY-MM-DD HH:mm:ss format', () => {
    const before = new Date();
    const result = normalizeCrmRecord({ created_at: 'not-a-date' });
    const after = new Date();

    // Should match YYYY-MM-DD HH:mm:ss format
    expect(result.created_at).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);

    // Timestamp should be between before and after
    const resultDate = new Date(result.created_at);
    expect(resultDate.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
    expect(resultDate.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
  });

  it('replaces empty created_at with a current timestamp', () => {
    const result = normalizeCrmRecord({ created_at: '' });
    expect(result.created_at).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  it('preserves a valid created_at unchanged', () => {
    const result = normalizeCrmRecord({ created_at: '2024-06-15 14:30:00' });
    expect(result.created_at).toBe('2024-06-15 14:30:00');
  });

  it('sanitizes crm_note (removes raw newlines)', () => {
    const result = normalizeCrmRecord({
      crm_note: 'Line one\nLine two',
      created_at: '2024-01-01 10:00:00',
    });
    expect(result.crm_note).not.toContain('\n');
    expect(result.crm_note).toContain('\\n');
  });

  it('sanitizes description (removes raw newlines)', () => {
    const result = normalizeCrmRecord({
      description: 'First\r\nSecond',
      created_at: '2024-01-01 10:00:00',
    });
    expect(result.description).not.toContain('\r');
    expect(result.description).not.toContain('\n');
  });
});
