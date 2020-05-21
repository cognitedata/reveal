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

import { BaseLogNode } from "@/Nodes/Wells/Wells/BaseLogNode";
import { WellTrajectoryNode } from "@/Nodes/Wells/Wells/WellTrajectoryNode";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { Changes } from "@/Core/Views/Changes";

import { BaseThreeView } from "@/Three/BaseViews/BaseThreeView";

export class WellLogThreeView extends BaseThreeView
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  private get node(): BaseLogNode { return super.getNode() as BaseLogNode; }

  private get trajectoryNode(): WellTrajectoryNode | null
  {
    const node = this.node;
    return !node ? null : node.trajectoryNode;
  }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    super.updateCore(args);
  }

  protected /*virtual*/ onShowCore(): void
  {
    super.onShowCore();
    this.updateTrajectoryView();
  }

  protected /*virtual*/ onHideCore(): void
  {
    super.onHideCore();
    this.updateTrajectoryView();
  }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  protected updateTrajectoryView(): void
  {
    const trajectoryNode = this.trajectoryNode;
    if (!trajectoryNode)
      return;

    const trajectoryView = this.renderTarget.getViewByNode(trajectoryNode);
    if (!trajectoryView)
      return;

    super.update(new NodeEventArgs(Changes.filter));
  }

}
