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
import Color from "color";

import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { BaseGroupThreeView } from "@/Three/BaseViews/BaseGroupThreeView";
import { SeismicOutlineNode } from "@/SubSurface/Seismic/Nodes/SeismicOutlineNode";
import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { Range3 } from "@/Core/Geometry/Range3";
import { Changes } from "@/Core/Views/Changes";
import { Colors } from "@/Core/Primitives/Colors";

export class SeismicOutlineView extends BaseGroupThreeView
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private fgColor: Color = Colors.white;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get node(): SeismicOutlineNode { return super.getNode() as SeismicOutlineNode; }

  //==================================================
  // CONSTRUCTOR
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    if (args.isChanged(Changes.geometry))
    {
      this.touchBoundingBox();
      this.invalidateTarget();
    }
  }

  //==================================================
  // OVERRIDES of Base3DView
  //==================================================

  public /*override*/ calculateBoundingBoxCore(): Range3 | undefined
  {
    const { surveyNode } = this.node;
    return surveyNode ? surveyNode.boundingBox : new Range3();
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  public /*override*/ mustTouch(): boolean
  {
    const target = this.renderTarget;
    if (this.fgColor === target.fgColor)
      return false;

    this.fgColor = target.fgColor;
    return true;
  }

  protected /*override*/ createObject3DCore(): THREE.Object3D | null
  {
    const { node } = this;
    const parent = new THREE.Group();
    const target = this.renderTarget;

    const { surveyCube } = node;
    if (!surveyCube)
      return parent;

    const geometry = new THREE.Geometry();
    const { transformer } = this;

    const maxI = surveyCube.nodeSize.i - 1;
    const maxJ = surveyCube.nodeSize.j - 1;
    const maxK = surveyCube.nodeSize.k - 1;

    this.fgColor = target.fgColor;
    const color = ThreeConverter.toThreeColor(this.fgColor);

    for (const i of [0, maxI])
      for (const j of [0, maxJ])
        for (const k of [0, maxK])
          geometry.vertices.push(transformer.to3D(surveyCube.getNodePosition(i, j, k)));
    for (const k of [0, maxK])
    {
      for (const j of [0, maxJ])
        for (const i of [0, maxI])
          geometry.vertices.push(transformer.to3D(surveyCube.getNodePosition(i, j, k)));
      for (const i of [0, maxI])
        for (const j of [0, maxJ])
          geometry.vertices.push(transformer.to3D(surveyCube.getNodePosition(i, j, k)));
    }
    const material = new THREE.LineBasicMaterial({ color, linewidth: 1 });
    const lineSegments = new THREE.LineSegments(geometry, material);
    parent.add(lineSegments);
    return parent;
  }
}
