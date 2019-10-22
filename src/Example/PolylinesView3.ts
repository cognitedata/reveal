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

import { ThreeView } from "../Three/ThreeView";
import { PolylinesNode } from "./PolylinesNode";
import { PolylinesRenderStyle } from "./PolylinesRenderStyle";

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

  protected get node(): PolylinesNode | null { return super.getNode() as PolylinesNode; }
  protected get style(): PolylinesRenderStyle | null { return super.getStyle() as PolylinesRenderStyle; }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  public /*override*/ initialize(): void
  {
    const node = this.node;
    if (!node)
      throw Error("node is missing in view");

    const polylines = node.data;
    if (!polylines)
      throw Error("polylines is missing in view");

    const style = this.style;
    if (!style)
      throw Error("style is missing in view");

    const target = this.target;
    if (!target)
      throw Error("target is missing in view");

    var points3D = new THREE.Geometry();
    points3D.vertices.push(
      new THREE.Vector3(0, 0, 0.5),
      new THREE.Vector3(2, 0, 1),
      new THREE.Vector3(2, 2, 2),
      new THREE.Vector3(0, 2, 3),
      new THREE.Vector3(0, 0, 0.5)
    );
    var line2 = new THREE.Line(points3D, new THREE.LineBasicMaterial({
      color: "red",
      linewidth: style.lineWidth,
    }));

    console.log("Adding lines");
    target.scene.add(line2);
  }
}
