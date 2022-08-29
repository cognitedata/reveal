/*!
 * Copyright 2022 Cognite AS
 */

import init, { assign_points } from './pkg/pointclouds_wasm';
import wasm from './pkg/pointclouds_wasm_bg.wasm';

import { AABB, Vec3 } from '../src/styling/shapes/linalg';

function getWasmInitPromise(): Promise<void> {
  return typeof init === 'function' ? (init as (buffer: any) => Promise<any>)(wasm).then(() => {}) : Promise.resolve();
}

// Sadly, I was unable to generate these types automatically with wasm-bindgen
export type WasmCylinder = {
  center_a: Vec3;
  center_b: Vec3;
  radius: number;
};

export type WasmOrientedBox = {
  inv_instance_matrix: number[];
};

export type WasmShape = {
  object_id: number;
  cylinder?: WasmCylinder | undefined;
  oriented_box?: WasmOrientedBox | undefined;
};

export async function assignPoints(
  input_shapes: Array<WasmShape>,
  input_points: Float32Array,
  input_bounding_box: AABB,
  input_point_offset: Vec3
): Promise<Uint16Array> {
  const wasm_init = getWasmInitPromise();
  return wasm_init.then(() =>
    assign_points(input_shapes, input_points, input_bounding_box, new Float64Array(input_point_offset))
  );
}
