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
import { BaseLogNode } from "@/SubSurface/Wells/Nodes/BaseLogNode";
import { BaseFilterLogNode } from "@/SubSurface/Wells/Filters/BaseFilterLogNode";
import { ITarget } from "@/Core/Interfaces/ITarget";
import { PointLogNode } from "@/SubSurface/Wells/Nodes/PointLogNode";
import { PointFilterLogNode } from "@/SubSurface/Wells/Filters/PointFilterLogNode";
import { FloatFilterLogNode } from "@/SubSurface/Wells/Filters/FloatFilterLogNode";
import { FloatLogNode } from "@/SubSurface/Wells/Nodes/FloatLogNode";
import { DiscreteFilterLogNode } from "@/SubSurface/Wells/Filters/DiscreteFilterLogNode";
import { DiscreteLogNode } from "@/SubSurface/Wells/Nodes/DiscreteLogNode";
import { CasingFilterLogNode } from "@/SubSurface/Wells/Filters/CasingFilterLogNode";
import { CasingLogNode } from "@/SubSurface/Wells/Nodes/CasingLogNode";
import FilterLogFolderIcon from "@images/Nodes/FilterLogFolder.png";
import { BaseTreeNode } from "@/Core/Nodes/BaseTreeNode";

export class FilterLogFolder extends BaseNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "FilterLogFolder";

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return FilterLogFolder.className; }
  public /*override*/ isA(className: string): boolean { return className === FilterLogFolder.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "Log filter"; }
  public /*override*/ getIcon(): string { return FilterLogFolderIcon }
  public /*override*/ canChangeName(): boolean { return false }
  public /*override*/ canChangeColor(): boolean { return false; }
  public /*override*/ isLabelInItalic(): boolean { return true; }
  public /*override*/ isFilter(target: ITarget | null): boolean { return true; }
  public /*override*/ canBeChecked(target: ITarget | null): boolean { return false; }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public getFilterLogNode(logNode: BaseLogNode): BaseFilterLogNode | null
  {
    for (const filterLogNode of this.getChildrenByType(BaseFilterLogNode))
    {
      if (filterLogNode.isEqual(logNode))
        return filterLogNode;
    }
    return null;
  }

  public synchronize(): void
  {
    const tree = this.getAncestorByType(BaseTreeNode);
    if (!tree)
      return;

    // Iterate over all logs
    for (const logNode of tree.getDescendantsByType(BaseLogNode))
    {
      let filterLogNode = this.getFilterLogNode(logNode);
      if (filterLogNode)
        continue;

      filterLogNode = this.createFilterLogNode(logNode);
      if (!filterLogNode)
        continue;

      filterLogNode.name = logNode.name;
      this.addChild(filterLogNode);
      filterLogNode.initialize();
    }
    this.sortChildrenByName();
  }

  private createFilterLogNode(logNode: BaseLogNode): BaseFilterLogNode | null
  {
    if (logNode instanceof CasingLogNode)
      return new CasingFilterLogNode();
    if (logNode instanceof DiscreteLogNode)
      return new DiscreteFilterLogNode();
    if (logNode instanceof FloatLogNode)
      return new FloatFilterLogNode();
    if (logNode instanceof PointLogNode)
      return new PointFilterLogNode();
    Error("Can not FilterLogNode");
    return null;
  }

}