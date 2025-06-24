import { describe, expect, test } from 'vitest';
import {
  ceil,
  compare,
  floor,
  forceAngleAround0,
  forceBetween0AndPi,
  forceBetween0AndTwoPi,
  getRandomGaussian,
  getRandomInt,
  getRandomIntByMax,
  isAbsEqual,
  isBetween,
  isEqual,
  isEven,
  isIncrement,
  isInteger,
  isOdd,
  isZero,
  round,
  roundIncrement,
  square
} from './mathExtensions';

describe('MathExtensions', () => {
  describe(isZero.name, () => {
    test('should be zero', () => {
      expect(isZero(0)).toBe(true);
    });
    test('should not be zero', () => {
      expect(isZero(0.0001)).toBe(false);
    });
  });

  describe(isEqual.name, () => {
    test('should be equal', () => {
      expect(isEqual(1, 1)).toBe(true);
      expect(isEqual(0, 0)).toBe(true);
      expect(isEqual(100000, 100000)).toBe(true);
    });
    test('should not be equal', () => {
      expect(isEqual(1, 1.0001)).toBe(false);
      expect(isEqual(0, 0.0001)).toBe(false);
      expect(isEqual(100000, 100000.1)).toBe(false);
    });
  });

  describe(isAbsEqual.name, () => {
    test('should be equal', () => {
      expect(isAbsEqual(1, 1, 0.0001)).toBe(true);
      expect(isAbsEqual(0, 0, 0.0001)).toBe(true);
      expect(isAbsEqual(100000, 100001, 2)).toBe(true);
    });
    test('should not be equal', () => {
      expect(isAbsEqual(1, 1.0002, 0.0001)).toBe(false);
      expect(isAbsEqual(0, 0.0002, 0.0001)).toBe(false);
      expect(isAbsEqual(100000, 100000.2, 0.1)).toBe(false);
    });
  });

  describe(isInteger.name, () => {
    test('should be integer', () => {
      expect(isInteger(0)).toBe(true);
      expect(isInteger(2)).toBe(true);
      expect(isInteger(-2)).toBe(true);
      expect(isInteger(10000)).toBe(true);
    });
    test('should not be integer', () => {
      expect(isInteger(0.0001)).toBe(false);
      expect(isInteger(2.0001)).toBe(false);
      expect(isInteger(-2.9999)).toBe(false);
      expect(isInteger(10000.1)).toBe(false);
    });
  });

  describe(isIncrement.name, () => {
    test('should be increment', () => {
      expect(isIncrement(0, 1)).toBe(true);
      expect(isIncrement(10, 1)).toBe(true);
      expect(isIncrement(2.5, 0.5)).toBe(true);
    });
    test('should not be increment', () => {
      expect(isIncrement(1, 0)).toBe(false);
      expect(isIncrement(0.1, 1)).toBe(false);
      expect(isIncrement(10.1, 1)).toBe(false);
      expect(isIncrement(2.51, 0.5)).toBe(false);
    });
  });

  describe(isOdd.name, () => {
    test('should be odd', () => {
      expect(isOdd(1)).toBe(true);
      expect(isOdd(-101)).toBe(true);
    });
    test('should not odd', () => {
      expect(isOdd(0)).toBe(false);
      expect(isOdd(2)).toBe(false);
      expect(isOdd(-102)).toBe(false);
    });
  });

  describe(isEven.name, () => {
    test('should be even', () => {
      expect(isEven(0)).toBe(true);
      expect(isEven(2)).toBe(true);
      expect(isEven(-102)).toBe(true);
    });
    test('should not even', () => {
      expect(isEven(1)).toBe(false);
      expect(isEven(-101)).toBe(false);
    });
  });

  describe(isBetween.name, () => {
    test('should be between', () => {
      expect(isBetween(0, 0.1, 1)).toBe(true);
    });
    test('should not be between', () => {
      expect(isBetween(0, 2, 1)).toBe(false);
      expect(isBetween(0, 0, 1)).toBe(false);
      expect(isBetween(0, 1, 1)).toBe(false);
    });
  });

  test('should be square', () => {
    expect(square(0)).toBe(0);
    expect(square(2)).toBe(4);
    expect(square(-2)).toBe(4);
  });

  test('should round increment', () => {
    expect(roundIncrement(1.22)).toBe(2);
    expect(roundIncrement(2.22)).toBe(2.5);
    expect(roundIncrement(2.66)).toBe(5);
    expect(roundIncrement(5.1)).toBe(10);

    expect(roundIncrement(12.2)).toBe(20);
    expect(roundIncrement(22.2)).toBe(25);
    expect(roundIncrement(26.6)).toBe(50);
    expect(roundIncrement(51)).toBe(100);

    expect(roundIncrement(0.122)).toBe(0.2);
    expect(roundIncrement(0.222)).toBe(0.25);
    expect(roundIncrement(0.266)).toBe(0.5);
    expect(roundIncrement(0.51)).toBe(1);
  });

  test('should round', () => {
    expect(round(0.22, 2)).toBe(0);
    expect(round(1.22, 1)).toBe(1);
    expect(round(3.22, 2)).toBe(4);
  });

  test('should ceil', () => {
    expect(ceil(0.22, 2)).toBe(2);
    expect(ceil(1.22, 1)).toBe(2);
    expect(ceil(3.22, 2)).toBe(4);
  });

  test('should floor', () => {
    expect(floor(0.22, 2)).toBe(0);
    expect(floor(1.22, 1)).toBe(1);
    expect(floor(3.22, 2)).toBe(2);
  });

  test('should force angles between 0 and 2*Pi', () => {
    expect(forceBetween0AndTwoPi(0)).toBe(0);
    expect(forceBetween0AndTwoPi(Math.PI)).toBe(Math.PI);
    expect(forceBetween0AndTwoPi(-Math.PI)).toBe(Math.PI);
    expect(forceBetween0AndTwoPi(2 * Math.PI)).toBe(0);
    expect(forceBetween0AndTwoPi(3 * Math.PI)).toBe(Math.PI);
  });

  test('should force angles between 0 and Pi', () => {
    expect(forceBetween0AndPi(0)).toBe(0);
    expect(forceBetween0AndPi(Math.PI)).toBe(0);
    expect(forceBetween0AndPi(-Math.PI)).toBe(0);
    expect(forceBetween0AndPi(Math.PI / 2)).toBe(Math.PI / 2);
    expect(forceBetween0AndPi(-Math.PI / 2)).toBe(Math.PI / 2);
    expect(forceBetween0AndPi(2 * Math.PI)).toBe(0);
  });

  test('should force angles between -Pi and Pi', () => {
    expect(forceAngleAround0(0)).toBe(0);
    expect(forceAngleAround0(Math.PI)).toBe(-Math.PI);
    expect(forceAngleAround0(-Math.PI)).toBe(-Math.PI);
    expect(forceAngleAround0(Math.PI / 2)).toBe(Math.PI / 2);
    expect(forceAngleAround0((3 * Math.PI) / 2)).toBe(-Math.PI / 2);
    expect(forceAngleAround0(-Math.PI / 2)).toBe(-Math.PI / 2);
    expect(forceAngleAround0(2 * Math.PI)).toBe(0);
    expect(forceAngleAround0(-2 * Math.PI)).toBe(0);
  });

  test('should compare', () => {
    expect(compare(3, 4)).toBe(-1);
    expect(compare(4, 3)).toBe(1);
    expect(compare(3, 3)).toBe(0);
  });

  test('should get a random integer numbers', () => {
    expect(isInteger(getRandomInt())).toBe(true);
    expect(isInteger(getRandomInt())).toBe(true);
  });

  test('should get a random integer numbers less than max', () => {
    const exclusiveMax = 10;
    for (let i = 0; i < 10; i++) {
      const value = getRandomIntByMax(exclusiveMax);
      expect(isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(exclusiveMax);
    }
  });

  test('should get random numbers from gaussian distribution', () => {
    const expectedMean = -23;
    const expectedStdDev = 2;
    const n = 100;
    let sum = 0;
    let sumSquared = 0;
    for (let i = 0; i < n; i++) {
      const value = getRandomGaussian(expectedMean, expectedStdDev);
      sum += value;
      sumSquared += value * value;
    }
    const actualMean = sum / n;
    const actualStdDev = Math.sqrt((sumSquared - sum * actualMean) / n);

    // give a quite a bit of wiggle room so it never fails
    expect(actualMean).toBeGreaterThan(expectedMean - expectedStdDev);
    expect(actualMean).toBeLessThan(expectedMean + expectedStdDev);
    expect(actualStdDev).toBeGreaterThan(expectedStdDev - 0.5);
    expect(actualStdDev).toBeLessThan(expectedStdDev + 0.5);
  });
});
