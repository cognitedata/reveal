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

import { BaseView } from "../Views/BaseView";
import { PolylinesNode } from "./PolylinesNode";
import { PolylinesRenderStyle } from "./PolylinesRenderStyle";

export class PolylinesView3 extends BaseView
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // PROPERTIES
  //==================================================

  protected get node(): PolylinesNode | null { return super.getNode() as PolylinesNode; }
  protected get style(): PolylinesRenderStyle | null { return super.getStyle() as PolylinesRenderStyle; }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  public /*override*/ initialize(): void
  {
    const node = this.node;
    if (!node)
      return;

    const polylines = node.data;
    if (!polylines)
      return;

    const style = this.style;
    if (!style)
      return;
  }
}