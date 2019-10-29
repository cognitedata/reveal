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
import { ThreeConverter } from './ThreeConverter';
import { Range3 } from '../Core/Geometry/Range3';

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

  public calculateBoundringBoxCore(): Range3 | undefined
  {
    return this.node.boundingBox;
  }

//==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3D(): THREE.Object3D | null
  {
    const node = this.node;
    const style = this.style;

    const group = new Potree.Group();
    group.setPointBudget(style.budget);

    const path = node.url;

    // https://github.com/tentone/potree-core

    const material = Potree.PointCloudMaterial;
    if (material)
      material.pointSizeType = Potree.PointSizeType.ATTENUATED;

    Potree.loadPointCloud(path, node.name, (data: any) =>
    {
      const pointcloud = data.pointcloud;
      group.add(pointcloud);

      const boundingBox = pointcloud.pcoGeometry.tightBoundingBox as THREE.Box3;
      if (boundingBox)
        node.localBoundingBox = ThreeConverter.fromBox(boundingBox);

      group.add(pointcloud);
    });
    return group;
  }
}
