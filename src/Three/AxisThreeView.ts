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



    const group = new THREE.Group();
    group.add(this.createLabel());

    return group;
  }


  createSprite(text: string): THREE.Sprite | null
  {
    // canvas contents will be used for a texture
    const canvas = this.createLabelCanvas(150, 32, name);
    if (canvas === null)
      return null;

    const texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1, 1, 1.0);
    return sprite;
  }

  createLabel(): THREE.Object3D
  {

    const dobj = new THREE.Object3D();
    for (let i = 0; i < 1; i++)
    {
      const label = this.createSprite("dssssss");
      if (label === null)
        continue;

      label.position.set(i + 100, i + 100, i + 10);
      dobj.add(label);
    }
    return dobj;
  }


  createLabelCanvas1(baseWidth: number, fontSize: number, name: string): HTMLCanvasElement | null
  {
    const fontface = "Helvetica";
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context === null)
      return null;

    context.font = fontSize + "px " + fontface;

    // text color
    context.fillStyle = "rgba(255, 255, 255, 1.0)";
    context.fillText(name, 0, fontSize);
    return canvas;
  }

  createLabelCanvas(baseWidth: number, fontSize: number, name: string): HTMLCanvasElement | null
  {
    const borderSize = 2;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx === null)
      return null;

    const font = `${fontSize}px bold sans-serif`;
    ctx.font = font;
    // measure how long the name will be
    const textWidth = ctx.measureText(name).width;

    const doubleBorderSize = borderSize * 2;
    const width = baseWidth + doubleBorderSize;
    const height = fontSize + doubleBorderSize;

    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // need to set font again after resizing canvas
    ctx.font = font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    //ctx.fillStyle = 'transparent';
    //ctx.fillRect(0, 0, width, height);

    // scale to fit but don't stretch
    const scaleFactor = Math.min(1, baseWidth / textWidth);
    ctx.translate(width / 2, height / 2);
    ctx.scale(scaleFactor, 1);
    ctx.fillStyle = 'blue';
    ctx.fillText(name, 0, 0);
    return canvas;
  }

  //function makePerson()
  //{
  //  const canvas = createLabelCanvas(150, 32, name);
  //  const texture = new THREE.CanvasTexture(canvas);
  //  // because our canvas is likely not a power of 2
  //  // in both dimensions set the filtering appropriately.
  //  texture.minFilter = THREE.LinearFilter;
  //  texture.wrapS = THREE.ClampToEdgeWrapping;
  //  texture.wrapT = THREE.ClampToEdgeWrapping;

  //  const labelMaterial = new THREE.SpriteMaterial({
  //    map: texture,
  //    transparent: true,
  //  });
  //  const bodyMaterial = new THREE.MeshPhongMaterial({
  //    color,
  //    flatShading: true,
  //  });

  //  const root = new THREE.Object3D();
  //  root.position.x = x;

  //  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  //  root.add(body);
  //  body.position.y = bodyHeight / 2;

  //  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  //  root.add(head);
  //  head.position.y = bodyHeight + headRadius * 1.1;

  //  const label = new THREE.Sprite(labelMaterial);
  //  root.add(label);
  //  label.position.y = bodyHeight * 4 / 5;
  //  label.position.z = bodyRadiusTop * 1.01;

  //  // if units are meters then 0.01 here makes size
  //  // of the label into centimeters.
  //  const labelBaseScale = 0.01;
  //  label.scale.x = canvas.width * labelBaseScale;
  //  label.scale.y = canvas.height * labelBaseScale;

  //  scene.add(root);
  //  return root;
  //}


}
