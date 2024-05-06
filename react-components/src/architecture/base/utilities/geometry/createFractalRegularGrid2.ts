/*!
 * Copyright 2024 Cognite AS
 */
import { Vector2 } from 'three';
import { type Range3 } from './Range3';
import { Index2 } from './Index2';
import { getGaussian } from '../extensions/mathExtensions';
import { RegularGrid2 } from './RegularGrid2';

export function createFractalRegularGrid2(
  boundingBox: Range3,
  powerOf2: number = 8,
  dampning: number = 0.7,
  smoothNumberOfPasses: number = 2,
  rotationAngle: number = 0
): RegularGrid2 {
  const origin = new Vector2();
  const inc = new Vector2(1, 1);
  const nodeSize = new Index2(2 ** powerOf2 + 1);
  const stdDev = 1;
  const grid = new RegularGrid2(nodeSize, origin, inc, rotationAngle);

  const i0 = 0;
  const j0 = 0;
  const i1 = grid.cellSize.i;
  const j1 = grid.cellSize.j;

  grid.setZ(i0, j0, getGaussian(0, stdDev));
  grid.setZ(i1, j0, getGaussian(0, stdDev));
  grid.setZ(i0, j1, getGaussian(0, stdDev));
  grid.setZ(i1, j1, getGaussian(0, stdDev));

  subDivide(grid, i0, j0, i1, j1, stdDev, powerOf2, dampning);

  grid.origin.x = boundingBox.x.min;
  grid.origin.y = boundingBox.y.min;
  grid.inc.x = boundingBox.x.delta / grid.cellSize.i;
  grid.inc.y = boundingBox.y.delta / grid.cellSize.j;

  grid.normalizeZ(boundingBox.z);
  grid.smoothSimple(smoothNumberOfPasses);
  return grid;
}

// ==================================================
// LOCAL FUNCTIONS: Helpers
// ==================================================

function setValueBetween(
  grid: RegularGrid2,
  i0: number,
  j0: number,
  i2: number,
  j2: number,
  stdDev: number,
  zMean?: number
): number {
  const i1 = Math.trunc((i0 + i2) / 2);
  const j1 = Math.trunc((j0 + j2) / 2);

  const oldZ = grid.getZ(i1, j1);
  if (oldZ !== 0) {
    return oldZ; // Assume already calculated (little bit dirty...)
  }
  if (zMean === undefined) {
    zMean = (grid.getZ(i0, j0) + grid.getZ(i2, j2)) / 2;
  }
  const newZ = getGaussian(zMean, stdDev);
  grid.setZ(i1, j1, newZ);
  return newZ;
}

function subDivide(
  grid: RegularGrid2,
  i0: number,
  j0: number,
  i2: number,
  j2: number,
  stdDev: number,
  level: number,
  dampning: number
): void {
  if (i2 - i0 <= 1 && j2 - j0 <= 1) {
    return; // Nothing more to update
  }
  if (i2 - i0 !== j2 - j0) {
    throw Error('Logical bug, the grid should be a square');
  }
  stdDev *= dampning;
  let z = 0;
  z += setValueBetween(grid, i0, j0, i2, j0, stdDev);
  z += setValueBetween(grid, i0, j2, i2, j2, stdDev);
  z += setValueBetween(grid, i0, j0, i0, j2, stdDev);
  z += setValueBetween(grid, i2, j0, i2, j2, stdDev);

  setValueBetween(grid, i0, j0, i2, j2, stdDev, z / 4);

  level -= 1;
  if (level === 0) {
    return;
  }
  const i1 = Math.trunc((i0 + i2) / 2);
  const j1 = Math.trunc((j0 + j2) / 2);

  subDivide(grid, i0, j0, i1, j1, stdDev, level, dampning);
  subDivide(grid, i0, j1, i1, j2, stdDev, level, dampning);
  subDivide(grid, i1, j0, i2, j1, stdDev, level, dampning);
  subDivide(grid, i1, j1, i2, j2, stdDev, level, dampning);
}
