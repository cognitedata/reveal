
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

export class Grid3
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public readonly nodeSize: Index3;
  public readonly cellSize: Index3;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(numNodes: Index3)
  {
    this.nodeSize = numNodes.clone();
    this.cellSize = numNodes.clone();
    this.cellSize.i--;
    this.cellSize.j--;
  }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public toString(): string { return `(${this.nodeSize})`; }
  public getCellIndex2(i: number, j: number) { return i + this.cellSize.i * j; }

  //==================================================
  // INSTANCE METHODS: Requests
  //==================================================

  public isNodeInside(i: number, j: number, k: number) { return i >= 0 && j >= 0 && k >= 0 && i < this.nodeSize.i && j < this.nodeSize.j && k < this.nodeSize.k; }
}
