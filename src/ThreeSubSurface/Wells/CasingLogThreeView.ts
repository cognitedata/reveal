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
import Color from "color";

import { Range3 } from "@/Core/Geometry/Range3";

import { BaseGroupThreeView } from "@/Three/BaseViews/BaseGroupThreeView";

import { CasingLogNode } from "@/SubSurface/Wells/Nodes/CasingLogNode";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";

import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { RenderSample } from "@/SubSurface/Wells/Samples/RenderSample";
import { Colors } from "@/Core/Primitives/Colors";
import { TrajectoryBufferGeometry } from "@/ThreeSubSurface/Wells/Helpers/TrajectoryBufferGeometry";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { WellTrajectoryStyle } from "@/SubSurface/Wells/Styles/WellTrajectoryStyle";
import { CasingLogStyle } from "@/SubSurface/Wells/Styles/CasingLogStyle";
import { WellTrajectory } from "@/SubSurface/Wells/Logs/WellTrajectory";
import { CasingLog } from '@/SubSurface/Wells/Logs/CasingLog';
import { WellTrajectoryThreeView } from "@/ThreeSubSurface/Wells/WellTrajectoryThreeView";
import { ViewInfo } from '@/Core/Views/ViewInfo';

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
    return parent != null && parent.isVisible(this.renderTarget);
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

    const {node} = this;
    const {trajectory} = node;
    if (!trajectory)
      return undefined;

    const {wellNode} = this.node;
    if (!wellNode)
      return undefined;

    const {log} = node;
    if (!log)
      return undefined;

    const boundingBox = new Range3();
    let maxSampleRadius = 0;
    const position = Vector3.newZero;

    for (let i = log.samples.length - 1; i >= 0; i--)
    {
      const sample = log.getAt(i);
      if (sample.isMdEmpty || sample.isEmpty)
        continue;

      maxSampleRadius = Math.max(maxSampleRadius, sample.radius);
      if (trajectory.getPositionAtMd(sample.md, position))
        boundingBox.add(position);
      if (trajectory.getPositionAtMd(sample.baseMd, position))
        boundingBox.add(position);
    }
    boundingBox.expandByMargin(maxSampleRadius + this.trajectoryRadius);
    boundingBox.translate(wellNode.origin);
    return boundingBox;
  }

  public /*override*/ onShowInfo(viewInfo: ViewInfo, intersection: THREE.Intersection): void
  {
    const md = WellTrajectoryThreeView.startPickingAndReturnMd(this, viewInfo, intersection);
    if (md === undefined)
      return;

    const {node} = this;
    viewInfo.addHeader(node.displayName);

    const {log} = node;
    if (!log)
      return;

    const sample = log.getConcreteSampleByMd(md);
    if (!sample)
      return;

    viewInfo.addText("  Name", sample.name);
    viewInfo.addText("  Radius", Number.isNaN(sample.radius) || sample.radius === 0 ? "No casing" : sample.radius.toFixed(3));
    viewInfo.addText("  Comments", sample.comments);
    viewInfo.addText("  Status comment", sample.currentStatusComment);
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3DCore(): THREE.Object3D | null
  {
    const {node} = this;
    const {wellNode} = node;
    if (!wellNode)
      return null;

    const {style} = this;
    if (!style)
      return null;

    const color = node.getColorByColorType(style.colorType);
    const {trajectory} = node;
    if (!trajectory)
      return null;

    const {log} = node;
    if (!log)
      throw Error("Well trajectory is missing");

    const parent = new THREE.Group();
    const samples = this.createRenderSamples(trajectory, log, color);
    if (samples && samples.length > 0)
    {
      const geometry = new TrajectoryBufferGeometry(samples);
      const material = new THREE.MeshStandardMaterial({
        color: ThreeConverter.toThreeColor(Colors.white),
        vertexColors: true,
        transparent: true,
        opacity: style.opacity
      });
      const mesh = new THREE.Mesh(geometry, material);
      parent.add(mesh);
    }
    parent.position.copy(this.transformer.to3D(wellNode.origin));
    return parent;
  }

  //==================================================
  // INSTANCE METHODS: Creators
  //==================================================

  public createRenderSamples(trajectory: WellTrajectory, log: CasingLog, color: Color): RenderSample[]
  {
    const {trajectoryRadius} = this;

    const samples: RenderSample[] = [];
    for (let logIndex = 0; logIndex < log.length; logIndex++)
    {
      const sample = log.getAt(logIndex);
      if (sample.isMdEmpty)
        continue;

      if (Number.isNaN(sample.baseMd))
        continue;

      if (Number.isNaN(sample.radius))
        continue;

      const sampleRadius = sample.radius + trajectoryRadius;
      const topPosition = Vector3.newZero;
      if (trajectory.getPositionAtMd(sample.md, topPosition))
        samples.push(new RenderSample(topPosition, sample.md, sampleRadius, color));

      // Push in all values between <sample.md, sample.baseMd>
      for (let wellIndex = 0; wellIndex < trajectory.length; wellIndex++)
      {
        const trajectorySample = trajectory.getAt(wellIndex);
        if (trajectorySample.md >= sample.baseMd)
          break; // Too far
        if (sample.md < trajectorySample.md)
          samples.push(new RenderSample(trajectorySample.point.clone(), trajectorySample.md, sampleRadius, color));
      }
      const basePosition = Vector3.newZero;
      if (!trajectory.getPositionAtMd(sample.baseMd, basePosition))
        continue;

      // Add a nan value to the end to terminate it
      samples.push(new RenderSample(basePosition, sample.baseMd, sampleRadius, color));
      samples.push(new RenderSample(basePosition.clone(), sample.baseMd, 0, color));
    }
    const {transformer} = this;
    for (const sample of samples)
      transformer.transformRelativeTo3D(sample.point);
    return samples;
  }

  // public createRenderSamples(trajectory: WellTrajectory, log: CasingLog, color: Color): RenderSample[]
  // {
  //   let wellIndex = 0;
  //   const samples: RenderSample[] = [];
  //   for (let logIndex = 0; logIndex < log.length - 1; logIndex++)
  //   {
  //     const minSample = log.getAt(logIndex);
  //     if (Number.isNaN(minSample.md))
  //       continue;

  //     const maxSample = log.getAt(logIndex + 1);
  //     if (Number.isNaN(maxSample.md))
  //       continue;

  //     const position = Vector3.newZero;
  //     if (!trajectory.getPositionAtMd(minSample.md, position))
  //       continue;

  //     samples.push(new RenderSample(position, minSample.md, minSample.radius, color));
  //     if (minSample.isEmpty)
  //       continue;

  //     // Push inn all values between <minSample.md, maxSample.md>
  //     for (; wellIndex < trajectory.length; wellIndex++)
  //     {
  //       const trajectorySample = trajectory.getAt(wellIndex);
  //       if (trajectorySample.md >= maxSample.md)
  //         break; // Too far
  //       if (trajectorySample.md > minSample.md)
  //         samples.push(new RenderSample(trajectorySample.point.clone(), trajectorySample.md, minSample.radius, color));
  //     }
  //     if (logIndex == log.length - 1)
  //     {
  //       // Push the last
  //       const position = Vector3.newZero;
  //       if (trajectory.getPositionAtMd(maxSample.md, position))
  //         samples.push(new RenderSample(position, maxSample.md, maxSample.radius, color));
  //       break;
  //     }
  //   }
  //   const transformer = this.transformer;
  //   for (const sample of samples)
  //     transformer.transformRelativeTo3D(sample.point);
  //   return samples;
  // }
  //==================================================
  // INSTANCE METHODS
  //==================================================

  protected get trajectoryRadius(): number
  {
    const {node} = this;
    if (!node)
      return 0;

    const {trajectoryNode} = node;
    if (!trajectoryNode)
      return 0;

    const wellRenderStyle = trajectoryNode.getRenderStyle(this.targetId) as WellTrajectoryStyle;
    if (!wellRenderStyle)
      return 0;

    return wellRenderStyle.radius;
  }
}
