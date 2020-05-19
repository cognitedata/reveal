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

import * as THREE from 'three';

import { BaseLogThreeView } from "./BaseLogThreeView";
import { PointLogNode } from "../../Nodes/Wells/Wells/PointLogNode";
import { WellRenderStyle } from "../../Nodes/Wells/Wells/WellRenderStyle";
import { ThreeConverter } from "./../ThreeConverter";
import { NodeEventArgs } from "../../Core/Views/NodeEventArgs";
import { Range3 } from '../../Core/Geometry/Range3';
import { Vector3 } from "../../Core/Geometry/Vector3";
import { Range1 } from "../../Core/Geometry/Range1";
import { LogRender } from './LogRender';
import { Colors } from "../../Core/PrimitiveClasses/Colors";

export class PointLogThreeView extends BaseLogThreeView
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get node(): PointLogNode { return super.getNode() as PointLogNode; }
  protected get style(): WellRenderStyle { return super.getStyle() as WellRenderStyle; }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    super.updateCore(args);
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3DCore(): THREE.Object3D | null
  {
    const node = this.node;

    const trajectory = this.wellTrajectory;
    if (!trajectory)
      return null;

    const log = node.data;
    if (!log)
      throw Error("Well trajectory is missing");

    const bandRange = this.bandRange;
    if (!bandRange)
      return null;

    const group = new THREE.Group();
    const logRender = new LogRender(trajectory, this.cameraPosition, bandRange);
    logRender.addPointLog(group, log, Colors.blue);
    return group;
  }
}
