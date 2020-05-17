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
import { PolylinesNode } from "../Nodes/PolylinesNode";
import { PolylinesRenderStyle } from "../Nodes/PolylinesRenderStyle";
import { ThreeConverter } from "./ThreeConverter";
import { ColorType } from "../Core/Enums/ColorType";
import { Colors } from "../Core/PrimitiveClasses/Colors";
import { NodeEventArgs } from "../Core/Views/NodeEventArgs";
import { Range3 } from '../Core/Geometry/Range3';

export class PolylinesThreeView extends BaseGroupThreeView
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get node(): PolylinesNode { return super.getNode() as PolylinesNode; }
  protected get style(): PolylinesRenderStyle { return super.getStyle() as PolylinesRenderStyle; }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    super.updateCore(args);
  }

  public calculateBoundingBoxCore(): Range3 | undefined
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

    const polylines = node.data;
    if (!polylines)
      throw Error("polylines is missing in view");

    let color = node.color;
    const colorType = style.colorType;

    const group = new THREE.Group();

    for (const polyline of polylines.list)
    {
      const geometry = new THREE.Geometry();
      for (const point of polyline.list)
        geometry.vertices.push(ThreeConverter.toVector(point));

      if (colorType === ColorType.DifferentColor)
        color = Colors.getNextColor(group.children.length);

      const material = new THREE.LineBasicMaterial({ color: ThreeConverter.toColor(color), linewidth: style.lineWidth });
      const line = new THREE.Line(geometry, material);
      group.add(line);
    }
    return group;
  }
}
