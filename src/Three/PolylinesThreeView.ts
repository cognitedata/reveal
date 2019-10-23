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

import { ThreeView } from "./BaseThreeView";
import { PolylinesNode } from "../Example/PolylinesNode";
import { PolylinesRenderStyle } from "../Example/PolylinesRenderStyle";

import * as THREE from 'three';

export class PolylinesView3 extends ThreeView
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // PROPERTIES
  //==================================================

  protected get node(): PolylinesNode { return super.getNode() as PolylinesNode; }
  protected get style(): PolylinesRenderStyle { return super.getStyle() as PolylinesRenderStyle; }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  public /*override*/ initialize(): void
  {
    const node = this.node;
    const style = this.style;
    const scene = this.scene;

    const polylines = node.data;
    if (!polylines)
      throw Error("polylines is missing in view");

    const points = new THREE.Geometry();
    for (const polyline of polylines.list)
    {
      for (const point of polyline.list)
      {
        points.vertices.push(new THREE.Vector3(point.x, point.y, point.z));
      }
      const line = new THREE.Line(points, new THREE.LineBasicMaterial({ color: "red", linewidth: style.lineWidth }));
      scene.add(line);
    }
  }
}
