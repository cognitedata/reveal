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
import { Range3 } from "@/Core/Geometry/Range3";
import { ColorType } from "@/Core/Enums/ColorType";

import { PolylinesNode } from "@/SubSurface/Basics/PolylinesNode";
import { PolylinesRenderStyle } from "@/SubSurface/Basics/PolylinesRenderStyle";
import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { BaseGroupThreeView } from "@/Three/BaseViews/BaseGroupThreeView";
import { PointsThreeView } from "@/ThreeSubSurface/Basics/PointsThreeView";

export class PolylinesThreeView extends BaseGroupThreeView
{
  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get node(): PolylinesNode { return super.getNode() as PolylinesNode; }

  protected get style(): PolylinesRenderStyle { return super.getStyle() as PolylinesRenderStyle; }

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
  // OVERRIDES of Base3DView
  //==================================================

  public /*override*/ calculateBoundingBoxCore(): Range3 | undefined { return this.node.boundingBox; }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3DCore(): THREE.Object3D | null
  {
    const {node} = this;
    const {style} = this;

    const {polylines} = node;
    if (!polylines)
      throw Error("polylines is missing in view");

    let color = node.getColor();
    const {colorType} = style;

    const group = new THREE.Group();
    const {transformer} = this;
  
    for (const polyline of polylines.list)
    {
      const geometry = PointsThreeView.createBufferGeometry(polyline, transformer);
      if (colorType === ColorType.DifferentColor)
        color = Colors.getNextColor(group.children.length);

      const material = new THREE.LineBasicMaterial({ color: ThreeConverter.to3DColor(color), linewidth: style.lineWidth });
      const line = new THREE.Line(geometry, material);
      group.add(line);
    }
    return group;
  }
}
