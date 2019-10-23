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

import { VisualNode } from "./VisualNode";
import { TargetNode } from "./TargetNode";
import { BaseNode } from "./BaseNode";
import { TargetIdAccessor } from "../Interfaces/TargetIdAccessor";

export class TargetFolder extends VisualNode
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor()
  {
    super();
    this.name = "Target folder";
  }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return TargetFolder.name; }
  public /*override*/ isA(className: string): boolean { return className === TargetFolder.name || super.isA(className); }
}
