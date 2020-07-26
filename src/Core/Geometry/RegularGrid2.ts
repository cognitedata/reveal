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

import * as Lodash from 'lodash';

import { Vector3 } from "@/Core/Geometry/Vector3";
import { Range1 } from "@/Core/Geometry/Range1";
import { Range3 } from "@/Core/Geometry/Range3";
import { Index2 } from "@/Core/Geometry/Index2";
import { Grid2 } from "@/Core/Geometry/Grid2";
import { Random } from "@/Core/Primitives/Random";
import { Shape } from "@/Core/Geometry/Shape";

export class RegularGrid2 extends Grid2
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public origin: Vector3; // Z is translation in Z
  public inc: Vector3; // Z is ignord

  private _hasRotationAngle = false;
  private _rotationAngle = 0;
  private _sinRotationAngle = 0;
  private _cosRotationAngle = 1;
  private _buffer: Float32Array;

  static readonly _staticHelperA = Vector3.newZero;
  static readonly _staticHelperB = Vector3.newZero;
  static readonly _staticHelperC = Vector3.newZero;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get rotationAngle(): number { return this._rotationAngle; }

  public set rotationAngle(value: number)
  {
    this._hasRotationAngle = value != 0;
    if (this._hasRotationAngle)
    {
      this._rotationAngle = value;
      this._sinRotationAngle = Math.sin(this._rotationAngle);
      this._cosRotationAngle = Math.cos(this._rotationAngle);
    }
    else
    {
      this._rotationAngle = 0;
      this._sinRotationAngle = 0;
      this._cosRotationAngle = 1;
    }
  }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(nodeSize: Index2, origin: Vector3, inc: Vector3, rotationAngle: number | undefined = undefined)
  {
    super(nodeSize);
    this.origin = origin;
    this.inc = inc;
    if (rotationAngle != undefined)
      this.rotationAngle = rotationAngle;
    this._buffer = new Float32Array(nodeSize.size);
  }

  //==================================================
  // OVERRIDES of object
  //==================================================

  public /*override*/ toString(): string { return `nodeSize: (${this.nodeSize}) origin: (${this.origin.x}, ${this.origin.y}) inc: (${this.inc.x}, ${this.inc.y})`; }

  //==================================================
  // OVERRIDES of Shape
  //==================================================

  public /*override*/ clone(): Shape { return Lodash.cloneDeep(this); }

  public expandBoundingBox(boundingBox: Range3): void
  {
    const position = Vector3.newZero;
    for (let j = this.nodeSize.j - 1; j >= 0; j--)
    {
      for (let i = this.nodeSize.i - 1; i >= 0; i--)
      {
        if (this.getPosition(i, j, position))
          boundingBox.add(position)
      }
    }
  }

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
  // INSTANCE METHODS: Getters
  //==================================================

  public getZ(i: number, j: number): number
  {
    const index = this.getNodeIndex(i, j);
    return this._buffer[index];
  }

  public getPosition(i: number, j: number, result: Vector3): boolean
  {
    const z = this.getZ(i, j);
    if (Number.isNaN(z))
      return false;

    if (this._hasRotationAngle)
    {
      const dx = this.inc.x * i;
      const dy = this.inc.y * j;
      result.x = dx * this._cosRotationAngle - dy * this._sinRotationAngle;
      result.y = dx * this._sinRotationAngle + dy * this._cosRotationAngle;
    }
    else
    {
      result.x = this.inc.x * i;
      result.y = this.inc.y * j;
    }
    result.z = z;
    result.add(this.origin);
    return true;
  }

  public getPosition2(i: number, j: number, result: Vector3): void
  {
    if (this._hasRotationAngle)
    {
      const dx = this.inc.x * i;
      const dy = this.inc.y * j;
      result.x = dx * this._cosRotationAngle - dy * this._sinRotationAngle;
      result.y = dx * this._sinRotationAngle + dy * this._cosRotationAngle;
    }
    else
    {
      result.x = this.inc.x * i;
      result.y = this.inc.y * j;
    }
    result.x += this.origin.x;
    result.y += this.origin.y;
  }

  public getRelativePosition(i: number, j: number, result: Vector3): boolean
  {
    const z = this.getZ(i, j);
    if (Number.isNaN(z))
      return false;

    result.x = this.inc.x * i;
    result.y = this.inc.y * j;
    result.z = z;
    return true;
  }

  public getNormal(i: number, j: number, result: Vector3, z: number, normalize: boolean): Vector3
  {
    if (!z)
      z = this.getZ(i, j);

    const a = RegularGrid2._staticHelperA;
    const b = RegularGrid2._staticHelperB;

    result.set(0, 0, 0);

    let def0 = this.isNodeInside(i + 1, j + 0);
    let def1 = this.isNodeInside(i + 0, j + 1);
    let def2 = this.isNodeInside(i - 1, j + 0);
    let def3 = this.isNodeInside(i + 0, j - 1);

    const i0 = def0 ? this.getNodeIndex(i + 1, j + 0) : -1;
    const i1 = def1 ? this.getNodeIndex(i + 0, j + 1) : -1;
    const i2 = def2 ? this.getNodeIndex(i - 1, j + 0) : -1;
    const i3 = def3 ? this.getNodeIndex(i + 0, j - 1) : -1;

    let z0 = def0 ? this._buffer[i0] : 0;
    let z1 = def1 ? this._buffer[i1] : 0;
    let z2 = def2 ? this._buffer[i2] : 0;
    let z3 = def3 ? this._buffer[i3] : 0;

    if (def0) { if (Number.isNaN(z0)) def0 = false; else z0 -= z; }
    if (def1) { if (Number.isNaN(z1)) def1 = false; else z1 -= z; }
    if (def2) { if (Number.isNaN(z2)) def2 = false; else z2 -= z; }
    if (def3) { if (Number.isNaN(z3)) def3 = false; else z3 -= z; }

    if (def0 && def1)
    {
      a.set(+this.inc.x, 0, z0);
      b.set(0, +this.inc.y, z1);
      a.crossProduct(b);
      result.add(a);
    }
    if (def1 && def2)
    {
      a.set(0, +this.inc.y, z1);
      b.set(-this.inc.x, 0, z2);
      a.crossProduct(b);
      result.add(a);
    }
    if (def2 && def3)
    {
      a.set(-this.inc.x, 0, z2);
      b.set(0, -this.inc.y, z3);
      a.crossProduct(b);
      result.add(a);
    }
    if (def3 && def0)
    {
      a.set(0, -this.inc.y, z3);
      b.set(+this.inc.x, 0, z0);
      a.crossProduct(b);
      result.add(a);
    }
    if (normalize && !result.normalize())
      result.set(0, 0, 1);
    return result;
  }

  public getCornerRange(): Range3
  {
    const corner = Vector3.newZero;
    const range = new Range3();
    range.add(this.origin);
    this.getPosition2(0, this.nodeSize.j - 1, corner);
    range.add(corner);
    this.getPosition2(this.nodeSize.i - 1, 0, corner);
    range.add(corner);
    this.getPosition2(this.nodeSize.i - 1, this.nodeSize.j - 1, corner);
    range.add(corner);
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
    this._buffer[index] = value;
  }

  //==================================================
  // INSTANCE METHODS: Operation
  //==================================================

  public normalizeZ(wantedRange?: Range1): void
  {
    const currentRange = this.zRange;
    for (let i = this._buffer.length - 1; i >= 0; i--)
    {
      let z = this._buffer[i];
      z = currentRange.getFraction(z);
      if (wantedRange !== undefined)
        z = wantedRange.getValue(z);
      this._buffer[i] = z;
    }
    this.touch();
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
      [this._buffer, buffer] = [buffer, this._buffer]; // Swap buffers
    }
    this.touch();
  }

  //==================================================
  // STATIC METHODS: 
  //==================================================

  static createFractal(boundingBox: Range3, powerOf2: number, dampning: number = 0.7, smoothNumberOfPasses: number = 0, rotationAngle: number): RegularGrid2
  {
    const origin = Vector3.newZero;
    const inc = new Vector3(1, 1, 0);
    const nodeSize = new Index2(Math.pow(2, powerOf2) + 1);
    const stdDev = 1;
    const grid = new RegularGrid2(nodeSize, origin, inc, rotationAngle);

    const i0 = 0;
    const j0 = 0;
    const i1 = grid.cellSize.i;
    const j1 = grid.cellSize.j;

    grid.setZ(i0, j0, Random.getGaussian(0, stdDev));
    grid.setZ(i1, j0, Random.getGaussian(0, stdDev));
    grid.setZ(i0, j1, Random.getGaussian(0, stdDev));
    grid.setZ(i1, j1, Random.getGaussian(0, stdDev));

    subDivide(grid, i0, j0, i1, j1, stdDev, powerOf2, dampning);

    grid.origin.x = boundingBox.x.min;
    grid.origin.y = boundingBox.y.min;
    grid.inc.x = boundingBox.x.delta / grid.cellSize.i;
    grid.inc.y = boundingBox.y.delta / grid.cellSize.j;

    grid.normalizeZ(boundingBox.z);
    grid.smoothSimple(smoothNumberOfPasses);
    return grid;
  }
}

//==================================================
// LOCAL METHODS: Helpers
//==================================================

function setValueBetween(grid: RegularGrid2, i0: number, j0: number, i2: number, j2: number, stdDev: number, zMean?: number): number
{
  const i1 = Math.trunc((i0 + i2) / 2);
  const j1 = Math.trunc((j0 + j2) / 2);

  const oldZ = grid.getZ(i1, j1);
  if (oldZ !== 0)
    return oldZ; // Assume already calculated (little bit dirty...)

  if (zMean === undefined)
    zMean = (grid.getZ(i0, j0) + grid.getZ(i2, j2)) / 2;

  const newZ = Random.getGaussian(zMean, stdDev);
  grid.setZ(i1, j1, newZ);
  return newZ;
}

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
