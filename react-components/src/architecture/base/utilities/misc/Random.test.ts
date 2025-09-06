import { beforeEach, describe, expect, test } from 'vitest';
import { Random } from './Random';
import { isInteger } from '../extensions/mathUtils';
import { Box3, Vector3 } from 'three';
import { Range1 } from '../geometry/Range1';

describe(Random.name, () => {
  const random = new Random();
  beforeEach(() => {
    random.seed = 42;
  });

  test('should get a random integer numbers', () => {
    expect(isInteger(random.getRandomInt())).toBe(true);
    expect(isInteger(random.getRandomInt())).toBe(true);
  });

  test('should get a random integer numbers less than max', () => {
    const exclusiveMax = 10;
    for (let i = 0; i < 10; i++) {
      const value = random.getRandomIntByMax(exclusiveMax);
      expect(isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(exclusiveMax);
    }
  });

  test('should get a random integers between min and max', () => {
    const range = new Range1(10, 100);
    for (let i = 0; i < 10; i++) {
      const value = random.intBetween(range.min, range.max);
      expect(isInteger(value)).toBe(true);
      expect(range.isInside(value)).toBe(true);
    }
  });

  test('should get a random floats between min and max', () => {
    const range = new Range1(10, 100);
    for (let i = 0; i < 10; i++) {
      const value = random.floatBetween(range.min, range.max);
      expect(isInteger(value)).toBe(false);
      expect(range.isInside(value)).toBe(true);
    }
  });

  test('should get random numbers from gaussian distribution', () => {
    const expectedMean = -23;
    const expectedStdDev = 2;
    const n = 100;
    let sum = 0;
    let sumSquared = 0;
    for (let i = 0; i < n; i++) {
      const value = random.getGaussian(expectedMean, expectedStdDev);
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

  test('should get different random unit vectors', () => {
    const unique = new Set<Vector3>();
    for (let i = 0; i < 10; i++) {
      const value = random.getUnitVector();
      expect(value.length()).toBeCloseTo(1);
      expect(unique.has(value)).toBe(false);
      unique.add(value);
    }
  });

  test('should get different random points', () => {
    const unique = new Set<Vector3>();
    const range = new Range1(10, 100);
    for (let i = 0; i < 10; i++) {
      const value = random.getPoint(range.min, range.min);
      expect(range.isInside(value.x)).toBe(true);
      expect(range.isInside(value.y)).toBe(true);
      expect(range.isInside(value.z)).toBe(true);
      expect(unique.has(value)).toBe(false);
      unique.add(value);
    }
  });

  test('should get different random points inside a box', () => {
    const unique = new Set<Vector3>();
    const boundingBox = new Box3(new Vector3(0, 1, 2), new Vector3(3, 4, 5));
    for (let i = 0; i < 10; i++) {
      const value = random.getPointInsideBox(boundingBox);
      expect(boundingBox.containsPoint(value)).toBe(true);
      expect(unique.has(value)).toBe(false);
      unique.add(value);
    }
  });
});
