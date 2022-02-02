//= ====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//= ====================================================================================

export class Ma {
  //= =================================================
  // CONSTANT FIELDS
  //= =================================================

  public static errorTolerance = 1.0e-10;

  //= =================================================
  // STATIC METHODS: Returning boolean
  //= =================================================

  public static isZero(x: number): boolean {
    return x < 0 ? x > -Ma.errorTolerance : x < Ma.errorTolerance;
  }

  public static isAbsEqual(x: number, y: number, tolerance: number): boolean {
    const error = x - y;
    if (error < 0) return error > tolerance;
    return error < tolerance;
  }

  public static isEqual(x: number, y: number): boolean {
    // ||x-y||/(1 + (|x|+|y|)/2)
    let error = x - y;
    const _x = x < 0 ? -x : x;
    const _y = y < 0 ? -y : y;

    if (error < 0) error = -error;

    return error / (1 + (_x + _y) / 2) < this.errorTolerance;
  }

  public static isInt(value: number): boolean {
    const diff = Math.round(value) - value;
    return Ma.isZero(diff);
  }

  public static isInc(value: number, inc: number): boolean {
    return Ma.isInt(value / inc);
  }

  public static isInside(min: number, value: number, max: number): boolean {
    return min < max ? min < value && value < max : max < value && value < min;
  }

  //= =================================================
  // STATIC METHODS: Returning a number
  //= =================================================

  public static max(a: number, b: number, c: number): number {
    return Math.max(a, Math.max(b, c));
  }

  public static min(a: number, b: number, c: number): number {
    return Math.min(a, Math.min(b, c));
  }

  public static strickSign(value: number): number {
    return value === 0 ? 0 : Math.sign(value);
  }

  public static toDeg(radians: number): number {
    return (180 * radians) / Math.PI;
  }

  public static toRad(degrees: number): number {
    return (Math.PI * degrees) / 180;
  }

  public static square(value: number): number {
    return value * value;
  }

  public static roundInc(increment: number): number {
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

  public static ceil(value: number, delta: number): number {
    // Rounding number up to nearest delta
    let result = value / delta;

    result = Math.ceil(result);
    result *= delta;

    return result;
  }

  public static floor(value: number, delta: number): number {
    // Rounding number down to nearest delta
    let result = value / delta;

    result = Math.floor(result);
    result *= delta;

    return result;
  }

  //= =================================================
  // STATIC METHODS: Comparing
  //= =================================================

  public static compare(a: number, b: number): number {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  }

  //= =================================================
  // STATIC METHODS: Search
  //= =================================================

  public static binarySearch<T>(
    array: T[],
    element: T,
    compare: Function
  ): number {
    let minIndex = 0;
    let maxIndex = array.length - 1;
    while (minIndex <= maxIndex) {
      const k = (maxIndex + minIndex) >> 1;
      const result = compare(element, array[k]);
      if (result > 0) minIndex = k + 1;
      else if (result < 0) maxIndex = k - 1;
      else return k;
    }
    return -minIndex - 1;
  }
}
