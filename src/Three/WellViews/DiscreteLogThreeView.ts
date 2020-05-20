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

import { DiscreteLogNode } from "@/Nodes/Wells/Wells/DiscreteLogNode";
import { WellRenderStyle } from "@/Nodes/Wells/Wells/WellRenderStyle";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";

import { BaseLogThreeView } from "@/Three/WellViews/BaseLogThreeView";
import { LogRender } from "@/Three/WellViews/LogRender";

export class DiscreteLogThreeView extends BaseLogThreeView
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get node(): DiscreteLogNode { return super.getNode() as DiscreteLogNode; }
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
    //logRender.addSolidDiscreteLog(group, log, false);
    return group;
  }
}
