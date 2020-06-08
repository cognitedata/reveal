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

import { BaseNode } from "@/Core/Nodes/BaseNode";

export abstract class BaseTreeNode extends BaseNode
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() {
    super();
    this.isExpanded = true;
  }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return BaseTreeNode.name; }
  public /*override*/ isA(className: string): boolean { return className === BaseTreeNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get isVisibleInTreeControl(): boolean { return false; }
  public /*override*/ get canChangeName(): boolean { return false }
  public /*override*/ get canChangeColor(): boolean { return false; }
}