/*!
 * Copyright 2025 Cognite AS
 */

import { expect } from 'vitest';
import { type Color, type Box3, type Euler, type Matrix4, type Vector3 } from 'three';
import { type Range1, type Range3 } from '../../../src/architecture';

const EPSILON = 0.0001;

export function expectEqualVector3(
  actual: Vector3 | undefined,
  expected: Vector3 | undefined
): void {
  const equals = equalsVector3(actual, expected); // Just to see the difference
  if (!equals) {
    expect(actual).toStrictEqual(expected);
  } else {
    expect(equals).toBe(true);
  }
}

export function expectEqualColor(actual: Color | undefined, expected: Color | undefined): void {
  const equals = equalsColor(actual, expected);
  if (!equals) {
    expect(actual).toStrictEqual(expected); // Just to see the difference
  } else {
    expect(equals).toBe(true);
  }
}
export function expectEqualEuler(actual: Euler, expected: Euler): void {
  const equals = equalsEuler(actual, expected);
  if (!equals) {
    expect(actual).toStrictEqual(expected); // Just to see the difference
  } else {
    expect(equals).toBe(true);
  }
}

export function expectEqualBox3(actual: Box3, expected: Box3): void {
  expectEqualVector3(actual.min, expected.min);
  expectEqualVector3(actual.max, expected.max);
}

export function expectEqualRange2(actual: Range3, expected: Range3): void {
  expectEqualRange1(actual.x, expected.x);
  expectEqualRange1(actual.y, expected.y);
}

export function expectEqualRange3(actual: Range3, expected: Range3): void {
  expectEqualRange1(actual.x, expected.x);
  expectEqualRange1(actual.y, expected.y);
  expectEqualRange1(actual.z, expected.z);
}

export function expectEqualRange1(actual: Range1, expected: Range1): void {
  const equals = equalsRange1(actual, expected);
  if (!equals) {
    expect(actual).toStrictEqual(expected);
  } else {
    expect(equals).toBe(true);
  }
}

export function expectEqualMatrix4(actual: Matrix4, expected: Matrix4): void {
  expect(equalsMatrix4(actual, expected)).toBe(true);
}

export function equalsVector3(
  a: Vector3 | undefined,
  b: Vector3 | undefined,
  epsilon = EPSILON
): boolean {
  if (a === undefined && b === undefined) {
    return true;
  }
  if (a === undefined || b === undefined) {
    return false;
  }
  for (let i = 0; i < 3; i++) {
    if (!almostEquals(a.getComponent(i), b.getComponent(i), epsilon)) {
      return false;
    }
  }
  return true;
}

export function equalsColor(
  a: Color | undefined,
  b: Color | undefined,
  epsilon = EPSILON
): boolean {
  if (a === undefined && b === undefined) {
    return true;
  }
  if (a === undefined || b === undefined) {
    return false;
  }
  if (!almostEquals(a.r, b.r, epsilon)) {
    return false;
  }
  if (!almostEquals(a.g, b.g, epsilon)) {
    return false;
  }
  if (!almostEquals(a.b, b.b, epsilon)) {
    return false;
  }
  return true;
}

export function equalsEuler(a: Euler, b: Euler, epsilon = EPSILON): boolean {
  if (!almostEquals(a.x, b.x, epsilon)) {
    return false;
  }
  if (!almostEquals(a.y, b.y, epsilon)) {
    return false;
  }
  if (!almostEquals(a.z, b.z, epsilon)) {
    return false;
  }
  if (a.order !== b.order) {
    return false;
  }
  return true;
}

export function equalsRange1(a: Range1, b: Range1, epsilon = EPSILON): boolean {
  if (a.isEmpty && b.isEmpty) {
    return true;
  }
  if (a.isEmpty !== b.isEmpty) {
    return false;
  }
  if (!almostEquals(a.min, b.min, epsilon)) {
    return false;
  }
  if (!almostEquals(a.max, b.max, epsilon)) {
    return false;
  }
  return true;
}

export function equalsMatrix4(a: Matrix4, b: Matrix4, epsilon = EPSILON): boolean {
  for (let i = 0; i < 16; i++) {
    if (!almostEquals(a.elements[i], b.elements[i], epsilon)) {
      return false;
    }
  }
  return true;
}

export function almostEquals(a: number, b: number, epsilon = EPSILON): boolean {
  return Math.abs(a - b) <= epsilon;
}
