import { describe, expect, test } from 'vitest';
import { getNextColor, getNextColorByIndex } from './getNextColor';
import { type Color } from 'three';

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
    test('should have legal colors', () => {
      for (let i = 0; i < 20; i++) {
        checkIfLegal(getNextColor());
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
    test('should have legal colors', () => {
      for (let i = 0; i < 20; i++) {
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
