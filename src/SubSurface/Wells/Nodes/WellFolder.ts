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

import { FolderNode } from "@/Core/Nodes/FolderNode";
import FolderNodeGreyscale from "@images/Nodes/FolderNodeGreyscale.png";

export class WellFolder extends FolderNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "WellFolder";

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return WellFolder.className; }
  public /*override*/ isA(className: string): boolean { return className === WellFolder.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "Well folder" }
  public /*override*/ getIcon(): string { return FolderNodeGreyscale }
  public /*virtual*/ canChangeColor(): boolean { return true; }
}