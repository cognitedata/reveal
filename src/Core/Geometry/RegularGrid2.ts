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

  public isInNodeInsideDef(i: number, j: number): boolean
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
  // public getNormal(i: number, j: number): Vector3
  // {
  //   const p = new Vector3(0, 0, this.getZ(i, j))
  //   const a = new Vector3(0, 0, this.getZ(i, j))

  //   const def0 = this.isInNodeInsideDef(i + 1, j);
  //   const def1 = this.isInNodeInsideDef(j, i + 1);
  //   const def2 = this.isInNodeInsideDef(i - 1, j);
  //   const def3 = this.isInNodeInsideDef(i, j - 1);

  //   if (def0 && def1)
  //   {
  //     const a = new Vector3(0, this.inc, this.getZ(i, j + 1));
  //     a.substract(p);

  //     const b = new Vector3(0, this.inc, this.getZ(i, j + 1));
  //     b.substract(p);


  //   }


  // }

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

  private createUniqueIndices(): number[] 
  {
    let [uniqueIndexes, numUniqueIndex] = this.createUniqueIndexes();
    let vertices = new Float32Array(numUniqueIndex * 3);
    let normals = new Float32Array(numUniqueIndex * 3);

    for (var j = 0; j < this.nodeSize.j; j++)
    {
      for (var i = 0; i < this.nodeSize.i; i++)
      {
        var nodeIndex = this.getNodeIndex(i, j);
        var uniqueIndex = uniqueIndexes[nodeIndex];
        if (uniqueIndex < 0)
          continue;

        var point = this.getPoint3(i, j);
        let index = 3 * uniqueIndex;
        vertices[index + 1] = point.x
        vertices[index + 1] = point.y
        vertices[index + 2] = point.z

        // var normal = this.getNormal(i, j);
        // normals[index + 1] = normal.x
        // normals[index + 1] = normal.y
        // normals[index + 2] = normal.z
      }
    }
    return uniqueIndexes;
  }


  private createUniqueIndexes(): [number[], number]
  {
    let uniqueIndexes = [];
    let numUniqueIndex = 0;
    for (var j = 0; j < this.nodeSize.j; j++)
    {
      for (var i = 0; i < this.nodeSize.j; i++)
      {
        var nodeIndex = this.getNodeIndex(i, j);
        let uniqueIndex = -1;
        if (this.isNodeDef(i, j))
        {
          uniqueIndex = numUniqueIndex;
          numUniqueIndex++;
        }
        uniqueIndexes[nodeIndex] = uniqueIndex;
      }
    }
    return [uniqueIndexes, numUniqueIndex];
  }


  static createFractal(size: Index2): Grid2
  {
    return new Grid2(size);
  }
}
