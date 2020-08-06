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
import { BaseFilterLogNode } from "@/SubSurface/Wells/Filters/BaseFilterLogNode";
import { BaseView } from "@/Core/Views/BaseView";

export class FilterLogFilterView extends BaseView
{
  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  private get node(): BaseFilterLogNode { return super.getNode() as BaseFilterLogNode; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    super.updateCore(args);
    const { node } = this;
    for (const logNode of node.getAllLogs())
    {
      const view = logNode.getViewByTarget(this.renderTarget);
      if (view)
        view.update(args);
    }
  }

  protected /*override*/ onShowCore(): void
  {
    super.onShowCore();
    this.onHideOrShowCore(true);
  }

  protected /*override*/ onHideCore(): void
  {
    super.onHideCore();
    this.onHideOrShowCore(false);
  }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  protected onHideOrShowCore( visible:boolean): void
  {
    // Pattern: SYNC_LOGS_AND_FILTERLOGS
    const { node } = this;
    for (const logNode of node.getAllLogs())
    {
      const { trajectoryNode } = logNode;
      if (!trajectoryNode)
        continue;

      if (trajectoryNode.isVisible(this.renderTarget))
        logNode.setVisibleInteractive(visible, this.renderTarget);
    }
  }
}
