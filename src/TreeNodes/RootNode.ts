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
import { WellTreeNode } from '@/TreeNodes/WellTreeNode';
import { ColorTableTreeNode } from '@/TreeNodes/ColorTableTreeNode';
import { SettingsTreeNode } from '@/TreeNodes/SettingsTreeNode';
import { OthersTreeNode } from '@/TreeNodes/OthersTreeNode';

export class RootNode extends BaseRootNode
{
  //==================================================
  //PROPERTIES
  //==================================================

  public get wells(): WellTreeNode
  {
    const child = this.getChildByType(WellTreeNode);
    if (!child)
      throw new Error("Cannot find the " + WellTreeNode.name);
    return child;
  }

  public get others(): OthersTreeNode
  {
    const child = this.getChildByType(OthersTreeNode);
    if (!child)
      throw new Error("Cannot find the " + OthersTreeNode.name);
    return child;
  }

  public get colorTables(): ColorTableTreeNode
  {
    const child = this.getChildByType(ColorTableTreeNode);
    if (!child)
      throw new Error("Cannot find the " + ColorTableTreeNode.name);
    return child;
  }

  public get settingsTree(): SettingsTreeNode
  {
    const child = this.getChildByType(SettingsTreeNode);
    if (!child)
      throw new Error("Cannot find the " + SettingsTreeNode.name);
    return child;
  }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return RootNode.name; }
  public /*override*/ isA(className: string): boolean { return className === RootNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  protected /*override*/ initializeCore(): void
  {
    super.initializeCore();
    if (!this.hasChildByType(WellTreeNode))
      this.addChild(new WellTreeNode());

    if (!this.hasChildByType(OthersTreeNode))
      this.addChild(new OthersTreeNode());
    if (!this.hasChildByType(ColorTableTreeNode))
      this.addChild(new ColorTableTreeNode());
    if (!this.hasChildByType(SettingsTreeNode))
      this.addChild(new SettingsTreeNode());
  }
}