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
import { Colors } from "@/Core/Primitives/Colors";

import { BaseLogNode } from "@/Nodes/Wells/Wells/BaseLogNode";
import { FloatLogNode } from "@/Nodes/Wells/Wells/FloatLogNode";
import { DiscreteLogNode } from "@/Nodes/Wells/Wells/DiscreteLogNode";
import { WellRenderStyle } from "@/Nodes/Wells/Wells/WellRenderStyle";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";

import { WellTrajectoryNode } from "@/Nodes/Wells/Wells/WellTrajectoryNode";
import { TrajectorySample } from "@/Nodes/Wells/Samples/TrajectorySample";

import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { ThreeLabel } from "@/Three/Utilities/ThreeLabel";
import { LogRender } from "@/Three/WellViews/LogRender";
import { BaseLogThreeView } from "@/Three/WellViews/BaseLogThreeView";

export class WellTrajectoryThreeView extends BaseLogThreeView
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get node(): WellTrajectoryNode { return super.getNode() as WellTrajectoryNode; }
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
    const node = this.node;
    const style = this.style;

    const trajectory = this.trajectory;
    if (!trajectory)
      throw Error("Well trajectory is missing");

    let numVisible = 0;
    const mdRange = new Range1();
    for (const logNode of node.getDescendantsByType(BaseLogNode))
    {
      const log = logNode.data;
      if (!log)
        continue;

      if (logNode.isVisible(this.renderTarget))
        numVisible++;

      mdRange.addRange(log.mdRange);
    }
    const bandRange = this.bandRange;
    if (!bandRange)
      return null;

    const group = new THREE.Group();
    const useRightBand = true;
    const useLeftBand = true;

    const logRender = new LogRender(trajectory, this.cameraPosition, bandRange);
    if (numVisible > 0)
      logRender.addBand(group, mdRange, useRightBand, useLeftBand);

    for (const rightBand of [true, false])
    {
      const canvas = logRender.createCanvas(mdRange);
      for (const logNode of node.getDescendantsByType(FloatLogNode))
      {
        if (!logNode.isVisible(this.renderTarget))
          continue;
        if (rightBand)
          logRender.addFloatLogToBand(canvas, mdRange, logNode.data, logNode.color, rightBand);
      }
      for (const logNode of node.getDescendantsByType(DiscreteLogNode))
      {
        if (!logNode.isVisible(this.renderTarget))
          continue;

        if (!rightBand)
          logRender.addDiscreteLogToBand(canvas, mdRange, logNode.data);
      }
      logRender.addAnnotation(canvas, mdRange, rightBand);
      logRender.setCanvas(group, canvas, rightBand);
    }
    const well = node.well;
    if (well)
    {
      const label = ThreeLabel.createByPositionAndAlignment(well.name, well.wellHead, 1, 60, false);
      if (label)
        group.add(label);
    }

    const color = node.color;
    const threeColor = ThreeConverter.toColor(color);

    const points: THREE.Vector3[] = Array<THREE.Vector3>();
    for (const baseSample of trajectory.samples) 
    {
      const sample = baseSample as TrajectorySample;
      points.push(ThreeConverter.toVector(sample.point));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 100, style.radius, 16);
    const material = new THREE.MeshStandardMaterial(
      {
        color: threeColor,
        flatShading: false,
        emissive: threeColor,
        emissiveIntensity: 0.2
      });

    group.add(new THREE.Mesh(geometry, material));
    return group;
  }
}
