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
      sum.set(0,0,1);
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

  static createFractal(size: Index2): Grid2
  {
    return new Grid2(size);
  }
}
