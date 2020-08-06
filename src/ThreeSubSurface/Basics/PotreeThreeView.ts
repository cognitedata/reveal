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

// @ts-ignore 
import * as Potree from "@cognite/potree-core";

import { PotreeNode } from "@/SubSurface/Basics/PotreeNode";
import { PotreeRenderStyle } from "@/SubSurface/Basics/PotreeRenderStyle";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { BaseGroupThreeView } from "@/Three/BaseViews/BaseGroupThreeView";
import { Util } from "@/Core/Primitives/Util";

export class PotreeThreeView extends BaseGroupThreeView
{
  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get node(): PotreeNode { return super.getNode() as PotreeNode; }

  protected get style(): PotreeRenderStyle { return super.getStyle() as PotreeRenderStyle; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

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
    const { node } = this;
    const { style } = this;

    const path = node.url;
    if (Util.isEmpty(path))
      return null;

    const group: Potree.Group = new Potree.Group();
    group.setPointBudget(style.budget);

    Potree.loadPointCloud(path, node.name, (data: any) =>
    {
      const { pointcloud } = data;
      group.add(pointcloud);

      const { material } = pointcloud;
      if (material)
      {
        // https://github.com/tentone/potree-core
        // material.pointSizeType = Potree.PointSizeType.FIXED; 
        // material.pointSizeType = Potree.PointSizeType.ATTENUATED;
        // material.pointSizeType = Potree.PointSizeType.ADAPTIVE; 
        // material.pointColorType = Potree.PointColorType.RGB;
        // material.shape = Potree.PointShape.SQUARE;  // Potree.PointShape.PARABOLOI
        // material.weighted = false;
        // material.size = 0.5;
      }
      group.add(pointcloud);
    });
    return group;
  }
}
