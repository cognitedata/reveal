
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

import { AxisNode } from "@/Core/Nodes/Decorations/AxisNode";
import { PointsNode } from "@/SubSurface/Basics/PointsNode";
import { PolylinesNode } from "@/SubSurface/Basics/PolylinesNode";
import { SurfaceNode } from "@/SubSurface/Basics/SurfaceNode";
import { PotreeNode } from "@/SubSurface/Basics/PotreeNode";

import { AxisThreeView } from "@/Three/DecorationViews/AxisThreeView";
import { PointsThreeView } from "@/ThreeSubSurface/Basics/PointsThreeView";
import { PolylinesThreeView } from "@/ThreeSubSurface/Basics/PolylinesThreeView";
import { SurfaceThreeView } from "@/ThreeSubSurface/Basics/SurfaceThreeView";
import { PotreeThreeView } from "@/ThreeSubSurface/Basics/PotreeThreeView";

// Wells:

import { WellTrajectoryNode } from "@/SubSurface/Wells/Nodes/WellTrajectoryNode";
import { PointLogNode } from "@/SubSurface/Wells/Nodes/PointLogNode";
import { FloatLogNode } from "@/SubSurface/Wells/Nodes/FloatLogNode";
import { DiscreteLogNode } from "@/SubSurface/Wells/Nodes/DiscreteLogNode";

import { WellTrajectoryThreeView } from "@/ThreeSubSurface/Wells/WellTrajectoryThreeView";
import { PointLogThreeView } from "@/ThreeSubSurface/Wells/PointLogThreeView";
import { LogFilterView } from "@/ThreeSubSurface/Wells/LogFilterView";
import { CasingLogNode } from "@/SubSurface/Wells/Nodes/CasingLogNode";
import { CasingLogThreeView } from "@/ThreeSubSurface/Wells/CasingLogThreeView";
import { BaseTargetNode } from "@/Core/Nodes/BaseTargetNode";
import { CasingFilterLogNode } from "@/SubSurface/Wells/Filters/CasingFilterLogNode";
import { PointFilterLogNode } from "@/SubSurface/Wells/Filters/PointFilterLogNode";
import { FloatFilterLogNode } from "@/SubSurface/Wells/Filters/FloatFilterLogNode";
import { DiscreteFilterLogNode } from "@/SubSurface/Wells/Filters/DiscreteFilterLogNode";
import { FilterLogFilterView } from "@/ThreeSubSurface/Wells/FilterLogFilterView";
import { SeismicCubePlaneView } from '@/ThreeSubSurface/Seismic/SeismicCubePlaneView';
import { SeismicPlaneNode } from '@/SubSurface/Seismic/Nodes/SeismicPlaneNode';
import { SeismicCubeNode } from '@/SubSurface/Seismic/Nodes/SeismicCubeNode';
import { SeismicCubeView } from '@/ThreeSubSurface/Seismic/SeismicCubeView';
import { SurveyNode } from '@/SubSurface/Seismic/Nodes/SurveyNode';
import { SurveyView } from '@/ThreeSubSurface/Seismic/SurveyView';

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

    // Seismic
    factory.register(SeismicPlaneNode.className, SeismicCubePlaneView, ThreeRenderTargetNode.className);
    factory.register(SeismicCubeNode.className, SeismicCubeView, ThreeRenderTargetNode.className);
    factory.register(SurveyNode.className, SurveyView, ThreeRenderTargetNode.className);
  }

  public initializeWhenPopulated(root: BaseRootNode): void
  {
    document.body.onresize = () =>
    {
      for (const target of root.targets.getChildrenByType(BaseRenderTargetNode))
        target.invalidate();
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

