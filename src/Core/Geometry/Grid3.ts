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

import { Index3 } from "@/Core/Geometry/Index3";
import { Shape } from "@/Core/Geometry/Shape";
import { Range3 } from "@/Core/Geometry/Range3";

export class Grid3 extends Shape 
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public readonly nodeSize: Index3;
  public readonly cellSize: Index3;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(nodeSize: Index3)
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

  public /*override*/ clone(): Shape { return new Grid3(this.nodeSize); }

  public/*override*/ expandBoundingBox(boundingBox: Range3): void { }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public toString(): string { return `(${this.nodeSize})`; }

  public getCellIndex2(i: number, j: number) { return i + this.cellSize.i * j; }

  //==================================================
  // INSTANCE METHODS: Requests
  //==================================================

  public isNodeInside(i: number, j: number, k: number) { return i >= 0 && j >= 0 && k >= 0 && i < this.nodeSize.i && j < this.nodeSize.j && k < this.nodeSize.k; }

  public isCellInside(i: number, j: number, k: number) { return i >= 0 && j >= 0 && k >= 0 && i < this.cellSize.i && j < this.cellSize.j && k < this.cellSize.k; }

  public isCellInside3(cell:Index3) { return cell.i >= 0 && cell.j >= 0 && cell.k >= 0 && cell.i < this.cellSize.i && cell.j < this.cellSize.j && cell.k < this.cellSize.k; }
}
