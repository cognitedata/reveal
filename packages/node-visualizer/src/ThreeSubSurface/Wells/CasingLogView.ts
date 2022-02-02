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

import Color from 'color';
import { CasingLog } from '../../SubSurface/Wells/Logs/CasingLog';
import { WellTrajectory } from '../../SubSurface/Wells/Logs/WellTrajectory';
import { CasingLogNode } from '../../SubSurface/Wells/Nodes/CasingLogNode';
import { RenderSample } from '../../SubSurface/Wells/Samples/RenderSample';
import { CasingLogStyle } from '../../SubSurface/Wells/Styles/CasingLogStyle';
import { WellTrajectoryStyle } from '../../SubSurface/Wells/Styles/WellTrajectoryStyle';
import * as THREE from 'three';
import { BaseGroupThreeView } from '../../Three/BaseViews/BaseGroupThreeView';
import { ThreeConverter } from '../../Three/Utilities/ThreeConverter';
import { TrajectoryBufferGeometry } from '../../ThreeSubSurface/Wells/Helpers/TrajectoryBufferGeometry';

import { WellTrajectoryView } from '../../ThreeSubSurface/Wells/WellTrajectoryView';
import { Range3 } from '../../Core/Geometry/Range3';

import { Vector3 } from '../../Core/Geometry/Vector3';
import { Colors } from '../../Core/Primitives/Colors';
import { NodeEventArgs } from '../../Core/Views/NodeEventArgs';

import { ViewInfo } from '../../Core/Views/ViewInfo';
import { Changes } from '../../Core/Views/Changes';

export class CasingLogView extends BaseGroupThreeView {
  //= =================================================
  // INSTANCE PROPERTIES
  //= =================================================

  protected get node(): CasingLogNode {
    return super.getNode() as CasingLogNode;
  }

  private get style(): CasingLogStyle {
    return super.getStyle() as CasingLogStyle;
  }

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor() {
    super();
  }

  //= =================================================
  // OVERRIDES of BaseView
  //= =================================================

  public get /* override */ isVisible(): boolean {
    const parent = this.node.trajectoryNode;
    return parent != null && parent.isVisible(this.renderTarget);
  }

  protected /* override */ updateCore(args: NodeEventArgs): void {
    super.updateCore(args);
    if (args.isChanged(Changes.renderStyle, Changes.nodeColor)) this.touch();
  }

  //= =================================================
  // OVERRIDES of Base3DView
  //= =================================================

  public /* override */ calculateBoundingBoxCore(): Range3 | undefined {
    if (!this.isVisible) return undefined;

    const { node } = this;
    const { trajectory } = node;
    if (!trajectory) return undefined;

    const { style } = this;
    if (!style) return undefined;

    const { wellNode } = this.node;
    if (!wellNode) return undefined;

    const { log } = node;
    if (!log) return undefined;

    const boundingBox = new Range3();
    let maxSampleRadius = 0;
    const position = Vector3.newZero;

    for (let i = log.samples.length - 1; i >= 0; i--) {
      const sample = log.getAt(i);
      if (sample.isMdEmpty || sample.isEmpty) continue;

      maxSampleRadius = Math.max(sample.radius, maxSampleRadius);
      if (trajectory.getPositionAtMd(sample.md, position))
        boundingBox.add(position);
      if (trajectory.getPositionAtMd(sample.baseMd, position))
        boundingBox.add(position);
    }
    const maxRadius =
      maxSampleRadius * style.radiusFactor.value + this.trajectoryRadius;
    boundingBox.expandByMargin(maxRadius);
    boundingBox.translate(wellNode.origin);
    return boundingBox;
  }

