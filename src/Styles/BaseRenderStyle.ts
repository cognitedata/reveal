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

import { BaseStyle } from "./BaseStyle";
import { TargetId } from "../Core/TargetId";
import { TargetIdAccessor } from "../Architecture/TargetIdAccessor";

export abstract class BaseRenderStyle extends BaseStyle implements TargetIdAccessor
{
  //==================================================
  // FIELDS
  //==================================================

  private _targetId: TargetId;
  public isDefault: boolean = false;

  //==================================================
  // PROPERTIES
  //==================================================

  public get targetId(): TargetId { return this._targetId; }
  public set targetId(value: TargetId) { this._targetId = value; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(targetId: TargetId) 
  {
    super();
    this._targetId = targetId.copy();
  }

  abstract copy(): BaseRenderStyle;
}