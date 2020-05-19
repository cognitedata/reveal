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

import { BaseGroupThreeView } from "./../BaseGroupThreeView";
import { BaseLogNode } from "../../Nodes/Wells/Wells/BaseLogNode";
import { WellRenderStyle } from "../../Nodes/Wells/Wells/WellRenderStyle";
import { ThreeConverter } from "./../ThreeConverter";
import { Range3 } from '../../Core/Geometry/Range3';
import { Vector3 } from "../../Core/Geometry/Vector3";
import { WellTrajectory } from "../../Nodes/Wells/Logs/WellTrajectory";
import { Range1 } from "../../Core/Geometry/Range1";

export abstract class BaseLogThreeView extends BaseGroupThreeView
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  // Caching the bounding box of the scene
  private cameraDirection: Vector3 = new Vector3(0, 0, 1); // Direction to the center
  protected cameraPosition: Vector3 = new Vector3(0, 0, 1);

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get style(): WellRenderStyle { return super.getStyle() as WellRenderStyle; }

  protected get wellTrajectory(): WellTrajectory | null
  {
    const node = this.getNode() as BaseLogNode;
    const wellTrajectoryNode = node.wellTrajectory;
    if (!wellTrajectoryNode)
      return null;

    return wellTrajectoryNode.data;
  }

  protected get bandRange(): Range1 | undefined
  {
    const node = this.getNode() as BaseLogNode;
    const wellTrajectoryNode = node.wellTrajectory;
    if (!wellTrajectoryNode)
      return undefined;

    const wellRenderStyle = wellTrajectoryNode.getRenderStyle(this.renderTarget.targetId) as WellRenderStyle;
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

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  public /*override*/ mustTouch(): boolean
  {
    const wellTrajectory = this.wellTrajectory;
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
}
