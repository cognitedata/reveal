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

import { Colors } from "@/Core/Primitives/Colors";
import { FloatLogNode } from "@/Nodes/Wells/Wells/FloatLogNode";
import { WellRenderStyle } from "@/Nodes/Wells/Wells/WellRenderStyle";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";

import { BaseLogThreeView } from "@/Three/WellViews/BaseLogThreeView";
import { LogRender } from "@/Three/WellViews/LogRender";

export class FloatLogThreeView extends BaseLogThreeView
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get node(): FloatLogNode { return super.getNode() as FloatLogNode; }
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

    const trajectory = this.trajectory;
    if (!trajectory)
      return null;

    const log = node.data;
    if (!log)
      throw Error("Well trajectory is missing");

    const bandRange = this.bandRange;
    if (!bandRange)
      return null;

    const group = new THREE.Group();
    const logRender = new LogRender(trajectory, this.cameraPosition, bandRange);
    const childIndex = node.childIndex;

    if (childIndex === undefined)
      return null;

    const right = childIndex % 2 === 0;

    if (childIndex <= 0) {
      //logRender.addSolidFloatLog(group, log, right);
      //logRender.addLineFloatLog(group, log, Colors.black, right);
    } else;//logRender.addLineFloatLog(group, log, node.color, right);

    return group;
  }
}
