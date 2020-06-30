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

import { BaseRootNode } from "@/Core/Nodes/BaseRootNode";

import { WellTreeNode } from "@/Nodes/TreeNodes/WellTreeNode";
import { ColorTableTreeNode } from "@/Nodes/TreeNodes/ColorTableTreeNode";
import { SettingsTreeNode } from "@/Nodes/TreeNodes/SettingsTreeNode";
import { AxisNode } from "@/Nodes/Decorations/AxisNode";

import { OthersTreeNode } from "@/Nodes/TreeNodes/OthersTreeNode";
import RootNodeIcon from "@images/Nodes/RootNode.png";

export class SubSurfaceRootNode extends BaseRootNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "SubSurfaceRootNode";

  //==================================================
  //PROPERTIES
  //==================================================

  public get wells(): WellTreeNode
  {
    const child = this.getChildByType(WellTreeNode);
    if (!child)
      throw new Error("Cannot find the " + WellTreeNode.className);
    return child;
  }

  public get others(): OthersTreeNode
  {
    const child = this.getChildByType(OthersTreeNode);
    if (!child)
      throw new Error("Cannot find the " + OthersTreeNode.className);
    return child;
  }

  public get colorTables(): ColorTableTreeNode
  {
    const child = this.getChildByType(ColorTableTreeNode);
    if (!child)
      throw new Error("Cannot find the " + ColorTableTreeNode.className);
    return child;
  }

  public get settingsTree(): SettingsTreeNode
  {
    const child = this.getChildByType(SettingsTreeNode);
    if (!child)
      throw new Error("Cannot find the " + SettingsTreeNode.className);
    return child;
  }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return SubSurfaceRootNode.className; }
  public /*override*/ isA(className: string): boolean { return className === SubSurfaceRootNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public  /*override*/ isVisibleInTreeControl(): boolean { return false; }
  public /*override*/ getIcon(): string { return RootNodeIcon }
  protected /*override*/ initializeCore(): void
  {
    super.initializeCore();
    if (!this.hasChildByType(WellTreeNode))
      this.addChild(new WellTreeNode());

    if (!this.targets.hasChildByType(AxisNode))
      this.targets.addChild(new AxisNode());

    if (!this.hasChildByType(OthersTreeNode))
      this.addChild(new OthersTreeNode());
    if (!this.hasChildByType(ColorTableTreeNode))
      this.addChild(new ColorTableTreeNode());
    if (!this.hasChildByType(SettingsTreeNode))
      this.addChild(new SettingsTreeNode());
  }
}