  public /* override */ onShowInfo(
    viewInfo: ViewInfo,
    intersection: THREE.Intersection
  ): void {
    const md = WellTrajectoryView.startPickingAndReturnMd(
      this,
      viewInfo,
      intersection
    );
    if (md === undefined) return;

    const { node } = this;
    viewInfo.addPickedNode(node);

    const { log } = node;
    if (!log) return;

    const sample = log.getConcreteSampleByMd(md);
    if (!sample) return;

    viewInfo.addTabbedValue('Name', sample.name);
    viewInfo.addTabbedValue(
      'Radius',
      Number.isNaN(sample.radius) || sample.radius === 0
        ? 'No casing'
        : sample.radius.toFixed(3)
    );
    viewInfo.addTabbedValue('Comments', sample.comments);
    viewInfo.addTabbedValue('Status comment', sample.currentStatusComment);
  }

  //= =================================================
  // OVERRIDES of BaseGroupThreeView
  //= =================================================

  protected /* override */ createObject3DCore(): THREE.Object3D | null {
    const { node } = this;
    const { wellNode } = node;
    if (!wellNode) return null;

    const { style } = this;
    if (!style) return null;

    const color = node.getColorByColorType(
      style.colorType.value,
      this.renderTarget.fgColor
    );
    const { trajectory } = node;
    if (!trajectory) return null;

    const { log } = node;
    if (!log) throw Error('Well trajectory is missing');

    const parent = new THREE.Group();
    const samples = this.createRenderSamples(
      trajectory,
      log,
      color,
      style.radiusFactor.value
    );
    if (samples && samples.length > 0) {
      const geometry = new TrajectoryBufferGeometry(samples);
      const material = new THREE.MeshStandardMaterial({
        color: ThreeConverter.toThreeColor(Colors.white),
        vertexColors: true,
        transparent: true,
      });
      if (style.opacity.use) {
        material.opacity = style.opacity.value;
        material.transparent = true;
      }
      const mesh = new THREE.Mesh(geometry, material);
      parent.add(mesh);
    }
    parent.position.copy(this.transformer.to3D(wellNode.origin));
    return parent;
  }

  //= =================================================
  // INSTANCE METHODS: Creators
  //= =================================================

  public createRenderSamples(
    trajectory: WellTrajectory,
    log: CasingLog,
    color: Color,
    radiusFactor: number
  ): RenderSample[] {
    const { trajectoryRadius } = this;

    const samples: RenderSample[] = [];
    for (let logIndex = 0; logIndex < log.length; logIndex++) {
      const sample = log.getAt(logIndex);
      if (sample.isMdEmpty) continue;

      if (Number.isNaN(sample.baseMd)) continue;

      if (Number.isNaN(sample.radius)) continue;

      const sampleRadius = sample.radius * radiusFactor + trajectoryRadius;
      const topPosition = Vector3.newZero;
      if (trajectory.getPositionAtMd(sample.md, topPosition))
        samples.push(
          new RenderSample(topPosition, sample.md, sampleRadius, color)
        );

      // Push in all values between <sample.md, sample.baseMd>
      for (let wellIndex = 0; wellIndex < trajectory.length; wellIndex++) {
        const trajectorySample = trajectory.getAt(wellIndex);
        if (trajectorySample.md >= sample.baseMd) break; // Too far
        if (sample.md < trajectorySample.md)
          samples.push(
            new RenderSample(
              trajectorySample.point.clone(),
              trajectorySample.md,
              sampleRadius,
              color
            )
          );
      }
      const basePosition = Vector3.newZero;
      if (!trajectory.getPositionAtMd(sample.baseMd, basePosition)) continue;

      // Add a nan value to the end to terminate it
      samples.push(
        new RenderSample(basePosition, sample.baseMd, sampleRadius, color)
      );
      samples.push(
        new RenderSample(basePosition.clone(), sample.baseMd, 0, color)
      );
    }
    const { transformer } = this;
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
  //= =================================================
  // INSTANCE METHODS
  //= =================================================

  protected get trajectoryRadius(): number {
    const { node } = this;
    if (!node) return 0;

    const { trajectoryNode } = node;
    if (!trajectoryNode) return 0;

    const wellRenderStyle = trajectoryNode.getRenderStyle(
      this.targetId
    ) as WellTrajectoryStyle;
    if (!wellRenderStyle) return 0;

    return wellRenderStyle.radius.value;
  }
}
