/*!
 * Copyright 2021 Cognite AS
 */

/**
 * General typed array.
 *
 * Note that this doesn't include BigInt64Array and BigUint64Array as
 * the type of these is not number which causes some type interference problems.
 */
export type TypedArray<ArrayType extends ArrayBufferLike = ArrayBufferLike> =
  | Int8Array<ArrayType>
  | Uint8Array<ArrayType>
  | Int16Array<ArrayType>
  | Uint16Array<ArrayType>
  | Int32Array<ArrayType>
  | Uint32Array<ArrayType>
  | Uint8ClampedArray<ArrayType>
  | Float32Array<ArrayType>
  | Float64Array<ArrayType>;

export type TypedArrayConstructor = (new (
  buffer: ArrayBuffer,
  byteOffset?: number,
  elementCount?: number
) => TypedArray<ArrayBuffer>) &
  (new (array: ArrayBuffer) => TypedArray<ArrayBuffer>) & { BYTES_PER_ELEMENT: number };
