/*!
 * Copyright 2022 Cognite AS
 */

export type Vec3 = [number, number, number];
export type Box3 = { min: Vec3, max: Vec3 };

export function v3Scale(v: Vec3, f: number): Vec3 {
  return [v[0] * f, v[1] * f, v[2] * f];
}

export function v3Add(v0: Vec3, v1: Vec3): Vec3 {
  return [v0[0] + v1[0], v0[1] + v1[1], v0[2] + v1[2]];
}

export function v3Sub(v0: Vec3, v1: Vec3): Vec3 {
  return v3Add(v0, v3Scale(v1, -1));
}

export function v3Middle(v0: Vec3, v1: Vec3): Vec3 {
  return v3Scale(v3Add(v0, v1), 0.5);
}

export function v3Length(v0: Vec3): number {
  return Math.sqrt(v3Dot(v0, v0));
}

export function v3Normalized(v0: Vec3): Vec3 {
  return v3Scale(v0, 1.0 / v3Length(v0));
}

export function v3Dot(v0: Vec3, v1: Vec3): number {
  return v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2];
}

export function b3ContainsPoint(box: Box3, vec: Vec3): boolean {
  return box.min[0] <= vec[0] && vec[0] < box.max[0]
    && box.min[1] <= vec[1] && vec[1] < box.max[1]
    && box.min[2] <= vec[2] && vec[2] < box.max[2];
}

function v3Max(v0: Vec3, v1: Vec3): Vec3 {
  return [Math.max(v0[0], v1[0]),
          Math.max(v0[1], v1[1]),
          Math.max(v0[2], v1[2])];
}

function v3Min(v0: Vec3, v1: Vec3): Vec3 {
  return [Math.min(v0[0], v1[0]),
          Math.min(v0[1], v1[1]),
          Math.min(v0[2], v1[2])];
}

export function b3Union(b0: Box3, b1: Box3): Box3 {
  return { min: v3Min(b0.min, b1.min), max: v3Max(b0.max, b1.max) };
}

export function emptyBox3(): Box3 {
  return { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
}
