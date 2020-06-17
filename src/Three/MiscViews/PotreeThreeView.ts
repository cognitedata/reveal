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

import { Range3 } from "@/Core/Geometry/Range3";
import { PotreeNode } from "@/Nodes/Misc/PotreeNode";
import { PotreeRenderStyle } from "@/Nodes/Misc/PotreeRenderStyle";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { ViewInfo } from "@/Core/Views/ViewInfo";
import { BaseGroupThreeView } from "@/Three/BaseViews/BaseGroupThreeView";

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

  public /*override*/ calculateBoundingBoxCore(): Range3 | undefined
  {
    return PotreeThreeView.getBoundingBoxFromGroup(this.object3D as Potree.Group);
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3DCore(): THREE.Object3D | null
  {
    const node = this.node;
    const style = this.style;

    const path = node.url;
    if (!path || path === "")
      return null;

    const group: Potree.Group = new Potree.Group();
    group.setPointBudget(style.budget);

    Potree.loadPointCloud(path, node.getName(), (data: any) =>
    {
      const pointcloud: Potree.PointcloudOctree = data.pointcloud;
      group.add(pointcloud);

      const material: Potree.PointCloudMaterial = pointcloud.material;
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

  public static getBoundingBoxFromGroup(group: Potree.Group): Range3 | undefined
  {
    if (!group)
      return undefined;
    const boundingBox = group.getBoundingBox();
    if (!boundingBox)
      return undefined;
    return ThreeConverter.fromBox(boundingBox, false); //// BUG in the potree code (again!!!!), pass false here
  }

}
