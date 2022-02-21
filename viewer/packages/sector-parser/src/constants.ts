/*!
 * Copyright 2022 Cognite AS
 */
import { TypedArrayConstructor } from '@reveal/utilities';

export const COLLECTION_TYPE_SIZES = new Map<string, number>([
  ['SCALAR', 1],
  ['VEC2', 2],
  ['VEC3', 3],
  ['VEC4', 4],
  ['MAT2', 4],
  ['MAT3', 9],
  ['MAT4', 16]
]);

// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessorcomponenttype-white_check_mark
export const DATA_TYPE_BYTE_SIZES = new Map<number, TypedArrayConstructor>([
  [5120, Int8Array],
  [5121, Uint8Array],
  [5122, Int16Array],
  [5123, Uint16Array],
  [5125, Uint32Array],
  [5126, Float32Array]
]);
