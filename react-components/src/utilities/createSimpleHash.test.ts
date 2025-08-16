import { describe, expect, test } from 'vitest';
import { createSimpleHash } from './createSimpleHash';

describe(createSimpleHash.name, () => {
  test('should generate hash for empty array', () => {
    const result = createSimpleHash([]);

    expect(result).toBe('811c9dc5');
    expect(result).toHaveLength(8);
  });

  test('should generate hash for single string', () => {
    const result = createSimpleHash(['test']);

    expect(result).toHaveLength(8);
    expect(result).toMatch(/^[0-9a-f]{8}$/);
  });

  test('should generate hash for multiple strings', () => {
    const result = createSimpleHash(['rule1', 'rule2', 'rule3']);

    expect(result).toHaveLength(8);
    expect(result).toMatch(/^[0-9a-f]{8}$/);
  });

  test('should generate different hashes for different inputs', () => {
    const hash1 = createSimpleHash(['a', 'b', 'c']);
    const hash2 = createSimpleHash(['x', 'y', 'z']);

    expect(hash1).not.toBe(hash2);
  });

  test('should generate same hash for same inputs', () => {
    const parts = ['rule1', 'rule2', 'rule3'];
    const hash1 = createSimpleHash(parts);
    const hash2 = createSimpleHash(parts);

    expect(hash1).toBe(hash2);
  });

  test('should be sensitive to order of parts', () => {
    const hash1 = createSimpleHash(['a', 'b', 'c']);
    const hash2 = createSimpleHash(['c', 'b', 'a']);

    expect(hash1).not.toBe(hash2);
  });

  test('should handle empty strings in array', () => {
    const result = createSimpleHash(['', 'test', '']);

    expect(result).toHaveLength(8);
    expect(result).toMatch(/^[0-9a-f]{8}$/);
  });

  test('should handle special characters', () => {
    const result = createSimpleHash(['hello@world', 'test#123', 'special$chars']);

    expect(result).toHaveLength(8);
    expect(result).toMatch(/^[0-9a-f]{8}$/);
  });

  test('should handle unicode characters', () => {
    const result = createSimpleHash(['こんにちは', '🌟', 'café']);

    expect(result).toHaveLength(8);
    expect(result).toMatch(/^[0-9a-f]{8}$/);
  });

  test('should handle very long strings', () => {
    const longString = 'a'.repeat(10000);
    const result = createSimpleHash([longString]);

    expect(result).toHaveLength(8);
    expect(result).toMatch(/^[0-9a-f]{8}$/);
  });

  test('should handle many parts', () => {
    const manyParts = Array.from({ length: 1000 }, (_, i) => `part${i}`);
    const result = createSimpleHash(manyParts);

    expect(result).toHaveLength(8);
    expect(result).toMatch(/^[0-9a-f]{8}$/);
  });

  test('should generate different hashes when adding elements', () => {
    const hash1 = createSimpleHash(['a']);
    const hash2 = createSimpleHash(['a', 'b']);
    const hash3 = createSimpleHash(['a', 'b', 'c']);

    expect(hash1).not.toBe(hash2);
    expect(hash2).not.toBe(hash3);
    expect(hash1).not.toBe(hash3);
  });

  test('should pad short hashes with zeros', () => {
    // Test various inputs to ensure consistent 8-character output
    const inputs = [
      ['short'],
      ['a'],
      ['1'],
      [''],
      ['test', '123']
    ];

    inputs.forEach(input => {
      const result = createSimpleHash(input);
      expect(result).toHaveLength(8);
      expect(result).toMatch(/^[0-9a-f]{8}$/);
    });
  });

  test('should handle duplicate parts', () => {
    const hash1 = createSimpleHash(['test', 'test', 'test']);
    const hash2 = createSimpleHash(['test']);

    expect(hash1).not.toBe(hash2);
  });

  test('should be deterministic across multiple calls', () => {
    const parts = ['consistent', 'test', 'data'];
    const results = Array.from({ length: 100 }, () => createSimpleHash(parts));

    const unique = new Set(results);
    expect(unique.size).toBe(1);
  });

  test('should handle whitespace differences', () => {
    const hash1 = createSimpleHash(['test', 'data']);
    const hash2 = createSimpleHash(['test ', ' data']);
    const hash3 = createSimpleHash([' test', 'data ']);

    expect(hash1).not.toBe(hash2);
    expect(hash2).not.toBe(hash3);
    expect(hash1).not.toBe(hash3);
  });

  test('should handle separator character in input', () => {
    // The function uses \u001F as separator, test when this appears in input
    const result = createSimpleHash(['test\u001Fdata', 'another']);

    expect(result).toHaveLength(8);
    expect(result).toMatch(/^[0-9a-f]{8}$/);
  });

  test('should generate avalanche effect for small changes', () => {
    const hash1 = createSimpleHash(['test']);
    const hash2 = createSimpleHash(['Test']); // Only case difference

    expect(hash1).not.toBe(hash2);

    // Check that many bits changed (avalanche effect)
    const diff = parseInt(hash1, 16) ^ parseInt(hash2, 16);
    const bitChanges = diff.toString(2).split('1').length - 1;

    // With a good hash function, we expect significant bit changes
    expect(bitChanges).toBeGreaterThan(5);
  });

  test('should handle numeric strings differently than numbers', () => {
    const hash1 = createSimpleHash(['123', '456']);
    const hash2 = createSimpleHash(['123456']);

    expect(hash1).not.toBe(hash2);
  });

  test('regression test for known inputs', () => {
    // These are example fixed test cases to catch regressions
    expect(createSimpleHash(['rule1'])).toBe('9aa86e9b');
    expect(createSimpleHash(['rule1', 'rule2'])).toBe('982408de');
    expect(createSimpleHash(['a', 'b', 'c'])).toBe('6721b55c');
  });
});
