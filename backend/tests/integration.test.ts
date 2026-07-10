import request from 'supertest';
import app from '../src/app';
import { ImportResult } from '../src/types/crmRecord';

// =============================================================================
// Mock the AI extraction service so tests never hit an LLM
// =============================================================================

jest.mock('../src/services/aiExtractionService', () => ({
  extractBatch: jest.fn(),
}));

// Import the mock so we can configure it per test
import { extractBatch } from '../src/services/aiExtractionService';

const mockExtractBatch = extractBatch as jest.MockedFunction<typeof extractBatch>;

// =============================================================================
// CSV fixture helpers
// =============================================================================

/**
 * Builds a CSV buffer with optional rows.
 */
function buildCsvBuffer(
  headers: string[],
  rows: string[][],
): Buffer {
  const headerLine = headers.join(',');
  const dataLines = rows.map((r) => r.join(','));
  return Buffer.from([headerLine, ...dataLines].join('\n'), 'utf-8');
}

// =============================================================================
// POST /api/import/process
// =============================================================================

describe('POST /api/import/process', () => {
  beforeEach(() => {
    mockExtractBatch.mockReset();
    process.env['AI_API_KEY'] = 'test-key';
    process.env['AI_PROVIDER'] = 'openai';
    process.env['AI_BATCH_SIZE'] = '25';
  });

  afterEach(() => {
    delete process.env['AI_API_KEY'];
    delete process.env['AI_PROVIDER'];
    delete process.env['AI_BATCH_SIZE'];
  });

  it('returns an ImportResult shape with imported, skipped, totalImported, totalSkipped', async () => {
    const csvBuffer = buildCsvBuffer(
      ['name', 'email', 'phone'],
      [
        ['Alice', 'alice@example.com', '9876543210'],
        ['Bob', 'bob@example.com', '8765432109'],
      ],
    );

    mockExtractBatch.mockResolvedValueOnce([
      {
        name: 'Alice',
        email: 'alice@example.com',
        mobile_without_country_code: '9876543210',
        crm_status: 'GOOD_LEAD_FOLLOW_UP',
        data_source: 'leads_on_demand',
        created_at: '2024-01-01 10:00:00',
      },
      {
        name: 'Bob',
        email: 'bob@example.com',
        mobile_without_country_code: '8765432109',
        crm_status: 'DID_NOT_CONNECT',
        data_source: 'eden_park',
        created_at: '2024-01-02 11:00:00',
      },
    ]);

    const response = await request(app)
      .post('/api/import/process')
      .attach('file', csvBuffer, { filename: 'test.csv', contentType: 'text/csv' });

    expect(response.status).toBe(200);

    const body = response.body as ImportResult;
    expect(body).toHaveProperty('imported');
    expect(body).toHaveProperty('skipped');
    expect(body).toHaveProperty('totalImported');
    expect(body).toHaveProperty('totalSkipped');
    expect(Array.isArray(body.imported)).toBe(true);
    expect(Array.isArray(body.skipped)).toBe(true);
    expect(typeof body.totalImported).toBe('number');
    expect(typeof body.totalSkipped).toBe('number');
    expect(body.totalImported).toBe(2);
    expect(body.totalSkipped).toBe(0);
    expect(body.imported).toHaveLength(2);
  });

  it('routes a row with no email AND no mobile to skipped with the correct reason', async () => {
    const csvBuffer = buildCsvBuffer(
      ['name', 'email', 'phone'],
      [
        ['Alice', 'alice@example.com', '9876543210'],
        ['NoContact', '', ''],             // should be skipped
      ],
    );

    mockExtractBatch.mockResolvedValueOnce([
      {
        name: 'Alice',
        email: 'alice@example.com',
        mobile_without_country_code: '9876543210',
        crm_status: '',
        data_source: '',
        created_at: '2024-01-01 10:00:00',
      },
      {
        name: 'NoContact',
        email: '',
        mobile_without_country_code: '',
        crm_status: '',
        data_source: '',
        created_at: '2024-01-01 10:00:00',
      },
    ]);

    const response = await request(app)
      .post('/api/import/process')
      .attach('file', csvBuffer, { filename: 'test.csv', contentType: 'text/csv' });

    expect(response.status).toBe(200);

    const body = response.body as ImportResult;
    expect(body.totalImported).toBe(1);
    expect(body.totalSkipped).toBe(1);
    expect(body.skipped).toHaveLength(1);
    expect(body.skipped[0]?.reason).toBe('Missing both email and mobile number');
  });

  it('returns 400 when no file is provided', async () => {
    const response = await request(app)
      .post('/api/import/process');

    expect(response.status).toBe(400);
  });

  it('returns 400 for a CSV with only headers and no data rows', async () => {
    const csvBuffer = Buffer.from('name,email,phone\n', 'utf-8');

    const response = await request(app)
      .post('/api/import/process')
      .attach('file', csvBuffer, { filename: 'empty.csv', contentType: 'text/csv' });

    expect(response.status).toBe(400);
  });
});

// =============================================================================
// POST /api/import/preview
// =============================================================================

describe('POST /api/import/preview', () => {
  it('returns { rows, headers } with the correct row count', async () => {
    const csvBuffer = buildCsvBuffer(
      ['Full Name', 'Email Address', 'Mobile'],
      [
        ['Alice Smith', 'alice@example.com', '9876543210'],
        ['Bob Jones', 'bob@example.com', '8765432109'],
        ['Charlie Brown', 'charlie@example.com', '7654321098'],
      ],
    );

    const response = await request(app)
      .post('/api/import/preview')
      .attach('file', csvBuffer, { filename: 'preview.csv', contentType: 'text/csv' });

    expect(response.status).toBe(200);

    const body = response.body as { rows: unknown[]; headers: string[] };
    expect(body).toHaveProperty('rows');
    expect(body).toHaveProperty('headers');
    expect(Array.isArray(body.rows)).toBe(true);
    expect(Array.isArray(body.headers)).toBe(true);
    expect(body.rows).toHaveLength(3);
    expect(body.headers).toContain('Full Name');
    expect(body.headers).toContain('Email Address');
    expect(body.headers).toContain('Mobile');
    expect(body.headers).toHaveLength(3);
  });

  it('returns 400 when no file is attached', async () => {
    const response = await request(app)
      .post('/api/import/preview');

    expect(response.status).toBe(400);
  });

  it('returns 400 for a CSV with only headers and no data rows', async () => {
    const csvBuffer = Buffer.from('name,email\n', 'utf-8');

    const response = await request(app)
      .post('/api/import/preview')
      .attach('file', csvBuffer, { filename: 'headers_only.csv', contentType: 'text/csv' });

    expect(response.status).toBe(400);
  });

  it('does NOT call AI extraction during preview', async () => {
    const csvBuffer = buildCsvBuffer(
      ['name', 'email'],
      [['Alice', 'alice@example.com']],
    );

    mockExtractBatch.mockReset();

    await request(app)
      .post('/api/import/preview')
      .attach('file', csvBuffer, { filename: 'preview.csv', contentType: 'text/csv' });

    expect(mockExtractBatch).not.toHaveBeenCalled();
  });
});
