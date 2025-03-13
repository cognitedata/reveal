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

export function isEqual(x: number, y: number): boolean {
  return isRelativeEqual(x, y, ERROR_TOLERANCE);
}

export function isAbsEqual(x: number, y: number, tolerance: number): boolean {
  return Math.abs(x - y) < tolerance;
}

export function isRelativeEqual(x: number, y: number, tolerance: number): boolean {
  // Error = ||x-y||/(1 + (|x|+|y|)/2)
  let error = x - y;
  const absX = x < 0 ? -x : x;
  const absY = y < 0 ? -y : y;

  if (error < 0) {
    error = -error;
  }
  return error / (1 + (absX + absY) / 2) < tolerance;
}

export function isInteger(value: number): boolean {
  const diff = Math.round(value) - value;
  return isZero(diff);
}

export function isIncrement(value: number, increment: number): boolean {
  if (increment === 0) {
    return false;
  }
  return isInteger(value / increment);
}

export function isOdd(value: number): boolean {
  return value % 2 !== 0;
}

export function isEven(value: number): boolean {
  return value % 2 === 0;
}

export function isBetween(min: number, value: number, max: number): boolean {
  return min < max ? min < value && value < max : max < value && value < min;
}

// ==================================================
// FUNCTIONS: Returning a number
// ==================================================

export function square(value: number): number {
  return value * value;
}

/**
 * Round a number closest to one of these values:  2*10^N, 2.5*10^N, 5*10^N or 10*10^N.
 * This is used to give axes a natural increment between the ticks or
 * contour intervals on a terrain surface
 * @param increment - The value to be rounded
 * @returns The rounded value
 */
export function roundIncrement(increment: number): number {
  // First get the exponent for the number [1-10] and scale the inc so the number is between 1 and 10.
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
  if (!found) {
    return Number.NaN;
  }
  // Now round it
  if (inc < 2) {
    inc = 2;
  } else if (inc < 2.5) {
    inc = 2.5;
  } else if (inc < 5) {
    inc = 5;
  } else {
    inc = 10;
  }
  // Upscale the increment to the real number
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

export function forceBetween0AndTwoPi(value: number): number {
  // Force the angle to be between 0 and 2*PI
  while (value < 0) {
    value += 2 * Math.PI;
  }
  while (value >= 2 * Math.PI) {
    value -= 2 * Math.PI;
  }
  return value;
}

export function forceBetween0AndPi(value: number): number {
  // Force the angle to be between 0 and PI
  while (value < 0) {
    value += Math.PI;
  }
  while (value >= Math.PI) {
    value -= Math.PI;
  }
  return value;
}

export function forceAngleAround0(value: number): number {
  // Force the angle to be between -PI and PI
  while (value < -Math.PI) {
    value += 2 * Math.PI;
  }
  while (value >= Math.PI) {
    value -= 2 * Math.PI;
  }
  return value;
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

export function getRandomInt(): number {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

export function getRandomIntByMax(exclusiveMax: number): number {
  return Math.floor(Math.random() * exclusiveMax);
}

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
    const gaussian = Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b);
    return gaussian * stdDev + mean;
  }
}
