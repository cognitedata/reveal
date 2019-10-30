//=====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming  
// in October 2019. It is suited for flexible and customizable visualization of   
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,   
// based on the experience when building Petrel.  
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//=====================================================================================

import { Index2 } from "./Index2";
import { Grid2 } from "./Grid2";
import { Vector3 } from "./Vector3";
import { Random } from "../PrimitivClasses/Random";
import { Range1 } from "./Range1";
import { Range3 } from "./Range3";

export class RegularGrid2 extends Grid2
{
  //==================================================
  // FIELDS
  //==================================================

  public xOrigin: number;
  public yOrigin: number;
  public inc: number;
  public buffer: Float32Array;

  static readonly _staticHelperA = Vector3.newZero;
  static readonly _staticHleperB = Vector3.newZero;
  static readonly _staticHelperC = Vector3.newZero;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(nodeSize: Index2, xOrigin: number, yOrigin: number, inc: number)
  {
    super(nodeSize);
    this.xOrigin = xOrigin;
    this.yOrigin = yOrigin;
    this.inc = inc;
    this.buffer = new Float32Array(nodeSize.size);
  }

  //==================================================
  // OVERRIDES of object
  //==================================================

  public /*override*/ toString(): string { return `nodeSize: (${this.nodeSize}) origin: (${this.xOrigin}, ${this.yOrigin}) inc: ${this.inc}`; }

  //==================================================
  // INSTANCE METHODS: Requests
  //==================================================

  public isNodeDef(i: number, j: number): boolean
  {
    return !Number.isNaN(this.getZ(i, j));
  }

  public isNodeInsideDef(i: number, j: number): boolean
  {
    return this.isNodeInside(i, j) && this.isNodeDef(i, j);
  }

  //==================================================
  // INSTANCE METHODS; Getters
  //==================================================

  public getNodeIndex(i: number, j: number) { return i + this.nodeSize.i * j; }
  public getX(i: number, j: number): number { return this.xOrigin + this.inc * i; }
  public getY(i: number, j: number): number { return this.yOrigin + this.inc * j; }
  public getZ(i: number, j: number): number
  {
    const index = this.getNodeIndex(i, j);
    return this.buffer[index]
  }

  public getPoint3(i: number, j: number): Vector3
  {
    return new Vector3(this.xOrigin + this.inc * i, this.yOrigin + this.inc * j, this.getZ(i, j));
  }

  public getNormal(i: number, j: number, z?: number): Vector3
  {
    if (!z)
      z = this.getZ(i, j);

    const a = RegularGrid2._staticHelperA;
    const b = RegularGrid2._staticHleperB;
    const sum = RegularGrid2._staticHelperC;

    sum.set(0, 0, 0);

    const def0 = this.isNodeInsideDef(i + 1, j + 0);
    const def1 = this.isNodeInsideDef(i + 0, j + 1);
    const def2 = this.isNodeInsideDef(i - 1, j + 0);
    const def3 = this.isNodeInsideDef(i + 0, j - 1);

    const i0 = def0 ? this.getNodeIndex(i + 1, j + 0) : -1;
    const i1 = def1 ? this.getNodeIndex(i + 0, j + 1) : -1;
    const i2 = def2 ? this.getNodeIndex(i - 1, j + 0) : -1;
    const i3 = def3 ? this.getNodeIndex(i + 0, j - 1) : -1;

    const z0 = def0 ? this.buffer[i0] - z : 0;
    const z1 = def1 ? this.buffer[i1] - z : 0;
    const z2 = def1 ? this.buffer[i2] - z : 0;
    const z3 = def1 ? this.buffer[i3] - z : 0;

    if (def0 && def1)
    {
      a.set(+this.inc, 0, z0);
      b.set(0, +this.inc, z1);
      a.crossProduct(b);
      sum.add(a);
    }
    if (def1 && def2)
    {
      a.set(0, +this.inc, z1);
      b.set(-this.inc, 0, z2);
      a.crossProduct(b);
      sum.add(a);
    }
    if (def2 && def3)
    {
      a.set(-this.inc, 0, z2);
      b.set(0, -this.inc, z3);
      a.crossProduct(b);
      sum.add(a);
    }
    if (def3 && def0)
    {
      a.set(0, -this.inc, z3);
      b.set(+this.inc, 0, z0);
      a.crossProduct(b);
      sum.add(a);
    }
    if (!sum.normalize())
      sum.set(0, 0, 1);
    return sum;
  }

  public getTriplet(i: number, j: number): [number, number, number]
  {
    return [this.xOrigin + this.inc * i, this.yOrigin + this.inc * j, this.getZ(i, j)];
  }

  public getZRange(): Range1
  {
    const range = new Range1();
    for (const z of this.buffer)
      range.add(z);
    return range;
  }

  public getRange(): Range3
  {
    const range = new Range3();
    range.x.set(this.xOrigin, this.xOrigin + this.cellSize.i * this.inc);
    range.y.set(this.yOrigin, this.yOrigin + this.cellSize.j * this.inc);
    range.z = this.getZRange();
    return range;
  }

  //==================================================
  // INSTANCE METHODS: Setters
  //==================================================

  public setNodeUndef(i: number, j: number): void
  {
    this.setZ(i, j, Number.NaN);
  }

