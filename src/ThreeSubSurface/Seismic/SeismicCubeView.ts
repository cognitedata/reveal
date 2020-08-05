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
import { BaseView } from "@/Core/Views/BaseView";
import { SeismicCubeNode } from '@/SubSurface/Seismic/Nodes/SeismicCubeNode';
import { SeismicPlaneNode } from '@/SubSurface/Seismic/Nodes/SeismicPlaneNode';

export class SeismicCubeView extends BaseView
{
  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  private get node(): SeismicCubeNode { return super.getNode() as SeismicCubeNode; }

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
    this.updatePlanes(args);
  }

  protected /*override*/ onShowCore(): void
  {
    super.onShowCore();
    this.updatePlanes(new NodeEventArgs(Changes.filter));
  }

  protected /*override*/ onHideCore(): void
  {
    super.onHideCore();
    this.updatePlanes(new NodeEventArgs(Changes.filter));
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  private updatePlanes(args: NodeEventArgs): void
  {
    const {node} = this;
    const survey = node.surveyNode;
    if (!survey)
      return;

    for (const planeNode of survey.getDescendantsByType(SeismicPlaneNode))
    {
      const view = planeNode.getViewByTarget(this.renderTarget);
      if (view)
        view.update(args);
    }
  }
}
