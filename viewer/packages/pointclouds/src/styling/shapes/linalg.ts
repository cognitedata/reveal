/*!
 * Copyright 2022 Cognite AS
 */

export type Vec3 = [number, number, number];
export type AABB = { min: Vec3; max: Vec3 };
export type Mat4 = {
  data: number[];
};

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

export function b3ContainsPoint(box: AABB, vec: Vec3): boolean {
  return (
    box.min[0] <= vec[0] &&
    vec[0] < box.max[0] &&
    box.min[1] <= vec[1] &&
    vec[1] < box.max[1] &&
    box.min[2] <= vec[2] &&
    vec[2] < box.max[2]
  );
}

function v3Max(v0: Vec3, v1: Vec3): Vec3 {
  return [Math.max(v0[0], v1[0]), Math.max(v0[1], v1[1]), Math.max(v0[2], v1[2])];
}

function v3Min(v0: Vec3, v1: Vec3): Vec3 {
  return [Math.min(v0[0], v1[0]), Math.min(v0[1], v1[1]), Math.min(v0[2], v1[2])];
}

export function b3Union(b0: AABB, b1: AABB): AABB {
  return { min: v3Min(b0.min, b1.min), max: v3Max(b0.max, b1.max) };
}

export function emptyBox3(): AABB {
  return { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
}

export function createM4(nums: number[]): Mat4 {
  return { data: nums };
}

export function createM4Raw(
  a00: number,
  a01: number,
  a02: number,
  a03: number,
  a10: number,
  a11: number,
  a12: number,
  a13: number,
  a20: number,
  a21: number,
  a22: number,
  a23: number,
  a30: number,
  a31: number,
  a32: number,
  a33: number
): Mat4 {
  return createM4([a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33]);
}

function createM4FromRowsV3(col0: Vec3, col1: Vec3, col2: Vec3): Mat4 {
  return createM4Raw(
    col0[0],
    col0[1],
    col0[2],
    0,
    col1[0],
    col1[1],
    col1[2],
    0,
    col2[0],
    col2[1],
    col2[2],
    0,
    0,
    0,
    0,
    1
  );
}

function mat4Index(row: number, column: number): number {
  return row * 4 + column;
}

export function m4Get(m4: Mat4, row: number, column: number): number {
  return m4.data[mat4Index(row, column)];
}

function m4Set(m4: Mat4, row: number, column: number, value: number): void {
  m4.data[mat4Index(row, column)] = value;
}

export function m4MultiplyV3WithTranslation(m4: Mat4, v3: Vec3): Vec3 {
  return [
    m4Get(m4, 0, 0) * v3[0] + m4Get(m4, 0, 1) * v3[1] + m4Get(m4, 0, 2) * v3[2] + m4Get(m4, 0, 3),
    m4Get(m4, 1, 0) * v3[0] + m4Get(m4, 1, 1) * v3[1] + m4Get(m4, 1, 2) * v3[2] + m4Get(m4, 1, 3),
    m4Get(m4, 2, 0) * v3[0] + m4Get(m4, 2, 1) * v3[1] + m4Get(m4, 2, 2) * v3[2] + m4Get(m4, 2, 3)
  ];
}

function norm(x: number, y: number, z: number): number {
  return Math.sqrt(x * x + y * y + z * z);
}

function m4Multiply(m0: Mat4, m1: Mat4): Mat4 {
  const m2: Mat4 = { data: new Array<number>(16) };

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let c = 0;
      for (let k = 0; k < 4; k++) {
        c += m4Get(m0, i, k) * m4Get(m1, k, j);
      }
      m4Set(m2, i, j, c);
    }
  }

  return m2;
}

function createM4Identity(): Mat4 {
  const res: Mat4 = { data: new Array<number>(16).fill(0) };
  for (let i = 0; i < 16; i++) {
    if (i % 5 == 0) {
      res.data[i] = 1.0;
    }
  }

  return res;
}

function createM4CdfToReveal(): Mat4 {
  const res: Mat4 = { data: new Array<number>(16).fill(0) };
  m4Set(res, 0, 0, 1);
  m4Set(res, 1, 2, 1);
  m4Set(res, 2, 1, -1);
  m4Set(res, 3, 3, 1);
  return res;
}

function createM4Scale(s: Vec3): Mat4 {
  const res: Mat4 = createM4Identity();
  for (let i = 0; i < 3; i++) {
    res.data[mat4Index(i, i)] = s[i];
  }

  return res;
}

function createM4Translation(p: Vec3): Mat4 {
  const res = createM4Identity();
  for (let i = 0; i < 3; i++) {
    m4Set(res, i, 3, p[i]);
  }

  return res;
}

/*
 * NB: Expects matrix to be product of translation, rotation and (non-uniform) scale
 */
function m4Invert4x3(m: Mat4): Mat4 {
  // Norms of cols:
  const sr0 = norm(m4Get(m, 0, 0), m4Get(m, 1, 0), m4Get(m, 2, 0));
  const sr1 = norm(m4Get(m, 0, 1), m4Get(m, 1, 1), m4Get(m, 2, 1));
  const sr2 = norm(m4Get(m, 0, 2), m4Get(m, 1, 2), m4Get(m, 2, 2));

  const normalizedColumn0 = v3Scale([m4Get(m, 0, 0), m4Get(m, 1, 0), m4Get(m, 2, 0)], 1.0 / sr0);
  const normalizedColumn1 = v3Scale([m4Get(m, 0, 1), m4Get(m, 1, 1), m4Get(m, 2, 1)], 1.0 / sr1);
  const normalizedColumn2 = v3Scale([m4Get(m, 0, 2), m4Get(m, 1, 2), m4Get(m, 2, 2)], 1.0 / sr2);

  const invScale: Vec3 = [1.0 / sr0, 1.0 / sr1, 1.0 / sr2];

  const invScaleMatrix = createM4Scale(invScale);

  // Transpose rotation matrix
  const invRotation = createM4FromRowsV3(normalizedColumn0, normalizedColumn1, normalizedColumn2);
  const invTranslation = createM4Translation([-m4Get(m, 0, 3), -m4Get(m, 1, 3), -m4Get(m, 2, 3)]);

  const res = m4Multiply(invScaleMatrix, m4Multiply(invRotation, invTranslation));

  return res;
}

export function createInvertedRevealTransformationFromCdfTransformation(m: Mat4): Mat4 {
  return m4Multiply(m4Invert4x3(m), createM4CdfToReveal());
}
