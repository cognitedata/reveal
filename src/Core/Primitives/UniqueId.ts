
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
  // STATIC FIELDS
  //==================================================

  public static readonly empty = new UniqueId(); 
  public static new(): UniqueId { return new UniqueId(uuid()); }
  public static create(other: string): UniqueId { return new UniqueId(other) };

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _id: string | undefined;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get isEmpty(): boolean { return (!this._id || this._id === ""); }
  public /*override*/ toString(): string { return `${this._id}`; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  private constructor(id?: string) { this._id = id; }

  public /*copy constructor*/ clone(): UniqueId { return new UniqueId(this._id); }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public equals(other: UniqueId): boolean { return this._id === other._id; }
  public equalString(other: string): boolean { return this._id ? this._id === other : false; }
}

