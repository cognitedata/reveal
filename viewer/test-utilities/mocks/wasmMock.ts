/*!
 * Copyright 2022 Cognite AS
 */

export type WasmSerializedCylinder = {
  center_a: number[];
  center_b: number[];
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

export async function assignPoints(): Promise<Uint16Array<ArrayBuffer>> {
  return new Uint16Array(new ArrayBuffer());
}
