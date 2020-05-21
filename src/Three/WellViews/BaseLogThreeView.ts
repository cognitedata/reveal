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

import { Range1 } from "@/Core/Geometry/Range1";
import { Range3 } from "@/Core/Geometry/Range3";

import { BaseGroupThreeView } from "@/Three/BaseViews/BaseGroupThreeView";

import { WellRenderStyle } from "@/Nodes/Wells/Wells/WellRenderStyle";
import { WellTrajectoryNode } from "@/Nodes/Wells/Wells/WellTrajectoryNode";

export abstract class BaseLogThreeView extends BaseGroupThreeView
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get style(): WellRenderStyle { return super.getStyle() as WellRenderStyle; }

  protected get bandRange(): Range1 | undefined
  {
    const node = this.getNode();
    if (!node)
      return undefined;

    const wellTrajectoryNode = node.getThisOrAncestorByType(WellTrajectoryNode);
    if (!wellTrajectoryNode)
      return undefined;

    const wellRenderStyle = wellTrajectoryNode.getRenderStyle(this.targetId) as WellRenderStyle;
    if (!wellRenderStyle)
      return undefined;

    return new Range1(wellRenderStyle.radius, 100);
  }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  public calculateBoundingBoxCore(): Range3 | undefined
  {
    return super.calculateBoundingBoxCore();
  }
}
