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

export class Index2
{
  //==================================================
  // FIELDS
  //==================================================

  public i: number;
  public j: number;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(i: number, j?: number)
  {
    this.i = i;
    this.j = j == undefined ? i : j;
  }

  public /*copy constructor*/ copy(): Index2
  {
    return new Index2(this.i, this.j);
  }

  //==================================================
  // PROPERTIES
  //==================================================

  public get size(): number { return this.i * this.j; }

  //==================================================
  // INSTANCE METHODS; Getters
  //==================================================

  public toString(): string { return `(${this.i}, ${this.j})`; }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

}
