import { pseudoRandomBytes } from "crypto";

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

export class UniqueId
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  private _n: number;
  private static  _nn:number = 0;

  public constructor(n:number)
  {
    this._n = n;
  }
  static makeNew(): UniqueId { return new UniqueId(UniqueId._nn++); }
}

