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

export class AxisThreeView extends BaseGroupThreeView
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

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    super.updateCore(args);
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3D(): THREE.Object3D | null 
  {
    const target = this.renderTarget;

    const boundingBox = target.getBoundingBoxFromViews();

    const threeColor = ThreeConverter.toColor(Colors.white);
    const material = new THREE.LineBasicMaterial({ color: threeColor, linewidth: 1 });

    const node = this.node;
    const style = this.style;

    const polylines = node.data;
    if (!polylines)
      throw Error("polylines is missing in view");

    const group = new THREE.Group();

    for (const polyline of polylines.list)
    {
      const geometry = new THREE.Geometry();
      for (const point of polyline.list)
        geometry.vertices.push(ThreeConverter.toVector(point));

      const line = new THREE.Line(geometry, material, THREE.LinePieces);
      group.add(line);
    }
    return group;
  }


  Greate(message, parameters): THREE.Sprite
  {
    if (parameters === undefined) parameters = {};

    const fontface = parameters["fontface"] || "Helvetica";
    const fontsize = parameters["fontsize"] || 70;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = fontsize + "px " + fontface;

    // get size data (height depends only on font size)
    var metrics = context.measureText(message);
    var textWidth = metrics.width;


    // text color
    context.fillStyle = "rgba(0, 0, 0, 1.0)";
    context.fillText(message, 0, fontsize);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas)
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial({ map: texture, useScreenCoordinates: false });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(100, 50, 1.0);
    return sprite;
  }


}
