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
import { Changes } from "@/Core/Views/Changes";
import { BaseThreeView } from "@/Three/BaseViews/BaseThreeView";

export class PointLogFilterView extends BaseGroupThreeView
{
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
    if (args.isChanged(Changes.pointOpenOrClosed))
      this.touch();
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
  // OVERRIDES of BaseThreeView
  //==================================================

  public /*override*/ onMouseClick(intersection: THREE.Intersection)
  {
    const parent = this.object3D;
    if (!parent)
      return;

    var index = intersection.object.userData["sphere"];
    if (index == undefined)
      return;

    const node = this.node;
    const trajectory = node.trajectory;
    if (!trajectory)
      return;

    const log = node.data;
    if (!log)
      return;

    const sample = log.getAt(index);
    sample.isOpen = !sample.isOpen;

    node.notify(new NodeEventArgs(Changes.pointOpenOrClosed));
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3DCore(): THREE.Object3D | null
  {
    const node = this.node;
    const color = node.getColor();
    const trajectory = node.trajectory;
    if (!trajectory)
      return null;

    const log = node.data;
    if (!log)
      throw Error("Well trajectory is missing");

    const group = new THREE.Group();

    const radius = Math.max(10, this.trajectoryRadius * 2);
    const closedGeometry = new THREE.SphereGeometry(radius, 16, 8);
    const openGeometry = new THREE.SphereGeometry(radius * 1.2, 16, 8);

    const closedMaterial = new THREE.MeshPhongMaterial({ color: ThreeConverter.toColor(color) });
    const openMaterial = new THREE.MeshPhongMaterial({ color: ThreeConverter.toColor(color) });
    openMaterial.emissive = ThreeConverter.toColor(Colors.selectedEmissive);

    const up = new Vector3(0, 0, 1);
    const position: Vector3 = Vector3.newZero;
    const tangent: Vector3 = Vector3.newZero;

    for (let index = 0; index < log.samples.length; index++)
    {
      const sample = log.getAt(index);
      if (!trajectory.getPositionAtMd(sample.md, position))
        continue;

      if (!trajectory.getTangentAtMd(sample.md, tangent))
        continue;

      const sphere = new THREE.Mesh(sample.isOpen ? openGeometry : closedGeometry, sample.isOpen ? openMaterial : closedMaterial);
      sphere.scale.z = 0.5;

      if (Math.abs(tangent.z) < 0.999)
      {
        const axis = up.getCross(tangent);
        // determine the amount to rotate
        const radians = Math.acos(tangent.getDot(up));
        sphere.rotateOnAxis(ThreeConverter.toVector(axis), radians);
      }
      ThreeConverter.copy(sphere.position, position);
      sphere.userData["sphere"] = index;

      group.add(sphere);

      if (sample.isOpen)
      {
        const label = PointLogFilterView.createLabel(sample.label, position, 5);
        if (label)  
        {
          label.center = new THREE.Vector2(0, 1);
          label.userData["label"] = index;
          label.userData[BaseThreeView.noPicking] = true;
          group.add(label);
        }
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


  public static createLabel(text: string, position: Vector3, worldfontSize: number): THREE.Sprite | null
  {
    const pixelfontSize = 30;
    const maxWidth = pixelfontSize * 20;

    const canvas = PointLogFilterView.createCanvasWithText(text, maxWidth, pixelfontSize);
    if (!canvas)
      return null;

    const texture = SpriteCreator.createTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);

    const width = worldfontSize * canvas.width / pixelfontSize;
    const height = worldfontSize * canvas.height / pixelfontSize;

    sprite.scale.set(width, height, 1);

    ThreeConverter.copy(sprite.position, position);
    return sprite;
  }

  public static createCanvasWithText(text: string, maxWidth: number, fontSize: number): HTMLCanvasElement | null
  {
    const outerMargin = 0.1 * maxWidth;
    const innerMargin = 0.025 * maxWidth;
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
      textHeight = Canvas.measureTextHeight(context, text, maxWidth + innerMargin, lineHeight);
      textHeight -= fontSize * lineSpacing / 2;
    }
    else
    {
      multiLine = false;
      textHeight = fontSize;
    }
    let margin = 2 * (outerMargin + innerMargin);
    canvas.width = textWidth + margin;
    canvas.height = textHeight + margin;

    const gradient = context.createLinearGradient(outerMargin, 0, canvas.width - outerMargin, 0);
    gradient.addColorStop(0, Canvas.getColor(Colors.white));
    gradient.addColorStop(1, Canvas.getColor(Colors.grey));

    context.fillStyle = "transparent";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = gradient;
    margin = outerMargin;
    context.fillRect(margin, margin, canvas.width - 2 * margin, canvas.height - 2 * margin);

    context.strokeStyle = Canvas.getColor(Colors.orange);
    context.lineWidth = 3;
    margin = outerMargin - 1;
    context.strokeRect(margin, margin, canvas.width - 2 * margin, canvas.height - 2 * margin);

    // need to set font again after resizing canvas
    context.font = font;
    context.textBaseline = "top";
    context.textAlign = "start";

    context.fillStyle = Canvas.getColor(Colors.black);
    const x = outerMargin + innerMargin;
    const y = x;
    if (multiLine)
      Canvas.fillText(context, text, x, y, maxWidth + innerMargin, lineHeight);
    else
      context.fillText(text, x, y);

    return canvas;
  }
}

