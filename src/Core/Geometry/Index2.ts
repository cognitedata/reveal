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
  // STATIC PROPERTIES
  //==================================================
  
  public static get newZero(): Index2 { return new Index2(0, 0); }

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public i: number;
  public j: number;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(i: number, j?: number)
  {
    this.i = i;
    this.j = j === undefined ? i : j;
  }

  public /*copy constructor*/ clone(): Index2
  {
    return new Index2(this.i, this.j);
  }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get size(): number { return this.i * this.j; }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public getAt(dimension: number): number
  {
    switch (dimension)
    {
      case 0: return this.i;
      case 1: return this.j;
      default: return Number.NaN;
    }
  }

  public toString(): string { return `(${this.i}, ${this.j})`; }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

}
