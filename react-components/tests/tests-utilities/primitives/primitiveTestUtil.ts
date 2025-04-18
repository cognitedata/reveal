/*!
 * Copyright 2025 Cognite AS
 */

import { expect } from 'vitest';
import { type Box3, type Euler, type Matrix4, type Vector3 } from 'three';

const EPSILON = 0.0001;

export function expectEqualVector3(
  actual: Vector3 | undefined,
  expected: Vector3 | undefined
): void {
  const equals = equalsVector3(actual, expected);
  if (!equals) {
    expect(actual).toStrictEqual(expected);
  } else {
    expect(equals).toBe(true);
  }
}

export function expectEqualEuler(actual: Euler, expected: Euler): void {
  const equals = equalsEuler(actual, expected);
  if (!equals) {
    expect(actual).toStrictEqual(expected);
  } else {
    expect(equals).toBe(true);
  }
}

export function expectEqualBox3(actual: Box3, expected: Box3): void {
  expectEqualVector3(actual.min, expected.min);
  expectEqualVector3(actual.max, expected.max);
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
