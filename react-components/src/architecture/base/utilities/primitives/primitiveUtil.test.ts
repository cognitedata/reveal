/*!
 * Copyright 2025 Cognite AS
 */

import { expect } from 'vitest';
import { type Box3, type Euler, type Matrix4, type Vector3 } from 'three';

const EPSILON = 0.0001;

export function expectEqualVector3(a: Vector3 | undefined, b: Vector3 | undefined): void {
  const equals = equalsVector3(a, b);
  if (!equals) {
    expect(a).toStrictEqual(b);
  } else {
    expect(equals).toBe(true);
  }
}

export function expectEqualEuler(a: Euler, b: Euler): void {
  const equals = equalsEuler(a, b);
  if (!equals) {
    expect(a).toStrictEqual(b);
  } else {
    expect(equals).toBe(true);
  }
}

export function expectEqualBox3(a: Box3, b: Box3): void {
  expect(equalsVector3(a.min, b.min)).toBe(true);
  expect(equalsVector3(a.max, b.max)).toBe(true);
}

export function expectEqualMatrix4(a: Matrix4, b: Matrix4): void {
  expect(equalsMatrix4(a, b)).toBe(true);
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
  if (a === undefined && b === undefined) {
    return true;
  }
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
