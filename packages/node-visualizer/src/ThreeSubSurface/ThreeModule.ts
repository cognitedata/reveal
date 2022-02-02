//= ====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//= ====================================================================================

import CameraControls from 'camera-controls';
import * as THREE from 'three';

import { BaseModule } from '../Core/Module/BaseModule';
import { ViewFactory } from '../Core/Views/ViewFactory';
import { ThreeRenderTargetNode } from '../Three/Nodes/ThreeRenderTargetNode';
import { BaseRootNode } from '../Core/Nodes/BaseRootNode';
import { BaseRenderTargetNode } from '../Core/Nodes/BaseRenderTargetNode';

import { AxisNode } from '../Core/Nodes/Decorations/AxisNode';
import { CompassNode } from '../Core/Nodes/Decorations/CompassNode';

import { PointsNode } from '../SubSurface/Basics/PointsNode';
import { PolylinesNode } from '../SubSurface/Basics/PolylinesNode';
import { SurfaceNode } from '../SubSurface/Basics/SurfaceNode';
import { PotreeNode } from '../SubSurface/Basics/PotreeNode';

import { AxisThreeView } from '../Three/DecorationViews/AxisThreeView';
import { CompassThreeView } from '../Three/DecorationViews/CompassThreeView';
import { PointsThreeView } from './Basics/PointsThreeView';
import { PolylinesThreeView } from './Basics/PolylinesThreeView';
import { SurfaceThreeView } from './Basics/SurfaceThreeView';
import { PotreeThreeView } from './Basics/PotreeThreeView';

// Wells:
import { WellTrajectoryNode } from '../SubSurface/Wells/Nodes/WellTrajectoryNode';
import { PointLogNode } from '../SubSurface/Wells/Nodes/PointLogNode';
import { FloatLogNode } from '../SubSurface/Wells/Nodes/FloatLogNode';
import { DiscreteLogNode } from '../SubSurface/Wells/Nodes/DiscreteLogNode';

import { WellTrajectoryView } from './Wells/WellTrajectoryView';
import { PointLogView } from './Wells/PointLogView';
import { LogFilterView } from './Wells/LogFilterView';
import { CasingLogNode } from '../SubSurface/Wells/Nodes/CasingLogNode';
import { CasingLogView } from './Wells/CasingLogView';
import { BaseTargetNode } from '../Core/Nodes/BaseTargetNode';
import { CasingFilterLogNode } from '../SubSurface/Wells/Filters/CasingFilterLogNode';
import { PointFilterLogNode } from '../SubSurface/Wells/Filters/PointFilterLogNode';
import { FloatFilterLogNode } from '../SubSurface/Wells/Filters/FloatFilterLogNode';
import { DiscreteFilterLogNode } from '../SubSurface/Wells/Filters/DiscreteFilterLogNode';
import { FilterLogFilterView } from './Wells/FilterLogFilterView';
import { SeismicCubePlaneView } from './Seismic/SeismicCubePlaneView';
import { SeismicPlaneNode } from '../SubSurface/Seismic/Nodes/SeismicPlaneNode';
import { SeismicCubeNode } from '../SubSurface/Seismic/Nodes/SeismicCubeNode';
import { SeismicCubeView } from './Seismic/SeismicCubeView';
import { SurveyNode } from '../SubSurface/Seismic/Nodes/SurveyNode';
import { SurveyView } from './Seismic/SurveyView';
import { ManipulatorFactory } from '../Three/Commands/Manipulators/ManipulatorFactory';
import { SeismicCubePlaneManipulator } from './Seismic/SeismicCubePlaneManipulator';
import { PointLogManipulator } from './Wells/PointLogManipulator';
import { SeismicOutlineView } from './Seismic/SeismicOutlineView';
import { SeismicOutlineNode } from '../SubSurface/Seismic/Nodes/SeismicOutlineNode';
import { Range3 } from '../Core/Geometry/Range3';

