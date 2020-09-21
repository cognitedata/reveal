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
import { FilterLogFolder } from "@/SubSurface/Wells/Filters/FilterLogFolder";
import { WellLogType } from "@/SubSurface/Wells/Logs/WellLogType";
import { BaseLogNode } from "@/SubSurface/Wells/Nodes/BaseLogNode";
import { Util } from "@/Core/Primitives/Util";
import { ITarget } from "@/Core/Interfaces/ITarget";
import { BasePropertyFolder } from "@/Core/Property/Base/BasePropertyFolder";
import { ColorType } from "@/Core/Enums/ColorType";
import { Changes } from "@/Core/Views/Changes";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";

export abstract class BaseFilterLogNode extends BaseVisualNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "BaseFilterLogNode";

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get filterLogFolder(): FilterLogFolder | null { return this.getAncestorByType(FilterLogFolder); }

  //==================================================
  // CONSTRUCTOR
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return BaseFilterLogNode.className; }
  public /*override*/ isA(className: string): boolean { return className === BaseFilterLogNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ isLabelInItalic(): boolean { return true; }
  public /*override*/ isFilter(target: ITarget | null): boolean { return true; }

  protected /*override*/ populateStatisticsCore(folder: BasePropertyFolder): void
  {
    super.populateStatisticsCore(folder);
    let count = 0;
    for (const logNode of this.getAllLogs())
      count++;

    folder.addReadOnlyInteger("# Logs of this type", count);
  }

  public /*override*/notifyCore(args: NodeEventArgs): void
  {
    super.notifyCore(args);
    if (!args.isChanged(Changes.renderStyle, Changes.nodeName, Changes.nodeColor))
      return;

    for (const logNode of this.getAllLogs())
      logNode.notify(args);
  }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  public abstract get wellLogType(): WellLogType;

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public isEqual(other: BaseLogNode): boolean
  {
    return this.wellLogType === other.wellLogType && Util.equalsIgnoreCase(this.name, other.name);
  }

  public * getAllLogs(): Generator<BaseLogNode>
  {
    const treeNode = this.getTreeNode();
    if (!treeNode)
      return;

    for (const logNode of treeNode.getDescendantsByType(BaseLogNode))
    {
      if (logNode.isEqual(this))
        yield logNode;
    }
  }
}