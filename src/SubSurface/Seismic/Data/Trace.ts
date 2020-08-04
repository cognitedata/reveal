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

export class Trace 
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public values: Float32Array;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get length(): number { return this.values.length; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(length: number)
  {
    this.values = new Float32Array(length);
  }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public getAt(index: number): number { return this.values[index]; }
  public setAt(index: number, value: number): void { this.values[index] = value; }

  public generateSynthetic(x: number, y: number)
  {
    // x and y is [0,1]
    x = Math.sin(x * Math.PI / 3);
    y = Math.sin(y * Math.PI / 2);
    for (let k = this.length - 1; k >= 0; k--)
    {
      const z = k / (this.length - 1); // Z is [0,1]
      const value = (x + y) * Math.sin(2 * Math.PI * z * 20);
      this.values[k] = value;
    }
  }
}

