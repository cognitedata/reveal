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

import { Vector3 } from "@/Core/Geometry/Vector3";
import { Range3 } from "@/Core/Geometry/Range3";

import { BaseGroupThreeView } from "@/Three/BaseViews/BaseGroupThreeView";

import { PointLogNode } from "@/Nodes/Wells/Wells/PointLogNode";
import { WellRenderStyle } from "@/Nodes/Wells/Wells/WellRenderStyle";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";

import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { SpriteCreator } from "@/Three/Utilities/SpriteCreator";

import * as Color from "color"
import { Colors } from "@/Core/Primitives/Colors";
import { Canvas } from "@/Three/Utilities/Canvas";

export class PointLogFilterView extends BaseGroupThreeView
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private fgColor: Color = Colors.white;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get node(): PointLogNode { return super.getNode() as PointLogNode; }
  protected get style(): WellRenderStyle { return super.getStyle() as WellRenderStyle; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  public get /*override*/ isVisible(): boolean
  {
    const parent = this.node.trajectoryNode;
    return parent != null && parent.isVisible(this.renderTarget)
  }

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    super.updateCore(args);
  }

  //==================================================
  // OVERRIDES of Base3DView
  //==================================================

  public /*override*/ calculateBoundingBoxCore(): Range3 | undefined
  {
    if (!this.isVisible)
      return undefined;

    const node = this.node;
    const trajectory = node.trajectory;
    if (!trajectory)
      return undefined;

    const log = node.data;
    if (!log)
      return undefined;

    const range = new Range3();
    const position: Vector3 = Vector3.newZero;
    for (let i = 0; i < log.samples.length; i++)
    {
      const sample = log.getAt(i);
      if (trajectory.getPositionAtMd(sample.md, position))
        range.add(position);
    }
    const radius = Math.max(10, this.trajectoryRadius * 2);
    range.expandByMargin(radius);
    return range;
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3DCore(): THREE.Object3D | null
  {
    const node = this.node;
    const color = node.color;
    const trajectory = node.trajectory;
    if (!trajectory)
      return null;

    const log = node.data;
    if (!log)
      throw Error("Well trajectory is missing");

    const group = new THREE.Group();

    const radius = Math.max(10, this.trajectoryRadius * 2);
    const geometry = new THREE.SphereGeometry(radius, 16, 8);
    const material = new THREE.MeshPhongMaterial({ color: ThreeConverter.toColor(color) });

    const up = new Vector3(0, 0, 1);
    const position: Vector3 = Vector3.newZero;
    const tangent: Vector3 = Vector3.newZero;
    for (let i = 0; i < log.samples.length; i++)
    {
      const sample = log.getAt(i);
      if (!trajectory.getPositionAtMd(sample.md, position))
        continue;

      if (!trajectory.getTangentAtMd(sample.md, tangent))
        continue;

      const sphere = new THREE.Mesh(geometry, material);
      sphere.scale.z = 0.5;

      if (Math.abs(tangent.z) < 0.999)
      {
        const axis = up.getCross(tangent);
        // determine the amount to rotate
        const radians = Math.acos(tangent.getDot(up));
        sphere.rotateOnAxis(ThreeConverter.toVector(axis), radians);
      }
      ThreeConverter.copy(sphere.position, position);
      sphere.userData["i"] = i;

      group.add(sphere);
      const label = PointLogFilterView.createLabel(sample.label, position, 30, this.fgColor);
      if (label)  
      {
        label.center = new THREE.Vector2(0, 1);
        group.add(label);
      }
    }
    return group;
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  protected get trajectoryRadius(): number
  {
    const node = this.node;
    if (!node)
      return 0;

    const trajectoryNode = node.trajectoryNode;
    if (!trajectoryNode)
      return 0;

    const wellRenderStyle = trajectoryNode.getRenderStyle(this.targetId) as WellRenderStyle;
    if (!wellRenderStyle)
      return 0;

    return wellRenderStyle.radius;
  }


  public static createLabel(text: string, position: Vector3, worldHeight: number, color: Color): THREE.Sprite | null
  {
    const outValue = { toChange: 0 };
    const canvas = PointLogFilterView.createCanvasWithText(text, color, outValue);
    if (!canvas)
      return null;

    const texture = SpriteCreator.createTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);

    sprite.scale.set(worldHeight * canvas.width / outValue.toChange, worldHeight, 1);
    ThreeConverter.copy(sprite.position, position);
    return sprite;
  }

  public static createCanvasWithText(text: string, color: Color, outValue: { toChange: number }): HTMLCanvasElement | null
  {
    const maxWidth = 500;
    const outerMargin = 50;
    const innerMargin = 10;
    const fontSize = 30;
    const lineSpacing = 0.5;
    const lineHeight = fontSize * (1 + lineSpacing);
    const font = `${fontSize}pt Helvetica`;

    // https://www.javascripture.com/CanvasRenderingContext2D
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context)
      return null;

    // Initialize text size
    context.font = font;
    let textHeight;
    let multiLine;
    let textWidth = context.measureText(text).width;
    if (textWidth > maxWidth)
    {
      multiLine = true;
      textWidth = maxWidth;
      textHeight = measureTextHeight(context, text, maxWidth, lineHeight);
      textHeight -= fontSize * lineSpacing / 2;
    }
    else
    {
      multiLine = false;
      textHeight = fontSize;
    }
    outValue.toChange = fontSize;

    canvas.width = textWidth + 2 * (outerMargin + innerMargin);
    canvas.height = textHeight + 2 * (outerMargin + innerMargin);

    const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, Canvas.getColor(Colors.white));
    gradient.addColorStop(1, Canvas.getColor(Colors.lightGrey));

    context.fillStyle = "transparent";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = gradient;;//"white";
    context.fillRect(outerMargin, outerMargin, canvas.width - outerMargin * 2, canvas.height - outerMargin * 2);

    context.strokeStyle = Canvas.getColor(Colors.darkGrey);
    context.lineWidth = 2;
    context.strokeRect(outerMargin, outerMargin, canvas.width - outerMargin * 2, canvas.height - outerMargin * 2);

    // need to set font again after resizing canvas
    context.font = font;
    context.textBaseline = "top";
    context.textAlign = "start";

    //context.fillStyle = 'red';
    //context.fillRect(0, 0, width, height);

    // scale to fit but don't stretch
    //context.translate(width / 2, height / 2);
    context.fillStyle = Canvas.getColor(Colors.black);
    const x = outerMargin + innerMargin;
    const y = x;
    if (multiLine)
      wrapText(context, text, x, y, maxWidth, lineHeight);
    else
      context.fillText(text, x, y);

    return canvas;
  }
}

function measureTextHeight(context: CanvasRenderingContext2D, text: string, maxWidth: number, lineHeight: number): number
{
  const words = text.split(' ');
  var line = '';
  var height = 0;
  for (let n = 0; n < words.length; n++)
  {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0)
    {
      line = words[n] + ' ';
      height += lineHeight;
    }
    else
      line = testLine;
  }
  height += lineHeight;
  return height;
}

function wrapText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number)
{
  const words = text.split(' ');
  var line = '';
  for (let n = 0; n < words.length; n++)
  {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0)
    {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    }
    else
      line = testLine;
  }
  context.fillText(line, x, y);
}
