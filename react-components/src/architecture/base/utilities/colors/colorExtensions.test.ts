import { Color } from 'three';
import { describe, expect, test } from 'vitest';
import {
  BLACK_COLOR,
  WHITE_COLOR,
  GREY_COLOR,
  convertToComplementary,
  fractionToByte,
  getColorFromBytes,
  getComplementary,
  getGammaCorrectedColor,
  getHslMixedColor,
  getMixedColor,
  isGreyScale
} from './colorExtensions';
import { expectEqualColor } from '#test-utils/primitives/primitiveTestUtil';

const RED_COLOR = new Color(1, 0, 0);
const BLUE_COLOR = new Color(0, 0, 1);
const CYAN_COLOR = new Color(0, 1, 1);

describe('colorExtensions', () => {
  describe(isGreyScale.name, () => {
    test('should be grayscale', () => {
      expect(isGreyScale(WHITE_COLOR)).toBe(true);
      expect(isGreyScale(BLACK_COLOR)).toBe(true);
      expect(isGreyScale(GREY_COLOR)).toBe(true);
    });

    test('should not be grayscale', () => {
      expect(isGreyScale(RED_COLOR)).toBe(false);
      expect(isGreyScale(BLUE_COLOR)).toBe(false);
      expect(isGreyScale(CYAN_COLOR)).toBe(false);
    });
  });

  describe(getMixedColor.name, () => {
    test('should mix colors equally', () => {
      const actual = getMixedColor(RED_COLOR, BLUE_COLOR);
      expectEqualColor(actual, new Color(0.5, 0, 0.5));
    });

    test('should mix colors by fraction', () => {
      const actual = getMixedColor(RED_COLOR, BLUE_COLOR, 0.1);
      expectEqualColor(actual, new Color(0.1, 0, 0.9));
    });
  });

  describe(getHslMixedColor.name, () => {
    test('should mix colors equally (long way around color wheel)', () => {
      const actual = getHslMixedColor(RED_COLOR, BLUE_COLOR, 0.5, true);
      expectEqualColor(actual, new Color(0, 1, 0));
    });

    test('should mix colors equally (short way around color wheel)', () => {
      const actual = getHslMixedColor(RED_COLOR, BLUE_COLOR, 0.5, false);
      expectEqualColor(actual, new Color(1, 0, 1));
    });

    test('should mix colors by fraction', () => {
      const actual = getHslMixedColor(RED_COLOR, BLUE_COLOR, 0.1, false);
      expectEqualColor(actual, new Color(0.2, 0, 1));
    });
  });

  describe(getGammaCorrectedColor.name, () => {
    test('should not change color when saturated', () => {
      const actual = getGammaCorrectedColor(WHITE_COLOR);
      expectEqualColor(actual, WHITE_COLOR);
    });

    test('should change color', () => {
      const rgb0 = 0.5;
      const rgb1 = 0.217637640824031;
      const actual = getGammaCorrectedColor(new Color(rgb0, rgb0, rgb0));
      expectEqualColor(actual, new Color(rgb1, rgb1, rgb1));
    });
  });
  describe(convertToComplementary.name, () => {
    test('should not change color from white to black', () => {
      const color = WHITE_COLOR.clone();
      convertToComplementary(color);
      expectEqualColor(color, BLACK_COLOR);
    });

    test('should not change color from red to cyan', () => {
      const color = RED_COLOR.clone();
      convertToComplementary(color);
      expectEqualColor(color, CYAN_COLOR);
    });
  });
  describe(getComplementary.name, () => {
    test('should not change color from white to black', () => {
      const color = getComplementary(WHITE_COLOR);
      expectEqualColor(color, BLACK_COLOR);
    });

    test('should not change color from red to cyan', () => {
      const color = getComplementary(RED_COLOR);
      expectEqualColor(color, CYAN_COLOR);
    });
  });

  describe(fractionToByte.name + ' and ' + getColorFromBytes.name, () => {
    test('should convert color to bytes and back again', () => {
      for (let red = 0; red <= 1; red += 0.1) {
        const expected = new Color(red, red / 2, red / 3); // Just made them different
        const r = fractionToByte(expected.r);
        const g = fractionToByte(expected.g);
        const b = fractionToByte(expected.b);
        const actual = getColorFromBytes(r, g, b);
        expectEqualColor(actual, expected);
      }
    });
  });
});
