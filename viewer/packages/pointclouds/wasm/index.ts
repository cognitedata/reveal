/*!
 * Copyright 2022 Cognite AS
 */

import init, { assign_points } from './pkg/pointclouds_wasm';
import wasm from './pkg/pointclouds_wasm_bg.wasm';

import { AABB, Vec3 } from '@reveal/utilities';

function getWasmInitPromise(): Promise<void> {
  return typeof init === 'function' ? (init as (buffer: any) => Promise<any>)(wasm).then(() => {}) : Promise.resolve();
}

// Sadly, I was unable to generate these types automatically with wasm-bindgen,
// see https://github.com/rustwasm/wasm-bindgen/issues/111
export type WasmSerializedCylinder = {
  center_a: Vec3;
  center_b: Vec3;
  radius: number;
};

export type WasmSerializedOrientedBox = {
  inv_instance_matrix: number[];
};

export type WasmSerializedPointCloudObject = {
  object_id: number;
  cylinder?: WasmSerializedCylinder | undefined;
  oriented_box?: WasmSerializedOrientedBox | undefined;
};

export async function assignPoints(
  input_shapes: Array<WasmSerializedPointCloudObject>,
  input_points: Float32Array,
  input_bounding_box: AABB,
  input_point_offset: Vec3
): Promise<Uint16Array<ArrayBuffer>> {
  const wasm_init = getWasmInitPromise();
  return wasm_init.then(
    () =>
      assign_points(
        input_shapes,
        input_points,
        input_bounding_box,
        new Float64Array(input_point_offset)
      ) as Uint16Array<ArrayBuffer>
  );
}
