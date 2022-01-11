/*!
 * Copyright 2021 Cognite AS
 */

/**
 * General typed array.
 *
 * Note that this doesn't include BigInt64Array and BigUint64Array as
 * the type of these is not number which causes some type interference problems.
 */
export type TypedArray =
  | Int8Array
  | Uint8Array
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Uint8ClampedArray
  | Float32Array
  | Float64Array;
