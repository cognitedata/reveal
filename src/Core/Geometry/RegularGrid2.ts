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
import { continueStatement } from "@babel/types";
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

  public getPoint3(i: number, j: number): Vector3
  {
    return new Vector3(this.xOrigin + this.inc * i, this.yOrigin + this.inc * j, this.getZ(i, j));
  }

  public getNormal(i: number, j: number): Vector3
  {
    const sum = Vector3.newZero;
    const z = this.getZ(i, j);
    const a = Vector3.newZero;
    const b = Vector3.newZero;

    const def0 = this.isNodeInsideDef(i + 1, j + 0);
    const def1 = this.isNodeInsideDef(i + 0, j + 1);
    const def2 = this.isNodeInsideDef(i - 1, j + 0);
    const def3 = this.isNodeInsideDef(i + 0, j - 1);

    if (def0 && def1)
    {
      a.set(this.inc, 0, this.getZ(i + 1, j + 0) - z);
      b.set(0, this.inc, this.getZ(i + 0, j + 1) - z);
      a.crossProduct(b);
      sum.add(a);
    }
    if (def1 && def2)
    {
      a.set(0, +this.inc, this.getZ(i + 0, j + 1) - z);
      b.set(-this.inc, 0, this.getZ(i - 1, j + 0) - z);
      a.crossProduct(b);
      sum.add(a);
    }
    if (def1 && def2)
    {
      a.set(0, +this.inc, this.getZ(i + 0, j + 1) - z);
      b.set(-this.inc, 0, this.getZ(i - 1, j + 0) - z);
      a.crossProduct(b);
      sum.add(a);
    }
    if (def2 && def3)
    {
      a.set(-this.inc, 0, this.getZ(i - 1, j + 0) - z);
      b.set(0, -this.inc, this.getZ(i + 0, j - 1) - z);
      a.crossProduct(b);
      sum.add(a);
    }
    if (def3 && def0)
    {
      a.set(0, -this.inc, this.getZ(i + 0, j - 1) - z);
      b.set(+this.inc, 0, this.getZ(i + 1, j + 0) - z);
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

  public getZ(i: number, j: number): number
  {
    const index = this.getNodeIndex(i, j);
    return this.buffer[index]
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
    range.x.set(this.xOrigin, this.xOrigin + (this.nodeSize.i - 1) * this.inc);
    range.y.set(this.yOrigin, this.yOrigin + (this.nodeSize.j - 1) * this.inc);
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

  public normalize(wantedRange?: Range1): void
  {
    const currentRange = this.getZRange();
    for (let i = this.buffer.length - 1; i >= 0; i--)
    {
      let z = this.buffer[i];
      z = (z - currentRange.min) / currentRange.delta;
      if (wantedRange != undefined)
        z = z * wantedRange.delta + wantedRange.min;
      this.buffer[i] = z;
    }
  }

  public smoothSimple(numberOfPasses: number = 1): void
  {
    let buffer = new Float32Array(this.nodeSize.size);
    for (let pass = 0; pass < numberOfPasses; pass++)
    {
      for (let i = this.nodeSize.i - 1; i >= 0; i--)
        for (let j = this.nodeSize.j - 1; j >= 0; j--)
        {
          if (!this.isNodeDef(i, j))
            continue;

          const iMin = Math.max(i - 1, 0);
          const iMax = Math.min(i + 1, this.nodeSize.i - 1);
          const jMin = Math.max(j - 1, 0);
          const jMax = Math.min(j + 1, this.nodeSize.j - 1);

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
          sum += this.getZ(i, j) * 2;
          count += 2;
          const index = this.getNodeIndex(i, j);
          buffer[index] = sum / count;
        }
      // Swap buffers
      const temp = this.buffer;
      this.buffer = buffer;
      buffer = temp;
    }
  }

  //==================================================
  // STATIC METHODS: 
  //==================================================

  static createFractal(n: number, xOrigin: number, yOrigin: number, inc: number, wantedRange?: Range1): RegularGrid2
  {
    const stdDev = 1;
    const size = Math.pow(2, n) + 1;
    const grid = new RegularGrid2(new Index2(size, size), xOrigin, yOrigin, inc);

    let i0 = 0;
    let j0 = 0;
    let i1 = grid.nodeSize.i - 1;
    let j1 = grid.nodeSize.j - 1;

    grid.setZ(i0, j0, Random.getGaussian(0, stdDev));
    grid.setZ(i1, j0, Random.getGaussian(0, stdDev));
    grid.setZ(i0, j1, Random.getGaussian(0, stdDev));
    grid.setZ(i1, j1, Random.getGaussian(0, stdDev));

    subDivide(grid, i0, j0, i1, j1, stdDev, n, 0.55);

    grid.normalize(wantedRange);
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
  if (level == 0)
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
    return oldZ; // Already calulated (little bit dirty...)

  if (zMean === undefined)
    zMean = (grid.getZ(i0, j0) + grid.getZ(i2, j2)) / 2;

  const newZ = Random.getGaussian(zMean, stdDev);
  grid.setZ(i1, j1, newZ);
  return newZ;
}
