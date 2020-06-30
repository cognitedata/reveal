
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

import CameraControls from "camera-controls";
import * as THREE from "three";

import { BaseModule } from "@/Core/Module/BaseModule";
import { ViewFactory } from "@/Core/Views/ViewFactory";
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { BaseRootNode } from "@/Core/Nodes/BaseRootNode";
import { BaseRenderTargetNode } from "@/Core/Nodes/BaseRenderTargetNode";

import { AxisNode } from "@/Nodes/Decorations/AxisNode";
import { PointsNode } from "@/Nodes/Misc/PointsNode";
import { PolylinesNode } from "@/Nodes/Misc/PolylinesNode";
import { SurfaceNode } from "@/Nodes/Misc/SurfaceNode";
import { PotreeNode } from "@/Nodes/Misc/PotreeNode";

import { AxisThreeView } from "@/Three/DecorationViews/AxisThreeView";
import { PointsThreeView } from "@/Three/MiscViews/PointsThreeView";
import { PolylinesThreeView } from "@/Three/MiscViews/PolylinesThreeView";
import { SurfaceThreeView } from "@/Three/MiscViews/SurfaceThreeView";
import { PotreeThreeView } from "@/Three/MiscViews/PotreeThreeView";

// Wells:

import { WellTrajectoryNode } from "@/Nodes/Wells/Wells/WellTrajectoryNode";
import { PointLogNode } from "@/Nodes/Wells/Wells/PointLogNode";
import { FloatLogNode } from "@/Nodes/Wells/Wells/FloatLogNode";
import { DiscreteLogNode } from "@/Nodes/Wells/Wells/DiscreteLogNode";

import { WellTrajectoryThreeView } from "@/Three/WellViews/WellTrajectoryThreeView";
import { PointLogThreeView } from "@/Three/WellViews/PointLogThreeView";
import { LogFilterView } from "@/Three/WellViews/LogFilterView";
import { CasingLogNode } from "@/Nodes/Wells/Wells/CasingLogNode";
import { CasingLogThreeView } from "@/Three/WellViews/CasingLogThreeView";
import { BaseTargetNode } from "@/Core/Nodes/BaseTargetNode";
import { CasingFilterLogNode } from "@/Nodes/Wells/Filters/CasingFilterLogNode";
import { PointFilterLogNode } from "@/Nodes/Wells/Filters/PointFilterLogNode";
import { FloatFilterLogNode } from "@/Nodes/Wells/Filters/FloatFilterLogNode";
import { DiscreteFilterLogNode } from "@/Nodes/Wells/Filters/DiscreteFilterLogNode";
import { FilterLogFilterView } from "@/Three/WellViews/FilterLogFilterView";

export class ThreeModule extends BaseModule
{
  //==================================================
  // OVERRIDES of BaseModule
  //==================================================

  public /*override*/ installPackages(): void
  {
    CameraControls.install({ THREE });
  }

  public /*override*/ registerViews(factory: ViewFactory): void
  {
    factory.register(AxisNode.className, AxisThreeView, ThreeRenderTargetNode.className);
    factory.register(PointsNode.className, PointsThreeView, ThreeRenderTargetNode.className);
    factory.register(PolylinesNode.className, PolylinesThreeView, ThreeRenderTargetNode.className);
    factory.register(SurfaceNode.className, SurfaceThreeView, ThreeRenderTargetNode.className);
    factory.register(PotreeNode.className, PotreeThreeView, ThreeRenderTargetNode.className);

    // Wells:
    factory.register(WellTrajectoryNode.className, WellTrajectoryThreeView, ThreeRenderTargetNode.className);
    factory.register(PointLogNode.className, PointLogThreeView, ThreeRenderTargetNode.className);
    factory.register(FloatLogNode.className, LogFilterView, ThreeRenderTargetNode.className);
    factory.register(DiscreteLogNode.className, LogFilterView, ThreeRenderTargetNode.className);
    factory.register(CasingLogNode.className, CasingLogThreeView, ThreeRenderTargetNode.className);

    // Log filters
    factory.register(PointFilterLogNode.className, FilterLogFilterView, ThreeRenderTargetNode.className);
    factory.register(FloatFilterLogNode.className, FilterLogFilterView, ThreeRenderTargetNode.className);
    factory.register(DiscreteFilterLogNode.className, FilterLogFilterView, ThreeRenderTargetNode.className);
    factory.register(CasingFilterLogNode.className, FilterLogFilterView, ThreeRenderTargetNode.className);
  }

  public initializeWhenPopulated(root: BaseRootNode): void
  {
    for (const target of root.targets.getChildrenByType(BaseRenderTargetNode))
      target.onResize();

    document.body.onresize = () =>
    {
      for (const target of root.targets.getChildrenByType(BaseRenderTargetNode))
        target.onResize();
    };
  }

  public setDefaultVisible(root: BaseRootNode): void
  {
    // Set all axis visible
    for (const target of root.targets.getChildrenByType(BaseTargetNode))
      for (const node of root.getDescendantsByType(AxisNode))
        node.setVisibleInteractive(true, target);
  }
}