  public setZ(i: number, j: number, value: number): void
  {
    const index = this.getNodeIndex(i, j);
    this.buffer[index] = value;
  }

  //==================================================
  // INSTANCE METHODS: Operation
  //==================================================

  public normalizeZ(wantedRange?: Range1): void
  {
    const currentRange = this.getZRange();
    for (let i = this.buffer.length - 1; i >= 0; i--)
    {
      let z = this.buffer[i];
      z = currentRange.getFraction(z);
      if (wantedRange !== undefined)
        z = wantedRange.getValue(z);
      this.buffer[i] = z;
    }
  }

  public smoothSimple(numberOfPasses: number = 1): void
  {
    if (numberOfPasses <= 0)
      return;
    let buffer = new Float32Array(this.nodeSize.size);
    for (let pass = 0; pass < numberOfPasses; pass++)
    {
      for (let i = this.nodeSize.i - 1; i >= 0; i--)
        for (let j = this.nodeSize.j - 1; j >= 0; j--)
        {
          if (!this.isNodeDef(i, j))
            continue;

          const iMin = Math.max(i - 1, 0);
          const iMax = Math.min(i + 1, this.cellSize.i);
          const jMin = Math.max(j - 1, 0);
          const jMax = Math.min(j + 1, this.cellSize.j);

          let count = 0;
          let sum = 0;

          // New value = (Sum the surrunding values + 2 * Current value) / N
          for (let ii = iMin; ii <= iMax; ii++)
            for (let jj = jMin; jj <= jMax; jj++)
            {
              if (ii === i && jj === j)
                continue;

              if (!this.isNodeDef(ii, jj))
                continue;

              sum += this.getZ(ii, jj);
              count++;
            }
          sum += this.getZ(i, j) * count;
          count += count;
          const index = this.getNodeIndex(i, j);
          buffer[index] = sum / count;
        }
      [this.buffer, buffer] = [buffer, this.buffer]; // Swap buffers
    }
  }

  //==================================================
  // STATIC METHODS: 
  //==================================================

  static createFractal(boundingBox: Range3, powerOf2: number, dampning: number = 0.7, smoothNumberOfPasses: number = 0): RegularGrid2
  {
    const stdDev = 1;
    const grid = new RegularGrid2(new Index2(Math.pow(2, powerOf2) + 1), 0, 0, 1);

    const i0 = 0;
    const j0 = 0;
    const i1 = grid.cellSize.i;
    const j1 = grid.cellSize.j;

    grid.setZ(i0, j0, Random.getGaussian(0, stdDev));
    grid.setZ(i1, j0, Random.getGaussian(0, stdDev));
    grid.setZ(i0, j1, Random.getGaussian(0, stdDev));
    grid.setZ(i1, j1, Random.getGaussian(0, stdDev));

    subDivide(grid, i0, j0, i1, j1, stdDev, powerOf2, dampning);

    grid.xOrigin = boundingBox.x.min;
    grid.yOrigin = boundingBox.y.min;
    grid.inc = boundingBox.x.delta / grid.cellSize.i;

    grid.normalizeZ(boundingBox.z);
    grid.smoothSimple(smoothNumberOfPasses);
    return grid;
  }
}

//==================================================
// LOCAL FUNCTIONS: Helpers
//==================================================

function subDivide(grid: RegularGrid2, i0: number, j0: number, i2: number, j2: number, stdDev: number, level: number, dampning: number): void
{
  if (i2 - i0 <= 1 && j2 - j0 <= 1)
    return; // Nothing more to update
  if (i2 - i0 !== j2 - j0)
    throw Error("Logical bug, should be a square");

  stdDev *= dampning;
  let z = 0;
  z += setValueBetween(grid, i0, j0, i2, j0, stdDev);
  z += setValueBetween(grid, i0, j2, i2, j2, stdDev);
  z += setValueBetween(grid, i0, j0, i0, j2, stdDev);
  z += setValueBetween(grid, i2, j0, i2, j2, stdDev);

  setValueBetween(grid, i0, j0, i2, j2, stdDev, z / 4);

  level--;
  if (level === 0)
    return;

  const i1 = Math.trunc((i0 + i2) / 2);
  const j1 = Math.trunc((j0 + j2) / 2);

  subDivide(grid, i0, j0, i1, j1, stdDev, level, dampning);
  subDivide(grid, i0, j1, i1, j2, stdDev, level, dampning);
  subDivide(grid, i1, j0, i2, j1, stdDev, level, dampning);
  subDivide(grid, i1, j1, i2, j2, stdDev, level, dampning);
}

function setValueBetween(grid: RegularGrid2, i0: number, j0: number, i2: number, j2: number, stdDev: number, zMean?: number): number
{
  const i1 = Math.trunc((i0 + i2) / 2);
  const j1 = Math.trunc((j0 + j2) / 2);

  const oldZ = grid.getZ(i1, j1);
  if (oldZ !== 0)
    return oldZ; // Assume already calulated (little bit dirty...)

  if (zMean === undefined)
    zMean = (grid.getZ(i0, j0) + grid.getZ(i2, j2)) / 2;

  const newZ = Random.getGaussian(zMean, stdDev);
  grid.setZ(i1, j1, newZ);
  return newZ;
}
