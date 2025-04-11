import { describe, expect, test } from 'vitest';
import { getNextColor, getNextColorByIndex } from './getNextColor';

describe('colorExtensions', () => {
  describe(getNextColor.name, () => {
    test('should different', () => {
      let prevColor = getNextColor();
      for (let i = 0; i < 20; i++) {
        const color = getNextColor();
        expect(prevColor.equals(color)).toBe(false);
        prevColor = color;
      }
    });
  });
  describe(getNextColorByIndex.name, () => {
    test('should different', () => {
      let prevColor = getNextColorByIndex(0);
      for (let i = 0; i < 20; i++) {
        const color = getNextColorByIndex(i + 1);
        expect(prevColor.equals(color)).toBe(false);
        prevColor = color;
      }
    });
  });
});
