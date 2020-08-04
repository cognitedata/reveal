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
import { BaseView } from "@/Core/Views/BaseView";
import { SurveyNode } from '@/SubSurface/Seismic/Nodes/SurveyNode';

export class SurveyView extends BaseView
{
  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  private get node(): SurveyNode { return super.getNode() as SurveyNode; }

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
  }

  protected /*override*/ onShowCore(): void
  {
    super.onShowCore();
  }

  protected /*override*/ onHideCore(): void
  {
    super.onHideCore();
  }
}
