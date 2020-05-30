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

import { BaseVisualNode } from "@/Core/Nodes/BaseVisualNode";
import { FilterLogFolder } from "@/Nodes/Wells/Filters/FilterLogFolder";
import { WellLogType } from "@/Nodes/Wells/Logs/WellLogType";
import { BaseLogNode } from "@/Nodes/Wells/Wells/BaseLogNode";
import { Util } from "@/Core/Primitives/Util";
import { BaseTreeNode } from "@/Core/Nodes/BaseTreeNode";

export abstract class BaseFilterLogNode extends BaseVisualNode
{
  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get filterLogFolder(): FilterLogFolder | null { return this.getAncestorByType(FilterLogFolder); }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return BaseFilterLogNode.name; }
  public /*override*/ isA(className: string): boolean { return className === BaseFilterLogNode.name || super.isA(className); }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  public abstract get wellLogType(): WellLogType;

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public isEqual(other: BaseLogNode): boolean
  {
    return this.wellLogType == other.wellLogType && Util.equalsIgnoreCase(this.name, other.name);
  }

  public * getAllLogs(): Iterable<BaseLogNode>
  {
    const tree = this.getAncestorByType(BaseTreeNode);
    if (!tree)
      return;

    for (const logNode of tree.getDescendantsByType(BaseLogNode))
    {
      if (logNode.isEqual(this))
        yield logNode;
    }
  }
}