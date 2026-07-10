import { parseAiJsonResponse, extractBatch } from '../src/services/aiExtractionService';
import { AiExtractionError } from '../src/types/crmRecord';

// =============================================================================
// Mock the openai module
// =============================================================================

jest.mock('openai', () => {
  const mockCreate = jest.fn();
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    })),
    // expose mockCreate so tests can configure it
    __mockCreate: mockCreate,
  };
});

// Helper to access the mocked create function
function getMockCreate(): jest.Mock {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const openaiModule = require('openai') as { __mockCreate: jest.Mock };
  return openaiModule.__mockCreate;
}

// =============================================================================
// parseAiJsonResponse tests
// =============================================================================

describe('parseAiJsonResponse', () => {
  // -------------------------------------------------------------------------
  // (a) strips ```json fences correctly
  // -------------------------------------------------------------------------
  it('(a) strips ```json ... ``` fences and parses the JSON array', () => {
    const raw = '```json\n[{"name":"Alice"},{"name":"Bob"}]\n```';
    const result = parseAiJsonResponse(raw);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect((result[0] as { name: string }).name).toBe('Alice');
  });

  it('(a) strips plain ``` fences without the json tag', () => {
    const raw = '```\n[{"name":"Charlie"}]\n```';
    const result = parseAiJsonResponse(raw);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
  });

  it('(a) handles a raw JSON array without any fences', () => {
    const raw = '[{"name":"Dave"}]';
    const result = parseAiJsonResponse(raw);
    expect(result).toHaveLength(1);
  });

  // -------------------------------------------------------------------------
  // (b) throws AiExtractionError on malformed JSON
  // -------------------------------------------------------------------------
  it('(b) throws AiExtractionError when the response is malformed JSON', () => {
    const raw = '```json\n{ invalid json }\n```';
    expect(() => parseAiJsonResponse(raw)).toThrow(AiExtractionError);
  });

  it('(b) throws AiExtractionError when the parsed result is not an array', () => {
    const raw = '{"name":"Alice"}';
    expect(() => parseAiJsonResponse(raw)).toThrow(AiExtractionError);
  });

  it('(b) throws AiExtractionError for completely empty response', () => {
    expect(() => parseAiJsonResponse('')).toThrow(AiExtractionError);
  });
});

// =============================================================================
// extractBatch tests (with mocked OpenAI)
// =============================================================================

describe('extractBatch', () => {
  beforeEach(() => {
    process.env['AI_PROVIDER'] = 'openai';
    process.env['AI_MODEL'] = 'gpt-4o-mini';
    process.env['AI_API_KEY'] = 'test-key-123';
    getMockCreate().mockReset();
  });

  afterEach(() => {
    delete process.env['AI_PROVIDER'];
    delete process.env['AI_MODEL'];
    delete process.env['AI_API_KEY'];
  });

  // -------------------------------------------------------------------------
  // (c) throws AiExtractionError when response array length mismatches
  // -------------------------------------------------------------------------
  it('(c) throws AiExtractionError when AI returns fewer records than batch size', async () => {
    const batch = [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
    ];

    // AI returns only 1 record for a batch of 2 — set up mock for BOTH assertions
    getMockCreate()
      .mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify([{ name: 'Alice' }]) } }],
      })
      .mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify([{ name: 'Alice' }]) } }],
      });

    await expect(extractBatch(batch)).rejects.toThrow(AiExtractionError);
    await expect(extractBatch(batch)).rejects.toThrow(/length mismatch/i);
  });

  it('(c) throws AiExtractionError when AI returns more records than batch size', async () => {
    const batch = [{ name: 'Alice', email: 'alice@example.com' }];

    // AI returns 2 records for a batch of 1
    getMockCreate().mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify([{ name: 'Alice' }, { name: 'Extra' }]),
          },
        },
      ],
    });

    await expect(extractBatch(batch)).rejects.toThrow(AiExtractionError);
  });

  it('resolves with extracted records when length matches', async () => {
    const batch = [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
    ];

    const expectedOutput = [
      { name: 'Alice', email: 'alice@example.com', crm_status: '' },
      { name: 'Bob', email: 'bob@example.com', crm_status: '' },
    ];

    getMockCreate().mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify(expectedOutput),
          },
        },
      ],
    });

    const result = await extractBatch(batch);
    expect(result).toHaveLength(2);
    expect(result[0]?.name).toBe('Alice');
    expect(result[1]?.name).toBe('Bob');
  });

  it('throws AiExtractionError when AI_API_KEY is not set', async () => {
    delete process.env['AI_API_KEY'];
    const batch = [{ name: 'Alice' }];
    await expect(extractBatch(batch)).rejects.toThrow(AiExtractionError);
    await expect(extractBatch(batch)).rejects.toThrow(/AI_API_KEY/);
  });
});
