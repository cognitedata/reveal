/*!
 * Copyright 2022 Cognite AS
 */

import init, { assign_points } from './pkg/pointclouds_wasm';
import wasm from './pkg/pointclouds_wasm_bg.wasm';

function getWasmInitPromise(): Promise<void> {
  return typeof init === 'function' ? (init as (buffer: any) => Promise<any>)(wasm).then(() => {}) : Promise.resolve();
}

export async function assignPoints(input_shapes: Array<any>, input_points: Float32Array, input_bounding_box: object, input_point_offset: Array<any>): Promise<Uint16Array> {
  const wasm_init = getWasmInitPromise();
  return wasm_init.then(() => assign_points(input_shapes, input_points, input_bounding_box, input_point_offset));
}
