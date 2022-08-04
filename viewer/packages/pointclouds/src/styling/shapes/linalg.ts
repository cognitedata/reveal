/*!
 * Copyright 2022 Cognite AS
 */

export type Vec3 = [number, number, number];
export type Vec3WithIndex = [number, number, number, number];
export type AABB = { min: Vec3; max: Vec3 };
export type Mat4 = {
  data: number[];
};
