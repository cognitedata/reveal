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

import { BaseStyle } from "@/Core/Styles/BaseStyle";
import { TargetId } from "@/Core/Primitives/TargetId";
import { ITargetIdAccessor } from "@/Core/Interfaces/ITargetIdAccessor";
import { PropertyFolder } from "@/Core/Property/Concrete/Folder/PropertyFolder";

export abstract class BaseRenderStyle extends BaseStyle implements ITargetIdAccessor
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public readonly fontSizeOptions = [10, 20, 25, 30, 50, 75, 100, 200];

  private _targetId: TargetId;

  public isDefault: boolean = false;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get targetId(): TargetId { return this._targetId; }

  public set targetId(value: TargetId) { this._targetId = value; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(targetId: TargetId) 
  {
    super();
    this._targetId = targetId.clone();
  }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  abstract clone(): BaseRenderStyle;

  protected /*virtual*/ PopulateCore(folder: PropertyFolder) { }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public Populate(folder: PropertyFolder): void
  {
    this.PopulateCore(folder);
  }
}
