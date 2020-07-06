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
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";

import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { RenderSample } from "@/Nodes/Wells/Samples/RenderSample";
import { Colors } from "@/Core/Primitives/Colors";
import { TrajectoryBufferGeometry } from "@/Three/WellViews/Helpers/TrajectoryBufferGeometry";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { WellTrajectoryStyle } from "@/Nodes/Wells/Styles/WellTrajectoryStyle";
import { CasingLogStyle } from "@/Nodes/Wells/Styles/CasingLogStyle";
import { WellTrajectory } from "@/Nodes/Wells/Logs/WellTrajectory";
import { FloatLog } from "@/Nodes/Wells/Logs/FloatLog";
import Color from "color";

export class CasingLogThreeView extends BaseGroupThreeView
{
  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get node(): CasingLogNode { return super.getNode() as CasingLogNode; }
  private get style(): CasingLogStyle { return super.getStyle() as CasingLogStyle; }

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
    if (!this.isVisible)
      return undefined;

    const node = this.node;
    const trajectory = node.trajectory;
    if (!trajectory)
      return undefined;

    const wellNode = this.node.wellNode;
    if (!wellNode)
      return undefined;

    const log = node.data;
    if (!log)
      return undefined;

    const boundingBox = new Range3();
    let maxRadius = 0;
    const position = Vector3.newZero;

    for (let i = log.samples.length - 1; i >= 0; i--)
    {
      const sample = log.getAt(i);
      if (sample.isMdEmpty || sample.isEmpty)
        continue;

      maxRadius = Math.max(maxRadius, sample.value);
      if (trajectory.getPositionAtMd(sample.md, position))
      boundingBox.add(position);
    }
    boundingBox.expandByMargin(maxRadius);
    boundingBox.translate(wellNode.origin);
    return boundingBox;
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3DCore(): THREE.Object3D | null
  {
    const node = this.node;
    const wellNode = node.wellNode;
    if (!wellNode)
      return null;

    const style = this.style;
    if (!style)
      return null;

    const color = node.getColorByColorType(style.colorType);
    const trajectory = node.trajectory;
    if (!trajectory)
      return null;

    const log = node.data;
    if (!log)
      throw Error("Well trajectory is missing");

    const samples = this.createRenderSamples(trajectory, log, color);
    const geometry = new TrajectoryBufferGeometry(samples);
    const material = new THREE.MeshStandardMaterial({
      color: ThreeConverter.to3DColor(Colors.white),
      vertexColors: THREE.VertexColors,
      transparent: true,
      opacity: style.opacity
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(this.transformer.to3D(wellNode.origin));
    return mesh;
  }

  //==================================================
  // INSTANCE METHODS: Creators
  //==================================================

  public createRenderSamples(trajectory: WellTrajectory, log: FloatLog, color: Color): RenderSample[]
  {
    let wellIndex = 0;
    const samples: RenderSample[] = [];
    for (let logIndex = 0; logIndex < log.length - 1; logIndex++)
    {
      const minSample = log.getAt(logIndex);
      if (Number.isNaN(minSample.md))
        continue;

      const maxSample = log.getAt(logIndex + 1);
      if (Number.isNaN(maxSample.md))
        continue;

      const position = Vector3.newZero;
      if (!trajectory.getPositionAtMd(minSample.md, position))
        continue;

      samples.push(new RenderSample(position, minSample.md, minSample.value, color));
      if (minSample.isEmpty)
        continue;

      // Push inn all values between <minSample.md, maxSample.md>
      for (; wellIndex < trajectory.length; wellIndex++)
      {
        const trajectorySample = trajectory.getAt(wellIndex);
        if (trajectorySample.md >= maxSample.md)
          break; // Too far
        if (trajectorySample.md > minSample.md)
          samples.push(new RenderSample(trajectorySample.point.clone(), trajectorySample.md, minSample.value, color));
      }
      if (logIndex == log.length - 1)
      {
        // Push the last
        const position = Vector3.newZero;
        if (trajectory.getPositionAtMd(maxSample.md, position))
          samples.push(new RenderSample(position, maxSample.md, maxSample.value, color));
        break;
      }
    }
    const transformer = this.transformer;
    for (const sample of samples)
      transformer.transformRelativeTo3D(sample.point);
    return samples;
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

    const wellRenderStyle = trajectoryNode.getRenderStyle(this.targetId) as WellTrajectoryStyle;
    if (!wellRenderStyle)
      return 0;

    return wellRenderStyle.radius;
  }
}
