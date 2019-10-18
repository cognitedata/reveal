import { UniqueId } from "./UniqueId";

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

export class TargetId
{
  //==================================================
  // FIELDS
  //==================================================

  private _uniqueId: UniqueId | undefined = undefined;
  private _className: string | undefined = undefined;

  public get uniqueId(): UniqueId | undefined { return this._uniqueId; }
  public set uniqueId(value: UniqueId | undefined) { this._uniqueId = value; }
  public get className(): string | undefined { return this._className; }
  public set className(value: string | undefined) { this._className = value; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(uniqueId?: TargetId | undefined, className?: string | undefined)
  {
    this._uniqueId = uniqueId;
    this._className = className;
  }
}

