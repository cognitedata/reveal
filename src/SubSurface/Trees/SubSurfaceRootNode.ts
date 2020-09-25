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

import { WellTreeNode } from "@/SubSurface/Trees/WellTreeNode";
import { AxisNode } from "@/Core/Nodes/Decorations/AxisNode";

import { OthersTreeNode } from "@/SubSurface/Trees/OthersTreeNode";
import RootNodeIcon from "@images/Nodes/RootNode.png";
import { SeismicTreeNode } from "@/SubSurface/Trees/SeismicTreeNode";

export class SubSurfaceRootNode extends BaseRootNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "SubSurfaceRootNode";

  //==================================================
  //PROPERTIES
  //==================================================

  public get wells(): WellTreeNode | null
  {
    return this.getChildByType(WellTreeNode);
  }

  public get seismic(): SeismicTreeNode | null
  {
    return this.getChildByType(SeismicTreeNode);
  }

  public get others(): OthersTreeNode | null
  {
    return this.getChildByType(OthersTreeNode);
  }

  //==================================================
  // CONSTRUCTOR
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

  public /*override*/ isVisibleInTreeControl(): boolean { return false; }

  public /*override*/ getIcon(): string { return RootNodeIcon; }

  protected /*override*/ initializeCore(): void
  {
    super.initializeCore();
    // if (!this.hasChildByType(SeismicTreeNode))
    //   this.addChild(new SeismicTreeNode());
    // if (!this.hasChildByType(WellTreeNode))
    //   this.addChild(new WellTreeNode());
    // if (!this.hasChildByType(OthersTreeNode))
    //   this.addChild(new OthersTreeNode());
    if (!this.targets.hasChildByType(AxisNode))
      this.targets.addChild(new AxisNode());
  }

  //==================================================
  // OVERRIDES of BaseRootNode
  //==================================================

  public /*override*/ clearData(): void
  {
    super.clearData();
    const { wells } = this;
    if (wells)
      wells.remove();
    const { seismic } = this;
    if (seismic)
      seismic.remove();
    const { others } = this;
    if (others)
      others.remove();
  }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

  public getWellsByForce(): WellTreeNode
  {
    let tree = this.wells;
    if (!tree)
    {
      tree = new WellTreeNode();
      this.addChild(tree);
    }
    return tree;
  }

  public getSeismicByForce(): SeismicTreeNode
  {
    let tree = this.seismic;
    if (!tree)
    {
      tree = new SeismicTreeNode();
      this.addChild(tree);
    }
    return tree;
  }

  public getOthersByForce(): OthersTreeNode
  {
    let tree = this.others;
    if (!tree)
    {
      tree = new OthersTreeNode();
      this.addChild(tree);
    }
    return tree;
  }
}