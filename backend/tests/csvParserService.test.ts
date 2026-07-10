import { parseCsvBuffer, validateCsvStructure } from '../src/services/csvParserService';

// =============================================================================
// csvParserService tests
// =============================================================================

describe('parseCsvBuffer', () => {
  // -------------------------------------------------------------------------
  // (a) Well-formed CSV → correct number of row objects
  // -------------------------------------------------------------------------
  it('(a) parses a well-formed CSV into the correct number of row objects', () => {
    const csv = `name,email,mobile
Alice,alice@example.com,9876543210
Bob,bob@example.com,8765432109
Charlie,charlie@example.com,7654321098`;

    const buffer = Buffer.from(csv, 'utf-8');
    const rows = parseCsvBuffer(buffer);

    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual({
      name: 'Alice',
      email: 'alice@example.com',
      mobile: '9876543210',
    });
    expect(rows[1]?.name).toBe('Bob');
    expect(rows[2]?.name).toBe('Charlie');
  });

  // -------------------------------------------------------------------------
  // (b) CSV with only headers, no data → validateCsvStructure returns valid: false
  // -------------------------------------------------------------------------
  it('(b) returns valid: false for CSV with headers but no data rows', () => {
    const csv = `name,email,mobile\n`;
    const buffer = Buffer.from(csv, 'utf-8');
    const rows = parseCsvBuffer(buffer);
    const result = validateCsvStructure(rows);

    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // (c) CSV with quoted fields containing commas → parses correctly
  // -------------------------------------------------------------------------
  it('(c) correctly parses quoted fields that contain commas', () => {
    const csv = `name,email,city
"Smith, John",john.smith@example.com,"New York, NY"
"Doe, Jane",jane.doe@example.com,"Los Angeles, CA"`;

    const buffer = Buffer.from(csv, 'utf-8');
    const rows = parseCsvBuffer(buffer);

    expect(rows).toHaveLength(2);
    expect(rows[0]?.name).toBe('Smith, John');
    expect(rows[0]?.city).toBe('New York, NY');
    expect(rows[1]?.name).toBe('Doe, Jane');
    expect(rows[1]?.city).toBe('Los Angeles, CA');
  });

  // -------------------------------------------------------------------------
  // (d) CSV with inconsistent column counts → does not crash
  // -------------------------------------------------------------------------
  it('(d) does not crash on CSV with inconsistent column counts', () => {
    // Row 2 has fewer columns than the header; row 3 has more
    const csv = `name,email,mobile
Alice,alice@example.com
Bob,bob@example.com,9876543210,extra_value`;

    const buffer = Buffer.from(csv, 'utf-8');
    // relax_column_count: true in parser means this should not throw
    expect(() => parseCsvBuffer(buffer)).not.toThrow();
    const rows = parseCsvBuffer(buffer);
    expect(rows.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// validateCsvStructure additional cases
// =============================================================================

describe('validateCsvStructure', () => {
  it('returns valid: true for rows with at least one column and one data row', () => {
    const rows = [{ name: 'Alice', email: 'alice@test.com' }];
    expect(validateCsvStructure(rows).valid).toBe(true);
  });

  it('returns valid: false for an empty array', () => {
    const result = validateCsvStructure([]);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns valid: false for rows where the first object has no keys', () => {
    const result = validateCsvStructure([{}]);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});
