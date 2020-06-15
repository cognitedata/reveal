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
import { BaseView } from "@/Core/Views/BaseView";

export class LogFilterView extends BaseView
{
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
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  public get /*override*/ isVisible(): boolean
  {
    const parent = this.trajectoryNode;
    return parent != null && parent.isVisible(this.renderTarget)
  }

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    super.updateCore(args);
    if (args.isChanged(Changes.renderStyle))
      this.updateTrajectory(args);
  }

  protected /*override*/ onShowCore(): void
  {
    super.onShowCore();
    this.updateTrajectory();
  }

  protected /*override*/ onHideCore(): void
  {
    super.onHideCore();
    this.updateTrajectory();
  }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  protected updateTrajectory(args: NodeEventArgs | null = null): void
  {
    const trajectoryNode = this.trajectoryNode;
    if (!trajectoryNode)
      return;

    const trajectoryView = trajectoryNode.getViewByTarget(this.renderTarget);
    if (!trajectoryView)
      return;

    trajectoryView.update(args ?? new NodeEventArgs(Changes.filter));
  }
}
