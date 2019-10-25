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

import * as THREE from 'three';
import { BaseGroupThreeView } from "./BaseGroupThreeView";
import { PotreeNode } from "../Nodes/PotreeNode";
import { PotreeRenderStyle } from "../Nodes/PotreeRenderStyle";
import { NodeEventArgs } from "../Core/Views/NodeEventArgs";

// @ts-ignore
import * as Potree from '@cognite/potree-core';

export class PotreeThreeView extends BaseGroupThreeView
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // PROPERTIES
  //==================================================

  protected get node(): PotreeNode { return super.getNode() as PotreeNode; }
  protected get style(): PotreeRenderStyle { return super.getStyle() as PotreeRenderStyle; }

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

  protected /*override*/ createObject3D(): THREE.Object3D | null
  {
    const node = this.node;
    const style = this.style;

    const points = new Potree.Group();
    points.setPointBudget(style.budget)

    Potree.loadPointCloud(node.url, node.name, (data: any) =>
    {
      const pointcloud = data.pointcloud;
      points.add(pointcloud);
    });
    setInterval(() => { points.position.set(-431895.739999483, -238.1446784943079, 4583065.15011712) }, 500);
    return points;
  }
}
