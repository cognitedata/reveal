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

import { PointLogNode } from "@/SubSurface/Wells/Nodes/PointLogNode";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";

import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { SpriteCreator } from "@/Three/Utilities/SpriteCreator";

import { Colors } from "@/Core/Primitives/Colors";
import { Canvas } from "@/Three/Utilities/Canvas";
import { Changes } from "@/Core/Views/Changes";
import { BaseThreeView } from "@/Three/BaseViews/BaseThreeView";
import { Appearance } from "@/Core/States/Appearance";
import { WellTrajectoryStyle } from "@/SubSurface/Wells/Styles/WellTrajectoryStyle";
import { PointLogStyle } from "@/SubSurface/Wells/Styles/PointLogStyle";
import { WellTrajectoryThreeView } from "@/ThreeSubSurface/Wells/WellTrajectoryThreeView";
import { ViewInfo } from '@/Core/Views/ViewInfo';

const selectedRadiusFactor = 1.2;

export class PointLogThreeView extends BaseGroupThreeView
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private cameraDirection = new Vector3(0, 0, 1); // Direction to the center
  private cameraPosition = new Vector3(0, 0, 1);

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get node(): PointLogNode { return super.getNode() as PointLogNode; }
  private get style(): PointLogStyle { return super.getStyle() as PointLogStyle; }

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

    const wellNode = this.node.wellNode;
    if (!wellNode)
      return undefined;

    const log = node.log;
    if (!log)
      return undefined;

    const boundingBox = new Range3();
    const position = Vector3.newZero;
    for (let i = log.samples.length - 1; i >= 0; i--)
    {
      const sample = log.getAt(i);
      if (sample.isMdEmpty)
        continue;

      if (trajectory.getPositionAtMd(sample.md, position))
        boundingBox.add(position);
    }
    const radius = this.radius * selectedRadiusFactor;
    boundingBox.expandByMargin(radius);
    boundingBox.translate(wellNode.origin);
    return boundingBox;
  }

  //==================================================
  // OVERRIDES of BaseThreeView
  //==================================================

  public /*override*/ beforeRender(): void
  {
    super.beforeRender();
    const parent = this.object3D;
    if (!parent)
      return;

    const node = this.node;
    const log = node.log;
    if (!log)
      return;

    const wellNode = node.wellNode;
    if (!wellNode)
      return;

    const trajectory = node.trajectory;
    if (!trajectory)
      return;

    const transformer = this.transformer;
    const camera = this.camera;
    const cameraPosition = transformer.toWorld(camera.position);
    cameraPosition.substract(wellNode.origin);

    const cameraDirection = trajectory.boundingBox.center;

    transformer.transformRelativeTo3D(cameraPosition);
    transformer.transformRelativeTo3D(cameraDirection);

    cameraDirection.substract(cameraPosition);
    cameraDirection.normalize();

    // Check if camera has move slightly
    const angle = Math.acos(cameraDirection.getDot(this.cameraDirection));
    if (angle < Appearance.viewerSmallestCameraDeltaAngle)
      return;

    this.cameraDirection = cameraDirection;
    this.cameraPosition = cameraPosition;

    const position = Vector3.newZero;
    const tangent = Vector3.newZero;
    const selectedRadius = this.radius * selectedRadiusFactor;

    for (const child of parent.children)
    {
      const index = child.userData["label"];
      if (index == undefined)
        continue;

      const sample = log.getAt(index);
      if (sample.isMdEmpty)
        continue;

      if (!trajectory.getPositionAtMd(sample.md, position))
        continue;

      if (!trajectory.getTangentAtMd(sample.md, tangent))
        continue;

      transformer.transformRelativeTo3D(position);
      transformer.transformTangentTo3D(tangent);

      // Get perpendicular
      const cameraDirection = Vector3.substract(position, this.cameraPosition);
      const prependicular = cameraDirection.getNormal(tangent);
      position.addWithFactor(prependicular, selectedRadius);

      ThreeConverter.copyToThreeVector3(child.position, position);
    }
  }

  public /*override*/ onShowInfo(viewInfo: ViewInfo, intersection: THREE.Intersection): void
  {
    const parent = this.object3D;
    if (!parent)
      return;

    const index = intersection.object.userData["sphere"];
    if (index == undefined)
      return;

    const node = this.node;
    const trajectory = node.trajectory;
    if (!trajectory)
      return;

    const log = node.log;
    if (!log)
      return;

    const sample = log.getAt(index);
    if (!sample)
      return;

    sample.isOpen = !sample.isOpen;
    node.notify(new NodeEventArgs(Changes.pointOpenOrClosed));

    const md = WellTrajectoryThreeView.startPickingAndReturnMd(this, viewInfo, intersection, sample.md);
    if (md == undefined)
      return;

    viewInfo.addHeader(node.displayName);
    viewInfo.addText("  Description", sample.description);
    viewInfo.addText("  Subtype", sample.subtype);
    viewInfo.addText("  Subcategory", sample.riskSubCategory);
    viewInfo.addText("  Details", sample.details);
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3DCore(): THREE.Object3D | null
  {
    const node = this.node;
    const wellNode = node.wellNode;
    if (!wellNode)
      return null;

    const trajectory = node.trajectory;
    if (!trajectory)
      return null;

    const style = this.style;
    if (!style)
      return null;

    const color = node.getColorByColorType(style.colorType)
    const log = node.log;
    if (!log)
      throw Error("Well trajectory is missing");

    const group = new THREE.Group();
    const transformer = this.transformer;

    const radius = this.radius;
    const selectedRadius = radius * selectedRadiusFactor;
    const closedGeometry = new THREE.SphereGeometry(radius, 16, 8);
    const openGeometry = new THREE.SphereGeometry(selectedRadius, 16, 8);

    const closedMaterial = new THREE.MeshPhongMaterial({ color: ThreeConverter.toThreeColor(color) });
    const openMaterial = new THREE.MeshPhongMaterial({
      color: ThreeConverter.toThreeColor(color),
      emissive: ThreeConverter.toThreeColor(Colors.selectedEmissive)
    });

    const up = Vector3.newUp;
    const tangent = Vector3.newZero;
    const position = Vector3.newZero;

    for (let index = 0; index < log.samples.length; index++)
    {
      const sample = log.getAt(index);
      if (sample.isMdEmpty)
        continue;

      if (!trajectory.getPositionAtMd(sample.md, position))
        continue;

      if (!trajectory.getTangentAtMd(sample.md, tangent))
        continue;

      transformer.transformRelativeTo3D(position);
      transformer.transformTangentTo3D(tangent);

      const sphere = new THREE.Mesh(sample.isOpen ? openGeometry : closedGeometry, sample.isOpen ? openMaterial : closedMaterial);
      sphere.scale.z = 0.3333;

      if (Math.abs(tangent.z) < 0.999)
      {
        const axis = up.getCross(tangent);
        // determine the amount to rotate
        const radians = Math.acos(tangent.getDot(up));
        sphere.rotateOnAxis(ThreeConverter.toThreeVector3(axis), radians);
      }

      // Get perpendicular
      ThreeConverter.copyToThreeVector3(sphere.position, position);
      sphere.userData["sphere"] = index;

      group.add(sphere);

      if (sample.isOpen)
      {
        const cameraDirection = Vector3.substract(position, this.cameraPosition);
        const prependicular = cameraDirection.getNormal(tangent);
        position.addWithFactor(prependicular, selectedRadius);

        const label = PointLogThreeView.createLabel(node.name, sample.description, position, style.fontSize);
        if (label)  
        {
          label.center = new THREE.Vector2(0, 1);
          label.userData["label"] = index;
          label.userData[BaseThreeView.noPicking] = true;
          group.add(label);
        }
      }
    }
    group.position.copy(transformer.to3D(wellNode.origin));
    return group;
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  protected get radius(): number
  {
    let radius = 20;
    const node = this.node;
    if (!node)
      return radius;

    const style = this.style;
    if (style)
      radius = style.radius;

    const trajectoryNode = node.trajectoryNode;
    if (!trajectoryNode)
      return radius;

    const wellRenderStyle = trajectoryNode.getRenderStyle(this.targetId) as WellTrajectoryStyle;
    if (wellRenderStyle)
      radius += wellRenderStyle.radius;

    return radius;
  }


  public static createLabel(header: string, text: string, position: Vector3, worldfontSize: number): THREE.Sprite | null
  {
    const pixelfontSize = 30;
    const maxWidth = pixelfontSize * 20;
    const canvas = PointLogThreeView.createCanvasWithText(header, text, maxWidth, pixelfontSize);
    if (!canvas)
      return null;

    const texture = SpriteCreator.createTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);

    const width = worldfontSize * canvas.width / pixelfontSize;
    const height = worldfontSize * canvas.height / pixelfontSize;

    sprite.scale.set(width, height, 1);

    ThreeConverter.copyToThreeVector3(sprite.position, position);
    return sprite;
  }

  public static createCanvasWithText(header: string, text: string, maxWidth: number, fontSize: number): HTMLCanvasElement | null
  {
    const margin = 0.025 * maxWidth;
    const lineSpacing = 0.5;
    const lineHeight = fontSize * (1 + lineSpacing);
    const textFont = Canvas.getBoldFont(fontSize);
    const headerFont = Canvas.getBolderFont(fontSize + 2);

    // https://www.javascripture.com/CanvasRenderingContext2D
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context)
      return null;

    // Initialize header size
    context.font = headerFont;
    let headerHeight;
    let headerMultiLine;
    let headerWidth = context.measureText(header).width;
    if (headerWidth > maxWidth)
    {
      headerMultiLine = true;
      headerWidth = maxWidth;
      headerHeight = Canvas.measureTextHeight(context, header, maxWidth + margin, lineHeight);
      headerHeight -= fontSize * lineSpacing / 2;
    }
    else
    {
      headerMultiLine = false;
      headerHeight = fontSize;
    }
    // Initialize text size
    context.font = textFont;
    let textHeight;
    let textMultiLine;
    let textWidth = context.measureText(text).width;
    if (textWidth > maxWidth)
    {
      textMultiLine = true;
      textWidth = maxWidth;
      textHeight = Canvas.measureTextHeight(context, text, maxWidth + margin, lineHeight);
      textHeight -= fontSize * lineSpacing / 2;
    }
    else
    {
      textMultiLine = false;
      textHeight = fontSize;
    }
    canvas.width = Math.max(headerWidth, textWidth) + 2 * margin;
    canvas.height = headerHeight + 0.5 * fontSize + textHeight + 2 * margin;

    const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, Canvas.getColor(Colors.white));
    gradient.addColorStop(1, Canvas.getColor(Colors.grey));

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = Canvas.getColor(Colors.orange);
    context.lineWidth = 4;
    context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    // need to set font again after resizing canvas
    context.textBaseline = "top";
    context.textAlign = "start";
    context.fillStyle = Canvas.getColor(Colors.black);
    let y = margin;
    {
      context.font = headerFont;
      if (headerMultiLine)
        Canvas.fillText(context, header, margin, y, maxWidth + margin, lineHeight);
      else
        context.fillText(header, margin, y);
    }
    {
      y += headerHeight + 0.5 * fontSize;
      context.font = textFont;
      if (textMultiLine)
        Canvas.fillText(context, text, margin, y, maxWidth + margin, lineHeight);
      else
        context.fillText(text, margin, y);
    }
    return canvas;
  }
}

