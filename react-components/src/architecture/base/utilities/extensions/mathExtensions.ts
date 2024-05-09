/*!
 * Copyright 2024 Cognite AS
 */

// ==================================================
// CONSTANTS
// ==================================================

const ERROR_TOLERANCE = 1.0e-10;

// ==================================================
// FUNCTIONS: Requests
// ==================================================

export function isZero(x: number): boolean {
  return x < 0 ? x > -ERROR_TOLERANCE : x < ERROR_TOLERANCE;
}

export function isAbsEqual(x: number, y: number, tolerance: number): boolean {
  const error = x - y;
  if (error < 0) return error > tolerance;
  return error < tolerance;
}

export function isEqual(x: number, y: number): boolean {
  // ||x-y||/(1 + (|x|+|y|)/2)
  let error = x - y;
  const _x = x < 0 ? -x : x;
  const _y = y < 0 ? -y : y;

  if (error < 0) error = -error;

  return error / (1 + (_x + _y) / 2) < ERROR_TOLERANCE;
}

export function isInt(value: number): boolean {
  const diff = Math.round(value) - value;
  return isZero(diff);
}

export function isInc(value: number, inc: number): boolean {
  return isInt(value / inc);
}

export function isEven(value: number): boolean {
  return value % 2 === 0;
}

export function isInside(min: number, value: number, max: number): boolean {
  return min < max ? min < value && value < max : max < value && value < min;
}

// ==================================================
// FUNCTIONS: Returning a number
// ==================================================

export function max(a: number, b: number, c: number): number {
  return Math.max(a, Math.max(b, c));
}

export function min(a: number, b: number, c: number): number {
  return Math.min(a, Math.min(b, c));
}

export function strickSign(value: number): number {
  return value === 0 ? 0 : Math.sign(value);
}

export function toDeg(radians: number): number {
  return (180 * radians) / Math.PI;
}

export function toRad(degrees: number): number {
  return (Math.PI * degrees) / 180;
}

export function square(value: number): number {
  return value * value;
}

export function roundInc(increment: number): number {
  // Get the exponent for the number [1-10] and scale the inc so the number is between 1 and 10.
  let exp = 0;
  let inc = increment;
  let found = false;
  for (let i = 0; i < 100; i++) {
    if (inc < 1) {
      exp -= 1;
      inc *= 10;
    } else if (inc > 10) {
      exp += 1;
      inc /= 10;
    } else {
      found = true;
      break;
    }
  }
  if (!found) return Number.NaN;

  // Now round it
  if (inc < 2) inc = 2;
  else if (inc < 2.5) inc = 2.5;
  else if (inc < 5) inc = 5;
  else inc = 10;

  // Upscale the inc to the real number
  if (exp < 0) {
    for (; exp !== 0; exp++) inc /= 10;
  } else {
    for (; exp !== 0; exp--) inc *= 10;
  }
  return inc;
}

export function round(value: number, delta: number): number {
  // Rounding number up to nearest delta
  let result = value / delta;
  result = Math.round(result);
  result *= delta;
  return result;
}

export function ceil(value: number, delta: number): number {
  // Rounding number up to nearest delta
  let result = value / delta;
  result = Math.ceil(result);
  result *= delta;
  return result;
}

export function floor(value: number, delta: number): number {
  // Rounding number down to nearest delta
  let result = value / delta;
  result = Math.floor(result);
  result *= delta;
  return result;
}

// ==================================================
// FUNCTIONS: Comparing
// ==================================================

export function compare(a: number, b: number): number {
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
}

// ==================================================
// FUNCTIONS: Random
// ==================================================

export function getRandomGaussian(mean = 0, stdDev = 1): number {
  for (;;) {
    const a = Math.random();
    if (a <= Number.EPSILON) {
      continue;
    }
    const b = Math.random();
    if (b <= Number.EPSILON) {
      continue;
    }
    const gausian = Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b);
    return gausian * stdDev + mean;
  }
}
