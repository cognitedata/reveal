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

import { Vector3 } from "@/Core/Geometry/Vector3";
import { BaseNode } from "@/Core/Nodes/BaseNode";

export class WellNode extends BaseNode
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public wellHead = Vector3.newZero;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return WellNode.name; }
  public /*override*/ isA(className: string): boolean { return className === WellNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "Well" }

  //public /*override*/ get boundingBox(): Range3 { return this.data ? this.data.getRange() : new Range3(); }
}