export class ThreeModule extends BaseModule {
  //= =================================================
  // OVERRIDES of BaseModule
  //= =================================================

  public /* override */ installPackages(): void {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    CameraControls.install({ THREE });
  }

  public /* override */ registerViews(factory: ViewFactory): void {
    // Decorations
    factory.register(
      AxisNode.className,
      AxisThreeView,
      ThreeRenderTargetNode.className
    );
    factory.register(
      CompassNode.className,
      CompassThreeView,
      ThreeRenderTargetNode.className
    );

    // Simple:
    factory.register(
      PointsNode.className,
      PointsThreeView,
      ThreeRenderTargetNode.className
    );
    factory.register(
      PolylinesNode.className,
      PolylinesThreeView,
      ThreeRenderTargetNode.className
    );
    factory.register(
      SurfaceNode.className,
      SurfaceThreeView,
      ThreeRenderTargetNode.className
    );
    factory.register(
      PotreeNode.className,
      PotreeThreeView,
      ThreeRenderTargetNode.className
    );

    // Wells:
    factory.register(
      WellTrajectoryNode.className,
      WellTrajectoryView,
      ThreeRenderTargetNode.className
    );
    factory.register(
      PointLogNode.className,
      PointLogView,
      ThreeRenderTargetNode.className
    );
    factory.register(
      FloatLogNode.className,
      LogFilterView,
      ThreeRenderTargetNode.className
    );
    factory.register(
      DiscreteLogNode.className,
      LogFilterView,
      ThreeRenderTargetNode.className
    );
    factory.register(
      CasingLogNode.className,
      CasingLogView,
      ThreeRenderTargetNode.className
    );

    // Log filters
    factory.register(
      PointFilterLogNode.className,
      FilterLogFilterView,
      ThreeRenderTargetNode.className
    );
    factory.register(
      FloatFilterLogNode.className,
      FilterLogFilterView,
      ThreeRenderTargetNode.className
    );
    factory.register(
      DiscreteFilterLogNode.className,
      FilterLogFilterView,
      ThreeRenderTargetNode.className
    );
    factory.register(
      CasingFilterLogNode.className,
      FilterLogFilterView,
      ThreeRenderTargetNode.className
    );

    // Seismic
    factory.register(
      SeismicPlaneNode.className,
      SeismicCubePlaneView,
      ThreeRenderTargetNode.className
    );
    factory.register(
      SeismicCubeNode.className,
      SeismicCubeView,
      ThreeRenderTargetNode.className
    );
    factory.register(
      SurveyNode.className,
      SurveyView,
      ThreeRenderTargetNode.className
    );
    factory.register(
      SeismicOutlineNode.className,
      SeismicOutlineView,
      ThreeRenderTargetNode.className
    );

    const manipulatorFactory = ManipulatorFactory.instance;
    manipulatorFactory.register(
      SeismicPlaneNode.className,
      SeismicCubePlaneManipulator,
      ThreeRenderTargetNode.className
    );
    manipulatorFactory.register(
      PointLogNode.className,
      PointLogManipulator,
      ThreeRenderTargetNode.className
    );
  }

  public /* override */ initializeWhenPopulated(root: BaseRootNode): void {
    document.body.onresize = () => {
      for (const target of root.targets.getChildrenByType(BaseRenderTargetNode))
        target.invalidate();
    };
  }

  public /* override */ setDefaultVisible(root: BaseRootNode): void {
    // Set all axis visible
    for (const target of root.targets.getChildrenByType(BaseTargetNode)) {
      for (const node of root.getDescendantsByType(AxisNode))
        node.setVisibleInteractive(true, target);
      for (const node of root.getDescendantsByType(CompassNode))
        node.setVisibleInteractive(true, target);
    }
  }

  public /* override */ createRenderTargetNode(): BaseRenderTargetNode | null {
    const fractionRange = Range3.createByMinAndMax(0, 0, 1, 1);
    return new ThreeRenderTargetNode(fractionRange);
  }
}
