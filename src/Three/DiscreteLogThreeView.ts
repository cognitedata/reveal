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

import { BaseGroupThreeView } from "./BaseGroupThreeView";
import { DiscreteLogNode } from "../Nodes/Wells/Wells/DiscreteLogNode";
import { WellRenderStyle } from "../Nodes/Wells/Wells/WellRenderStyle";
import { ThreeConverter } from "./ThreeConverter";
import { NodeEventArgs } from "../Core/Views/NodeEventArgs";
import { Range3 } from '../Core/Geometry/Range3';
import { Vector3 } from "../Core/Geometry/Vector3";
import { Range1 } from "../Core/Geometry/Range1";
import { LogRender } from './LogRender';

export class DiscreteLogThreeView extends BaseGroupThreeView
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  // Caching the bounding box of the scene
  private cameraDirection: Vector3 = new Vector3(0, 0, 1); // Direction to the center
  private cameraPosition: Vector3 = new Vector3(0, 0, 1);

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get node(): DiscreteLogNode { return super.getNode() as DiscreteLogNode; }
  protected get style(): WellRenderStyle { return super.getStyle() as WellRenderStyle; }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    super.updateCore(args);
  }

  public calculateBoundingBoxCore(): Range3 | undefined
  {
    return super.calculateBoundingBoxCore();
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  public /*override*/ mustTouch(): boolean
  {
    const node = this.node;

    const wellTrajectoryNode = node.wellTrajectory;
    if (!wellTrajectoryNode)
      return false;

    const wellTrajectory = wellTrajectoryNode.data;
    if (!wellTrajectory)
      return false;

    const target = this.renderTarget;
    const camera = target.activeCamera;
    const cameraPosition = ThreeConverter.fromVector(camera.position);
    const cameraDirection = wellTrajectory.range.center;

    cameraDirection.substract(cameraPosition);
    cameraDirection.normalize();

    // Check if camera has move slightly
    const angle = Math.acos(cameraDirection.getDot(this.cameraDirection));
    if (angle < Math.PI / 50)
      return false;

    this.cameraDirection = cameraDirection;
    this.cameraPosition = cameraPosition;
    return true;
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3DCore(): THREE.Object3D | null
  {
    const node = this.node;

    const wellTrajectoryNode = node.wellTrajectory;
    if (!wellTrajectoryNode)
      return null;

    const wellRenderStyle = wellTrajectoryNode.getRenderStyle() as WellRenderStyle;;
    if (!wellRenderStyle)
      return null;

    const trajectory = wellTrajectoryNode.data;
    if (!trajectory)
      return null;

    const log = node.data;
    if (!log)
      throw Error("Well trajectory is missing");

    const bandRange = new Range1(wellRenderStyle.radius, 100);
    const group = new THREE.Group();

    const logRender = new LogRender(trajectory, this.cameraPosition, bandRange);
    logRender.addSolidDiscreteLog(group, log, false);
    return group;
  }
}
