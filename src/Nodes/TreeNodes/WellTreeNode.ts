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

import { BaseTreeNode } from "@/Core/Nodes/BaseTreeNode";
import { FilterLogFolder } from "@/Nodes/Wells/Filters/FilterLogFolder";
import WellNodeIcon from "@images/Nodes/WellNode.png";

export class WellTreeNode extends BaseTreeNode
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return WellTreeNode.name; }
  public /*override*/ isA(className: string): boolean { return className === WellTreeNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "WellTree" }
  public /*override*/ getIcon(): string { return WellNodeIcon }
  public /*override*/ getName(): string { return "Wells" }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public synchronize(): void
  {
    let filterLogFolder = this.getChildByType(FilterLogFolder);
    if (!filterLogFolder)
    {
      filterLogFolder = new FilterLogFolder();
      this.addChild(filterLogFolder, true);
      filterLogFolder.initialize();
    }
    filterLogFolder.synchronize();
  }
}