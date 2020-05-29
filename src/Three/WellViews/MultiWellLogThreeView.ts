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

import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { Changes } from "@/Core/Views/Changes";

import { BaseThreeView } from "@/Three/BaseViews/BaseThreeView";
import { MultiBaseLogNode } from "@/Nodes/Wells/MultiNodes/MultiBaseLogNode";
import { MultiWellTrajectoryNode } from "@/Nodes/Wells/MultiNodes/MultiWellTrajectoryNode";
import { BaseTreeNode } from "@/Core/Nodes/BaseTreeNode";

export class MultiWellLogThreeView extends BaseThreeView {
  
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  private get node(): MultiBaseLogNode { return super.getNode() as MultiBaseLogNode; }

  private get trajectoryNode(): MultiWellTrajectoryNode | null {
    const node = this.node;
    return !node ? null : node.trajectoryNode;
  }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  public get /*override*/ isVisible(): boolean {
    const parent = this.trajectoryNode;
    return parent != null && parent.isVisible(this.renderTarget)
  }

  protected /*override*/ updateCore(args: NodeEventArgs): void {
    super.updateCore(args);
  }

  protected /*virtual*/ onShowCore(): void {
    super.onShowCore();
    this.updateTrajectoryView();
  }

  protected /*virtual*/ onHideCore(): void {
    super.onHideCore();

    const node = this.node;
    const tree = node.getAncestorByType(BaseTreeNode);
    if (!tree)
    return;

    for (const child of tree.getAncestors())
    {
      if (child.name == node.name && 
    }


    
    this.updateTrajectoryView();
  }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  protected updateTrajectoryView(): void {
    const trajectoryNode = this.trajectoryNode;
    if (!trajectoryNode)
      return;

    const trajectoryView = this.renderTarget.getViewByNode(trajectoryNode);
    if (!trajectoryView)
      return;

    trajectoryView.update(new NodeEventArgs(Changes.filter));
  }
}
