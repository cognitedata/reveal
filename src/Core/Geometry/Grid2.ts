import { Index2 } from "./Index2";

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

export class Grid2
{
  //==================================================
  // FIELDS
  //==================================================

  public nodeSize: Index2;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(numNodes: Index2)
  {
    this.nodeSize = numNodes.copy();
  }

  //==================================================
  // INSTANCE METHODS; Getters
  //==================================================

  public toString(): string { return `(${this.nodeSize})`; }
  public isNodeInside(i: number, j: number) { return i >= 0 && j >= 0 && i < this.nodeSize.i && j <= this.nodeSize.j; }
}
