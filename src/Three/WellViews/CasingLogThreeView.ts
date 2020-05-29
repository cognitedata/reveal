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

import { BaseGroupThreeView } from "@/Three/BaseViews/BaseGroupThreeView";

import { CasingLogNode } from "@/Nodes/Wells/Wells/CasingLogNode";
import { WellRenderStyle } from "@/Nodes/Wells/Wells/WellRenderStyle";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";

import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { RenderSample } from "@/Nodes/Wells/Samples/RenderSample";
import { Colors } from "@/Core/Primitives/Colors";
import { TrajectoryBufferGeometry } from "@/Three/WellViews/TrajectoryBufferGeometry";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { WellTrajectoryNode } from "@/Nodes/Wells/Wells/WellTrajectoryNode";

export class CasingLogThreeView extends BaseGroupThreeView
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get node(): CasingLogNode { return super.getNode() as CasingLogNode; }
  protected get style(): WellRenderStyle { return super.getStyle() as WellRenderStyle; }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  public get /*override*/ isVisible(): boolean
  {
    const parent = this.node.getAncestorByType(WellTrajectoryNode);
    return parent != null && parent.isVisible(this.renderTarget)
  }

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    super.updateCore(args);
  }

  public calculateBoundingBoxCore(): Range3 | undefined
  {
    const node = this.node;
    const trajectory = node.trajectory;
    if (!trajectory)
      return undefined;

    const log = node.data;
    if (!log)
      return undefined;

    const range = new Range3();
    let maxRadius = 0;
    const position = Vector3.newZero;

    for (let i = 0; i < log.samples.length; i++)
    {
      const sample = log.getAt(i);
      maxRadius = Math.max(maxRadius, sample.value);
      if (trajectory.getPositionAtMd(sample.md, position))
        range.add(position);
    }
    range.expandByMargin(maxRadius);
    return range;
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3DCore(): THREE.Object3D | null
  {
    const node = this.node;
    const color = Colors.grey; //node.color;
    const trajectory = node.trajectory;
    if (!trajectory)
      return null;

    const log = node.data;
    if (!log)
      throw Error("Well trajectory is missing");

    const samples: RenderSample[] = [];
    let wellIndex = 0;
    const position: Vector3 = Vector3.newZero;

    for (let logIndex = 0; logIndex < log.length - 1; logIndex++)
    {
      const minSample = log.getAt(logIndex);
      const maxSample = log.getAt(logIndex + 1);

      if (!trajectory.getPositionAtMd(minSample.md, position))
        continue;

      samples.push(new RenderSample(position.clone(), minSample.md, minSample.value, color));
      if (minSample.isEmpty)
        continue;

      // Push inn all values between <minSample.md, maxSample.md>
      for (; wellIndex < trajectory.length; wellIndex++)
      {
        const trajectorySample = trajectory.getAt(wellIndex);
        if (trajectorySample.md >= maxSample.md)
          break; // Too far
        if (trajectorySample.md > minSample.md)
          samples.push(new RenderSample(trajectorySample.point, trajectorySample.md, minSample.value, color));
      }
      if (logIndex == log.length - 1)
      {
        // Push the last
        if (trajectory.getPositionAtMd(maxSample.md, position))
          samples.push(new RenderSample(position.clone(), maxSample.md, maxSample.value, color));
        break;
      }
    }
    const geometry = new TrajectoryBufferGeometry(samples);
    const material = new THREE.MeshStandardMaterial({
      color: ThreeConverter.toColor(Colors.white),
      vertexColors: THREE.VertexColors,
      transparent: true,
      opacity: 0.7
    });
    return new THREE.Mesh(geometry, material);
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
