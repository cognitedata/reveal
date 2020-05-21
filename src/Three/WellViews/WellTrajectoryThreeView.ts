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

import * as THREE from "three";

import { Range3 } from "@/Core/Geometry/Range3";
import { Range1 } from "@/Core/Geometry/Range1";
import { Vector3 } from "@/Core/Geometry/Vector3";

import { BaseLogNode } from "@/Nodes/Wells/Wells/BaseLogNode";
import { FloatLogNode } from "@/Nodes/Wells/Wells/FloatLogNode";
import { DiscreteLogNode } from "@/Nodes/Wells/Wells/DiscreteLogNode";
import { WellRenderStyle } from "@/Nodes/Wells/Wells/WellRenderStyle";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";

import { WellTrajectoryNode } from "@/Nodes/Wells/Wells/WellTrajectoryNode";

import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { ThreeLabel } from "@/Three/Utilities/ThreeLabel";
import { LogRender } from "@/Three/WellViews/LogRender";
import { BaseLogThreeView } from "@/Three/WellViews/BaseLogThreeView";

export class WellTrajectoryThreeView extends BaseLogThreeView
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

  private get node(): WellTrajectoryNode { return super.getNode() as WellTrajectoryNode; }
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
    //return super.calculateBoundingBoxCore();
    const boundingBox = this.node.boundingBox.copy();
    if (!boundingBox)
      return undefined;

    boundingBox.expandByMargin(this.style.radius);

    boundingBox.z.max += 60;
    return boundingBox;
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3DCore(): THREE.Object3D | null
  {
    const group = new THREE.Group();
    this.addWellLabel(group);
    this.addTrajectory(group);
    this.addBand(group);
    return group;
  }

  public /*override*/ mustTouch(): boolean
  {
    const node = this.node;
    const trajectory = node.data;
    if (!trajectory)
      return false;

    const target = this.renderTarget;
    const camera = target.activeCamera;
    const cameraPosition = ThreeConverter.fromVector(camera.position);
    const cameraDirection = trajectory.range.center;

    cameraDirection.substract(cameraPosition);
    cameraDirection.normalize();

    // Check if camera has move slightly
    const angle = Math.acos(cameraDirection.getDot(this.cameraDirection));
    if (angle < Math.PI / 100)
      return false;

    this.cameraDirection = cameraDirection;
    this.cameraPosition = cameraPosition;
    return true;
  }

  //==================================================
  // INSTANCE FUNCTIONS
  //==================================================

  private addWellLabel(group: THREE.Group)
  {
    const node = this.node;
    const well = node.well;
    if (!well)
      return;

    const label = ThreeLabel.createByPositionAndAlignment(well.name, well.wellHead, 1, 60, false);
    if (!label)
      return;

    group.add(label);
  }

  private addTrajectory(group: THREE.Group): void
  {
    const node = this.node;
    const style = this.style;
    const color = node.color;

    const trajectory = node.data;
    if (!trajectory)
      return;

    const points = Array<THREE.Vector3>();
    for (let i = 0; i < trajectory.samples.length; i++)
    {
      const sample = trajectory.getAt(i);
      points.push(ThreeConverter.toVector(sample.point));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 100, style.radius, 16);
    const material = new THREE.MeshStandardMaterial({ color: ThreeConverter.toColor(color)});
    group.add(new THREE.Mesh(geometry, material));
  }

  private addBand(group: THREE.Group): void
  {
    const node = this.node;
    const style = this.style;

    const bandRange = this.bandRange;
    if (!bandRange)
      return;

    const trajectory = node.data;
    if (!trajectory)
      throw Error("Well trajectory is missing");

    const mdRange = new Range1();
    for (const logNode of node.getDescendantsByType(BaseLogNode))
    {
      const log = logNode.data;
      if (!log)
        continue;

      if (!logNode.isVisible(this.renderTarget))
        continue;

      mdRange.addRange(log.mdRange);
    }
    if (mdRange.isEmpty)
      return;

    const useRightBand = true;
    const useLeftBand = true;

    const logRender = new LogRender(trajectory, this.cameraPosition, bandRange, mdRange);
    logRender.addBand(group, useRightBand, useLeftBand);

    for (const rightBand of [true, false])
    {
      const canvas = logRender.createCanvas();
      for (const logNode of node.getDescendantsByType(FloatLogNode))
      {
        if (!logNode.isVisible(this.renderTarget))
          continue;
        if (rightBand)
          logRender.addFloatLog(canvas, logNode.data, logNode.color);
      }
      for (const logNode of node.getDescendantsByType(DiscreteLogNode))
      {
        if (!logNode.isVisible(this.renderTarget))
          continue;

        if (!rightBand)
          logRender.addDiscreteLog(canvas, logNode.data);
      }
      logRender.addAnnotation(canvas, rightBand);
      LogRender.setCanvas(group, canvas, rightBand);
    }
  }
}
