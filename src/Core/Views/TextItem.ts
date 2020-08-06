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

import { Util } from "@/Core/Primitives/Util";

export class TextItem
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public key: string;
  public value: string | undefined;
  public dx = 0;
  public dy = 0;
  public isMultiLine = false;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get isEmpty(): boolean { return Util.isEmpty(this.key); }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  constructor(key: string, value?: string)
  {
    this.key = key;
    this.value = value;
  }
}
