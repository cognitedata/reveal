
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

import { v4 as uuid } from "uuid";

export class UniqueId
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(id: string) { this._id = id; }

  public /*copy constructor*/ copy(): UniqueId { return new UniqueId(this._id); }

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _id: string;
  public static empty = new UniqueId("");

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public static new(): UniqueId { return new UniqueId(uuid()); }
  public get isEmpty(): boolean { return (!this._id || this._id === ""); }
  public /*override*/ toString(): string { return `${this._id}`; }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public equals(other: UniqueId): boolean { return this._id === other._id; }
}

