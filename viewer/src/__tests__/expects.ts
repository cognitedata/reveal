/*!
 * Copyright 2020 Cognite AS
 */

import 'jest-extended';
import { WantedSector } from '@/dataModels/cad/internal/sector/WantedSector';
import { LevelOfDetail } from '@/dataModels/cad/internal/sector/LevelOfDetail';

interface Matrix4 {
  elements: Float32Array;
}

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface Color {
  r: number;
  g: number;
  b: number;
}

interface BoundingBox {
  min: Vector3;
  max: Vector3;
}

export function expectVector3Equal(a: Vector3, b: Vector3) {
  expect(a.x).toBeCloseTo(b.x);
  expect(a.y).toBeCloseTo(b.y);
  expect(a.z).toBeCloseTo(b.z);
}

export function expectMatrix4Equal(a: Matrix4, b: Matrix4) {
  for (let i = 0; i < 16; i++) {
    expect(a.elements[i]).toBeCloseTo(b.elements[i]);
  }
}

export function expectVector3Valid(a: Vector3) {
  expect(a.x).toBeDefined();
  expect(a.y).toBeDefined();
  expect(a.z).toBeDefined();
}

export function expectColorEqual(a: Color, b: Color) {
  expect(a.r).toBeCloseTo(b.r);
  expect(a.g).toBeCloseTo(b.g);
  expect(a.b).toBeCloseTo(b.b);
}

export function expectColorValid(a: Color) {
  expect(a.r).toBeDefined();
  expect(a.g).toBeDefined();
  expect(a.b).toBeDefined();
}

export function expectBoundingBoxEqual(a: BoundingBox, b: BoundingBox) {
  expectVector3Equal(a.min, b.min);
  expectVector3Equal(a.max, b.max);
}

export function expectSetEqual<T>(actual: Set<T>, expected: T[]) {
  expect([...actual]).toIncludeSameMembers(expected);
}

export function expectContainsSectorsWithLevelOfDetail(
  sectors: WantedSector[],
  expectedSimple: number[],
  expectedDetailed: number[]
) {
  for (const id of expectedSimple) {
    expect(sectors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ metadata: expect.objectContaining({ id }), levelOfDetail: LevelOfDetail.Simple })
      ])
    );
  }
  for (const id of expectedDetailed) {
    expect(sectors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ metadata: expect.objectContaining({ id }), levelOfDetail: LevelOfDetail.Detailed })
      ])
    );
  }
}
