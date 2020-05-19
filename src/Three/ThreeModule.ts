
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

import CameraControls from 'camera-controls';
import * as THREE from 'three';

import { BaseModule } from "../Core/Module/BaseModule";
import { ViewFactory } from "../Core/Views/ViewFactory";
import { ThreeRenderTargetNode } from "./ThreeRenderTargetNode";
import { BaseRootNode } from "../Core/Nodes/BaseRootNode";
import { RootNode } from "../TreeNodes/RootNode";
import { BaseRenderTargetNode } from "../Core/Nodes/BaseRenderTargetNode";

import { AxisNode } from '../Nodes/AxisNode';
import { PointsNode } from '../Nodes/PointsNode';
import { PolylinesNode } from "../Nodes/PolylinesNode";
import { SurfaceNode } from '../Nodes/SurfaceNode';
import { PotreeNode } from "../Nodes/PotreeNode";

import { AxisThreeView } from './AxisThreeView';
import { PointsThreeView } from './PointsThreeView';
import { PolylinesThreeView } from "./PolylinesThreeView";
import { SurfaceThreeView } from './SurfaceThreeView';
import { PotreeThreeView } from "./PotreeThreeView";

// Wells:

import { WellTrajectoryNode } from "../Nodes/Wells/Wells/WellTrajectoryNode";
import { PointLogNode } from "../Nodes/Wells/Wells/PointLogNode";
import { FloatLogNode } from "../Nodes/Wells/Wells/FloatLogNode";
import { DiscreteLogNode } from "../Nodes/Wells/Wells/DiscreteLogNode";

import { WellTrajectoryThreeView } from './Wells/WellTrajectoryThreeView';
import { PointLogThreeView } from './Wells/PointLogThreeView';
import { FloatLogThreeView } from './Wells/FloatLogThreeView';
import { DiscreteLogThreeView } from './Wells/DiscreteLogThreeView';


export class ThreeModule extends BaseModule
{
  //==================================================
  // OVERRIDES of BaseModule
  //==================================================

  protected /*override*/ installPackagesCore(): void
  {
    CameraControls.install({ THREE });
  }

  protected /*override*/ registerViewsCore(factory: ViewFactory): void
  {
    factory.register(AxisNode.name, AxisThreeView, ThreeRenderTargetNode.name);
    factory.register(PointsNode.name, PointsThreeView, ThreeRenderTargetNode.name);
    factory.register(PolylinesNode.name, PolylinesThreeView, ThreeRenderTargetNode.name);
    factory.register(SurfaceNode.name, SurfaceThreeView, ThreeRenderTargetNode.name);
    factory.register(PotreeNode.name, PotreeThreeView, ThreeRenderTargetNode.name);

    // Wells:

    factory.register(WellTrajectoryNode.name, WellTrajectoryThreeView, ThreeRenderTargetNode.name);
    factory.register(PointLogNode.name, PointLogThreeView, ThreeRenderTargetNode.name);
    factory.register(FloatLogNode.name, FloatLogThreeView, ThreeRenderTargetNode.name);
    factory.register(DiscreteLogNode.name, DiscreteLogThreeView, ThreeRenderTargetNode.name);
  }

  protected /*override*/ createRootCore(): BaseRootNode
  {
    return new RootNode();
  }

  public initializeWhenPopulated(root: BaseRootNode): void
  {
    root.initializeRecursive();
    document.body.onresize = () => {
      for (const target of root.targets.getChildrenByType(BaseRenderTargetNode))
        target.onResize();
    };
  }
}

