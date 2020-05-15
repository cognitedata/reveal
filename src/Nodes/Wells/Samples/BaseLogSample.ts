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

import { BaseWellSample } from "./BaseWellSample";

export abstract class BaseLogSample extends BaseWellSample 
{
  //==================================================
  // VIRTUAL PROPERTIES
  //==================================================

  public abstract get isEmpty(): boolean;

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  public abstract isEqual(other: BaseLogSample): boolean;
  public abstract copyValueFrom(other: BaseLogSample): void;
  public abstract clone(): BaseLogSample;
}  
