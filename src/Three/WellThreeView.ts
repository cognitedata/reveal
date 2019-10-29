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
import { Color } from "three";
import { BaseGroupThreeView } from "./BaseGroupThreeView";
import { WellNode } from "../Nodes/WellNode";
import { WellRenderStyle } from "../Nodes/WellRenderStyle";
import { ThreeConverter } from "./ThreeConverter";
import { NodeEventArgs } from "../Core/Views/NodeEventArgs";
import { Range3 } from '../Core/Geometry/Range3';

export class WellThreeView extends BaseGroupThreeView
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // PROPERTIES
  //==================================================

  protected get node(): WellNode { return super.getNode() as WellNode; }
  protected get style(): WellRenderStyle { return super.getStyle() as WellRenderStyle; }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    super.updateCore(args);
  }

  public calculateBoundringBoxCore(): Range3 | undefined
  {
    var boundingBox = this.node.boundingBox;
    if (boundingBox == undefined)
      return undefined;

    boundingBox.expandByMarging(this.style.radius);
    return boundingBox;
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3D(): THREE.Object3D | null
  {
    const node = this.node;
    const style = this.style;

    const well = node.data;
    if (!well)
      throw Error("Well is missing");

    const color = node.color;
    const threeColor = ThreeConverter.toColor(color);

    const points: THREE.Vector3[] = [];
    for (const point of well.list)
      points.push(ThreeConverter.toVector(point));

    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 100, style.radius, 16);
    const material = new THREE.MeshPhongMaterial(
      {
        color: threeColor,
        flatShading: false,
        shininess: 100,
        emissive: new Color(1, 1, 1),
        emissiveIntensity: 0.2
      });
    return new THREE.Mesh(geometry, material);
  }
}
