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

import { Vector3 } from "@/Core/Geometry/Vector3";
import { Range3 } from "@/Core/Geometry/Range3";

import { BaseGroupThreeView } from "@/Three/BaseViews/BaseGroupThreeView";

import { PointLogNode } from "@/Nodes/Wells/Wells/PointLogNode";
import { WellRenderStyle } from "@/Nodes/Wells/Wells/WellRenderStyle";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";

import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";

export class PointLogFilterView extends BaseGroupThreeView
{
  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get node(): PointLogNode { return super.getNode() as PointLogNode; }
  protected get style(): WellRenderStyle { return super.getStyle() as WellRenderStyle; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  public get /*override*/ isVisible(): boolean
  {
    const parent = this.node.trajectoryNode;
    return parent != null && parent.isVisible(this.renderTarget)
  }

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    super.updateCore(args);
  }

  //==================================================
  // OVERRIDES of Base3DView
  //==================================================

  public /*override*/ calculateBoundingBoxCore(): Range3 | undefined
  {
    const node = this.node;
    const trajectory = node.trajectory;
    if (!trajectory)
      return undefined;

    const log = node.data;
    if (!log)
      return undefined;

    const range = new Range3();
    const position: Vector3 = Vector3.newZero;
    for (let i = 0; i < log.samples.length; i++)
    {
      const sample = log.getAt(i);
      if (trajectory.getPositionAtMd(sample.md, position))
        range.add(position);
    }
    const radius = Math.max(10, this.trajectoryRadius * 2);
    range.expandByMargin(radius);
    return range;
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3DCore(): THREE.Object3D | null
  {
    const node = this.node;
    const color = node.color;
    const trajectory = node.trajectory;
    if (!trajectory)
      return null;

    const log = node.data;
    if (!log)
      throw Error("Well trajectory is missing");

    const group = new THREE.Group();

    const radius = Math.max(10, this.trajectoryRadius * 2);
    const geometry = new THREE.SphereGeometry(radius, 16, 8);
    const material = new THREE.MeshPhongMaterial({ color: ThreeConverter.toColor(color) });

    const up = new Vector3(0, 0, 1);
    const position: Vector3 = Vector3.newZero;
    const tangent: Vector3 = Vector3.newZero;
    for (let i = 0; i < log.samples.length; i++)
    {

      const sample = log.getAt(i);
      if (!trajectory.getPositionAtMd(sample.md, position))
        continue;

      if (!trajectory.getTangentAtMd(sample.md, tangent))
        continue;

      const sphere = new THREE.Mesh(geometry, material);
      sphere.scale.z = 0.5;

      if (Math.abs(tangent.z) < 0.999)
      {
        const axis = up.getCross(tangent);
        // determine the amount to rotate
        const radians = Math.acos(tangent.getDot(up));
        sphere.rotateOnAxis(ThreeConverter.toVector(axis), radians);
      }
      ThreeConverter.copy(sphere.position, position);
      group.add(sphere);
    }
    return group;
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  protected get trajectoryRadius(): number
  {
    const node = this.node;
    if (!node)
      return 0;

    const trajectoryNode = node.trajectoryNode;
    if (!trajectoryNode)
      return 0;

    const wellRenderStyle = trajectoryNode.getRenderStyle(this.targetId) as WellRenderStyle;
    if (!wellRenderStyle)
      return 0;

    return wellRenderStyle.radius;
  }
}
