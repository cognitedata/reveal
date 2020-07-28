
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

import { Index2 } from "@/Core/Geometry/Index2";
import { Shape } from "@/Core/Geometry/Shape";
import { Range3 } from "@/Core/Geometry/Range3";

export class Grid2 extends Shape
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public readonly nodeSize: Index2;
  public readonly cellSize: Index2;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(nodeSize: Index2)
  {
    super();
    this.nodeSize = nodeSize.clone();
    this.cellSize = nodeSize.clone();
    this.cellSize.i--;
    this.cellSize.j--;
  }

  //==================================================
  // OVERRIDES of Shape:
  //==================================================

  public /*override*/ clone(): Shape { return new Grid2(this.nodeSize); }
  public/*override*/ expandBoundingBox(boundingBox: Range3): void { }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public toString(): string { return `(${this.nodeSize})`; }
  
  public getNodeIndex(i: number, j: number) { return i + this.nodeSize.i * j; }
  public getCellIndex(i: number, j: number) { return i + this.cellSize.i * j; }

  //==================================================
  // INSTANCE METHODS: Requests
  //==================================================

  public isNodeInside(i: number, j: number) { return i >= 0 && j >= 0 && i < this.nodeSize.i && j < this.nodeSize.j; }
}
