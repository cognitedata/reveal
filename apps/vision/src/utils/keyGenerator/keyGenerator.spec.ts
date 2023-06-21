import { keyGenerator } from 'src/utils/keyGenerator/keyGenerator';

describe('Test keyGenerator fn', () => {
  describe('without prefix', () => {
    test('function should generate a key even without a prefix', () => {
      const testKeyGenerator = keyGenerator({});
      expect(testKeyGenerator.next().value).toBe('0');
    });

    test('generated key should start from starting index', () => {
      const testKeyGenerator = keyGenerator({ startingIndex: 8 });
      expect(testKeyGenerator.next().value).toBe('8');
    });
  });

  describe('with prefix', () => {
    test('function should generate a key even without a prefix', () => {
      const testKeyGenerator = keyGenerator({ prefix: 'test-prefix-' });
      expect(testKeyGenerator.next().value).toBe('test-prefix-0');
    });

    test('should return incrementing unique keys', () => {
      const testKeyGenerator = keyGenerator({ prefix: 'test-prefix-' });
      expect(testKeyGenerator.next().value).toBe('test-prefix-0');
      expect(testKeyGenerator.next().value).toBe('test-prefix-1');
      expect(testKeyGenerator.next().value).toBe('test-prefix-2');
      expect(testKeyGenerator.next().value).toBe('test-prefix-3');
    });

    test('generated key should start from starting index', () => {
      const testKeyGenerator = keyGenerator({
        prefix: 'test-prefix-',
        startingIndex: 8,
      });
      expect(testKeyGenerator.next().value).toBe('test-prefix-8');
    });

    test('should return incrementing unique keys starting from startingIndex', () => {
      const testKeyGenerator = keyGenerator({
        prefix: 'test-prefix-',
        startingIndex: 8,
      });
      expect(testKeyGenerator.next().value).toBe('test-prefix-8');
      expect(testKeyGenerator.next().value).toBe('test-prefix-9');
      expect(testKeyGenerator.next().value).toBe('test-prefix-10');
      expect(testKeyGenerator.next().value).toBe('test-prefix-11');
    });
  });
});
