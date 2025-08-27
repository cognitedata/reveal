import { describe, expect, test } from 'vitest';
import { getNextColor, getNextColorByIndex, NUMBER_OF_UNIQUE_COLORS } from './getNextColor';
import { type Color } from 'three';

describe('getNextColor', () => {
  describe(getNextColor.name, () => {
    test('should different', () => {
      const uniqueColors = new Set<number>();
      for (let i = 0; i < NUMBER_OF_UNIQUE_COLORS; i++) {
        const colorHex = getNextColor().getHex();
        expect(uniqueColors.has(colorHex)).toBe(false);
        uniqueColors.add(colorHex);
      }
      expect(uniqueColors.size).toBe(NUMBER_OF_UNIQUE_COLORS);
    });
    test('should have legal colors', () => {
      for (let i = 0; i < 20; i++) {
        checkIfLegal(getNextColor());
      }
    });
  });
  describe(getNextColorByIndex.name, () => {
    test('should different', () => {
      const uniqueColors = new Set<number>();
      for (let i = 0; i < NUMBER_OF_UNIQUE_COLORS; i++) {
        const colorHex = getNextColorByIndex(i + 1).getHex();
        expect(uniqueColors.has(colorHex)).toBe(false);
        uniqueColors.add(colorHex);
      }
      expect(uniqueColors.size).toBe(NUMBER_OF_UNIQUE_COLORS);
    });
    test('should have legal colors', () => {
      for (let i = 0; i < NUMBER_OF_UNIQUE_COLORS; i++) {
        checkIfLegal(getNextColorByIndex(i));
      }
    });
  });
});

function checkIfLegal(color: Color): void {
  expect(color.r).lessThanOrEqual(1);
  expect(color.r).greaterThanOrEqual(0);
  expect(color.g).lessThanOrEqual(1);
  expect(color.g).greaterThanOrEqual(0);
  expect(color.b).lessThanOrEqual(1);
  expect(color.b).greaterThanOrEqual(0);
}
