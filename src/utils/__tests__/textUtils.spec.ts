import { isSensitiveAnnotationLabel } from 'src/utils/textUtils';

describe('test text utils', () => {
  describe('test isSensitiveText', () => {
    test('should return true for sensitive text', () => {
      expect(isSensitiveAnnotationLabel('human')).toBe(true);
      expect(isSensitiveAnnotationLabel('person')).toBe(true);
    });
    test('should return true for sensitive text when uppercase symbols are available', () => {
      expect(isSensitiveAnnotationLabel('PerSon')).toBe(true);
      expect(isSensitiveAnnotationLabel('HUMAN')).toBe(true);
    });
    test('should return true for sensitive text when leading and trailing whitespaces are available', () => {
      expect(isSensitiveAnnotationLabel(' person')).toBe(true);
      expect(isSensitiveAnnotationLabel(' HUMAN ')).toBe(true);
    });
    test('should return false for empty text', () => {
      expect(isSensitiveAnnotationLabel('')).toBe(false);
      expect(isSensitiveAnnotationLabel('  ')).toBe(false);
      expect(isSensitiveAnnotationLabel(undefined)).toBe(false);
    });
    test('should return false for non sensitive text', () => {
      expect(isSensitiveAnnotationLabel('mom')).toBe(false);
      expect(isSensitiveAnnotationLabel('dog')).toBe(false);
      expect(isSensitiveAnnotationLabel('persona')).toBe(false);
    });
  });
});
