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

import { PointLogNode } from "@/Nodes/Wells/Wells/PointLogNode";
import { WellRenderStyle } from "@/Nodes/Wells/Wells/WellRenderStyle";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";

import { BaseLogThreeView } from "@/Three/WellViews/BaseLogThreeView";
import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";

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
    const color = node.color;
    const trajectory = node.trajectory;
    if (!trajectory)
      return null;

    const log = node.data;
    if (!log)
      throw Error("Well trajectory is missing");

    const bandRange = this.bandRange;
    if (!bandRange)
      return null;

    const group = new THREE.Group();

    const radius = bandRange.min * 2;
    const geometry = new THREE.SphereGeometry(radius, 16, 8);
    const material = new THREE.MeshPhongMaterial({ color: ThreeConverter.toColor(color) });

    for (let i = 0; i < log.samples.length; i++)
    {
      const sample = log.getAt(i);
      const position = trajectory.getAtMd(sample.md);

      const sphere = new THREE.Mesh(geometry, material);

      sphere.position.x = position.x;
      sphere.position.y = position.y;
      sphere.position.z = position.z;
      sphere.scale.z = 0.5;

      group.add(sphere);
    }
    return group;
  }
}
