//=====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple data set in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//=====================================================================================

import * as THREE from "three";
import * as Color from "color"
import * as Lodash from 'lodash';

import { Range1 } from "@/Core/Geometry/Range1";
import { Range3 } from "@/Core/Geometry/Range3";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { Colors } from "@/Core/Primitives/Colors";
import { Ma } from "@/Core/Primitives/Ma";

import { AxisNode } from "@/Core/Nodes/Decorations/AxisNode";
import { AxisRenderStyle } from "@/Core/Nodes/Decorations/AxisRenderStyle";
import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { SpriteCreator } from "@/Three/Utilities/SpriteCreator";
import { BaseGroupThreeView } from "@/Three/BaseViews/BaseGroupThreeView";

const WallIndex0Name = "wallIndex0";
const WallIndex1Name = "wallIndex1";
const MainAxisName = "mainAxis";

export class AxisThreeView extends BaseGroupThreeView
{
  //==================================================
  // INSTANCE MEMBERS
  //==================================================

  private corners: Vector3[] = [];
  private centersIn3d = new Array<Vector3>(6);

  // Set to read in order to see if they change later on
  private textColor = Colors.red;
  private axisColor = Colors.red;
  private gridColor = Colors.red;
  private wallColor = Colors.red;
  private bgColor: Color = Colors.black;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private boundingBoxFromViews: Range3 | undefined = undefined; // Caching the bounding box of the scene

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get node(): AxisNode { return super.getNode() as AxisNode; }
  protected get style(): AxisRenderStyle { return super.getStyle() as AxisRenderStyle; }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    super.updateCore(args);
  }

  //==================================================
  // OVERRIDES of BaseThreeView
  //==================================================

  public /*virtual*/ shouldPick(): boolean { return false; } // Newer pick on axis

  //==================================================
  // OVERRIDES of Base3DView
  //==================================================

  public /*override*/ calculateBoundingBoxCore(): Range3 | undefined { return new Range3(); }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  public /*override*/ mustTouch(): boolean
  {
    const target = this.renderTarget;

    // Check if bounding box is different
    const boundingBoxFromViews = target.getBoundingBoxFromViews();
    if (!boundingBoxFromViews.isEmpty)
      boundingBoxFromViews.expandByFraction(0.02);
    if (boundingBoxFromViews.isEqual(this.boundingBoxFromViews) && Lodash.isEqual(target.bgColor, this.bgColor))
      return false;

    this.bgColor = target.bgColor;
    this.boundingBoxFromViews = boundingBoxFromViews;
    return true;
  }

  public /*override*/ beforeRender(): void
  {
    super.beforeRender();
    const object3D = this.object3D;
    if (!object3D)
      return;

    const camera = this.camera;
    const cameraPosition = ThreeConverter.toWorld(camera.position);

    for (const child of object3D.children)
      this.updateVisible(child, cameraPosition);
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3DCore(): THREE.Object3D | null
  {
    const target = this.renderTarget;
    const boundingBox = this.boundingBoxFromViews;
    if (!boundingBox)
      return null;

    const center = boundingBox.center;
    const tickLength = boundingBox.diagonal / 130;

    const node = this.node;
    const style = this.style;

    this.axisColor = target.fgColor;
    this.gridColor = target.isLightBackground ? Colors.darkGrey : Colors.darkGrey;
    this.wallColor = target.bgColor;
    this.textColor = target.fgColor;

    // Initialize the corners and the centers
    this.corners = boundingBox.getCornerPoints();
    const useWall = AxisThreeView.getUseWall(boundingBox);
    const transformer = this.transformer;
    for (let wallIndex = 0; wallIndex < 6; wallIndex++)
    {
      const indexes = Range3.getWallCornerIndexes(wallIndex);
      this.centersIn3d[wallIndex] = Vector3.getCenterOf4(this.corners[indexes[0]], this.corners[indexes[1]], this.corners[indexes[2]], this.corners[indexes[3]]);
      transformer.transformTo3D(this.centersIn3d[wallIndex]);
    }

    // Start adding components
    const group = new THREE.Group();

    // Add Walls
    for (let wallIndex = 0; wallIndex < 6; wallIndex++)
      this.addWall(group, useWall, wallIndex);

    // Add X axis
    const inc = AxisThreeView.getGridInc(boundingBox);
    if (boundingBox.x.hasSpan)
    {
      this.addAxis(group, useWall, inc, tickLength, 0, 1, 0, center, 1, 2);
      this.addAxis(group, useWall, inc, tickLength, 3, 2, 0, center, 2, 4);
      this.addAxis(group, useWall, inc, tickLength, 7, 6, 0, center, 4, 5);
      this.addAxis(group, useWall, inc, tickLength, 4, 5, 0, center, 1, 5);
    }

    // Add Y axis
    if (boundingBox.y.hasSpan)
    {
      this.addAxis(group, useWall, inc, tickLength, 3, 0, 1, center, 0, 2);
      this.addAxis(group, useWall, inc, tickLength, 1, 2, 1, center, 2, 3);
      this.addAxis(group, useWall, inc, tickLength, 5, 6, 1, center, 3, 5);
      this.addAxis(group, useWall, inc, tickLength, 7, 4, 1, center, 0, 5);
    }
    // Add Z axis
    if (boundingBox.z.hasSpan)
    {
      this.addAxis(group, useWall, inc, tickLength, 0, 4, 2, center, 0, 1);
      this.addAxis(group, useWall, inc, tickLength, 1, 5, 2, center, 1, 3);
      this.addAxis(group, useWall, inc, tickLength, 2, 6, 2, center, 3, 4);
      this.addAxis(group, useWall, inc, tickLength, 3, 7, 2, center, 0, 4);
    }

    // Add Grid
    this.addGrid(group, useWall, 0, inc, 1, 2);
    this.addGrid(group, useWall, 1, inc, 0, 2);
    this.addGrid(group, useWall, 2, inc, 0, 1);
    this.addGrid(group, useWall, 3, inc, 1, 2);
    this.addGrid(group, useWall, 4, inc, 0, 2);
    this.addGrid(group, useWall, 5, inc, 0, 1);

    return group;
  }

  //==================================================
  // INSTANCE METHODS: Add wall
  //==================================================

  private addAxis(group: THREE.Group, usedWall: boolean[], inc: number, tickLength: number, i0: number, i1: number, dimension: number, center: Vector3,
    wallIndex0: number, wallIndex1: number): void
  {
    if (!usedWall[wallIndex0] && !usedWall[wallIndex1])
      return;

    const transformer = this.transformer;

    // Draw X axis
    for (let i = 0; i < 2; i++)
    {
      const isMainAxis = i === 0;
      let color: Color;
      if (isMainAxis)
      {
        if (dimension === 0)
          color = this.axisColor.mix(Colors.red, 0.3 * 2);
        else if (dimension === 1)
          color = this.axisColor.mix(Colors.green, 0.3 * 2);
        else
          color = this.axisColor.mix(Colors.blue, 0.4 * 2);
      }
      else
        color = this.axisColor;

      const lineWidth = isMainAxis ? 2 : 1;

      const geometry = new THREE.Geometry();
      geometry.vertices.push(transformer.to3D(this.corners[i0]));
      geometry.vertices.push(transformer.to3D(this.corners[i1]));

      const material = new THREE.LineBasicMaterial({ color: ThreeConverter.to3DColor(color), linewidth: lineWidth });
      const object = new THREE.LineSegments(geometry, material);

      this.setUserDataOnAxis(object, wallIndex0, wallIndex1, isMainAxis);
      group.add(object);
    }
    {
      const [realRange, tickInc] = AxisThreeView.getRealRange(inc, this.corners[i0].getAt(dimension), this.corners[i1].getAt(dimension), dimension, transformer.zScale);
      if (realRange.isEmpty)
        return;

      const geometry = new THREE.Geometry();

      const tickFontSize = tickLength * 2;
      const labelFontSize = tickFontSize * 2;
      let minLabelTick = 0;
      let labelCount = 0;

      // Draw ticks
      const labelInc = realRange.getBoldInc(tickInc);
      const tickDirection = Range3.getTickDirection(wallIndex0, wallIndex1);

      // Add tick marks and labels
      for (const anyTick of realRange.getTicks(tickInc))
      {
        const tick = Number(anyTick);
        const start = this.corners[i0].clone();
        start.setAt(dimension, tick);

        const end = start.clone();
        const vector = tickDirection.clone();

        vector.multiplyScalar(tickLength);
        end.add(vector);

        // Add tick mark
        geometry.vertices.push(transformer.to3D(start));
        geometry.vertices.push(transformer.to3D(end));

        if (!Ma.isInc(tick, labelInc))
          continue;

        if (labelCount === 0)
          minLabelTick = tick;
        labelCount++;

        end.add(vector);

        transformer.transformTo3D(end);

        // Add label
        const label = SpriteCreator.createByPositionAndDirection(`${tick}`, end, tickDirection, tickFontSize, this.textColor);
        if (label)
        {
          group.add(label);
          this.setUserDataOnAxis(label, wallIndex0, wallIndex1, true);
        }
      }
      // Add axis label
      {
        // Find the position by collision detect
        let position: Vector3;
        if (labelCount >= 2)
        {
          let tick = minLabelTick + Math.round(0.5 * labelCount - 0.5) * labelInc;
          if (labelInc === tickInc)
            tick -= tickInc / 2;
          else
            tick -= tickInc;

          position = this.corners[i0].clone();
          position.setAt(dimension, tick);
        }
        else
        {
          position = Vector3.getCenterOf2(this.corners[i0], this.corners[i1]);
        }
        position = Vector3.addWithFactor(position, tickDirection, tickLength * 5);

        transformer.transformTo3D(position);

        // Align the text
        const label = SpriteCreator.createByPositionAndDirection(Vector3.getAxisName(dimension), position, tickDirection, labelFontSize, this.textColor);
        if (label)
        {
          group.add(label);
          this.setUserDataOnAxis(label, wallIndex0, wallIndex1, true);
        }
      }
      const threeColor = ThreeConverter.to3DColor(this.axisColor);
      const material = new THREE.LineBasicMaterial({ color: threeColor, linewidth: 1 });
      const object = new THREE.LineSegments(geometry, material);

      this.setUserDataOnAxis(object, wallIndex0, wallIndex1, true);
      group.add(object);
    }
  }

  //==================================================
  // INSTANCE METHODS: Add wall
  //==================================================

  private addWall(group: THREE.Group, usedWall: boolean[], wallIndex: number): void
  {
    if (!usedWall[wallIndex])
      return;

    const indexes = Range3.getWallCornerIndexes(wallIndex);
    const geometry = new THREE.Geometry();

    const transformer = this.transformer;
    geometry.vertices.push(transformer.to3D(this.corners[indexes[0]]));
    geometry.vertices.push(transformer.to3D(this.corners[indexes[1]]));
    geometry.vertices.push(transformer.to3D(this.corners[indexes[2]]));
    geometry.vertices.push(transformer.to3D(this.corners[indexes[3]]));
    geometry.faces.push(new THREE.Face3(0, 1, 2));
    geometry.faces.push(new THREE.Face3(0, 2, 3));

    const threeColor = ThreeConverter.to3DColor(this.wallColor);
    const squareMaterial = new THREE.MeshBasicMaterial({
      color: threeColor,
      side: THREE.BackSide,
      polygonOffset: true,
      polygonOffsetFactor: 1.0,
      polygonOffsetUnits: 4.0
    });
    const object = new THREE.Mesh(geometry, squareMaterial);
    this.setUserDataOnWall(object, wallIndex);
    group.add(object);
  }

  //==================================================
  // INSTANCE METHODS: Add grid
  //==================================================

  private addGrid(group: THREE.Group, usedWall: boolean[], wallIndex: number, inc: number, dim1: number, dim2: number): void
  {
    if (!usedWall[wallIndex])
      return;

    const indexes = Range3.getWallCornerIndexes(wallIndex);
    const geometry = new THREE.Geometry();

    this.addGridInOneDirection(geometry, inc, indexes[0], indexes[1], indexes[3], dim1);
    this.addGridInOneDirection(geometry, inc, indexes[0], indexes[3], indexes[1], dim2);

    const threeColor = ThreeConverter.to3DColor(this.gridColor);
    const material = new THREE.LineBasicMaterial({ color: threeColor, linewidth: 1 });
    const object = new THREE.LineSegments(geometry, material);

    this.setUserDataOnWall(object, wallIndex);
    group.add(object);
  }

  private addGridInOneDirection(geometry: THREE.Geometry, inc: number, i0: number, i1: number, i2: number, dimension: number): void
  {
    //   p2               
    //     +-----------+
    //     | | | | | | |
    //     | | | | | | | <--- Draw these lines
    //     | | | | | | |
    //     +-----------+
    //   p0            p1

    const transformer = this.transformer;

    const p0 = this.corners[i0].clone();
    const p1 = this.corners[i1].clone();
    const p2 = this.corners[i2].clone();

    const [realRange, realInc] = AxisThreeView.getRealRange(inc, p0.getAt(dimension), p1.getAt(dimension), dimension, transformer.zScale);

    if (realRange.isEmpty)
      return;

    const boldInc = realRange.getBoldInc(realInc);
    for (const anyTick of realRange.getTicks(realInc))
    {
      const tick = Number(anyTick);
      if (!Ma.isInc(tick, boldInc))
        continue;

      p0.setAt(dimension, tick);
      p2.setAt(dimension, tick);

      geometry.vertices.push(transformer.to3D(p0));
      geometry.vertices.push(transformer.to3D(p2));
    }
  }

  //==================================================
  // INSTANCE METHODS: Visibility
  //==================================================

  private setUserDataOnWall(object: THREE.Object3D, setUserDataOnWall: number): void
  {
    object.userData[WallIndex0Name] = setUserDataOnWall;
  }

  private setUserDataOnAxis(object: THREE.Object3D, wallIndex0: number, wallIndex1: number, mainAxis: boolean): void
  {
    object.userData[WallIndex0Name] = wallIndex0;
    object.userData[WallIndex1Name] = wallIndex1;
    object.userData[MainAxisName] = mainAxis;
  }

  private updateVisible(object: THREE.Object3D, cameraPosition: Vector3): void
  {
    const wallIndex0 = object.userData[WallIndex0Name];
    if (wallIndex0 === undefined)
      return;

    const visible0 = this.isWallVisible(wallIndex0, cameraPosition);
    const wallIndex1 = object.userData[WallIndex1Name];
    if (wallIndex1 === undefined)
    {
      object.visible = visible0;
      return;
    }
    const visible1 = this.isWallVisible(wallIndex1, cameraPosition);
    const mainAxis = object.userData[MainAxisName];
    if (mainAxis)
      object.visible = visible0 !== visible1;
    else
      object.visible = visible0 && visible1;
  }

  private isWallVisible(wallIndex: number, cameraPosition: Vector3): boolean
  {
    const cameraDirection = Vector3.substract(this.centersIn3d[wallIndex], cameraPosition);
    const normal = Range3.getWallNormal(wallIndex);
    return cameraDirection.getDot(normal) > 0;
  }

  //==================================================
  // STATIC METHODS: Getters
  //==================================================

  private static getGridInc(range: Range3): number
  {
    let inc = 0;
    const numTicks = 25;
    if (range.x.hasSpan)
      inc = Math.max(inc, range.x.getBestInc(numTicks));
    if (range.y.hasSpan)
      inc = Math.max(inc, range.y.getBestInc(numTicks));
    if (range.z.hasSpan)
      inc = Math.max(inc, range.z.getBestInc(numTicks));
    return inc;
  }

  private static getRealRange(inc: number, min: number, max: number, dimension: number, zScale: number): [Range1, number]
  {
    // Calculate the correct inc and range
    const range = new Range1(min, max);
    if (dimension === 2 && zScale !== 1) // If z scale:
    {
      const numTicks = range.getNumTicks(inc);
      inc = range.getBestInc(numTicks * zScale * 2);
    }
    return [range, inc];
  }

  //==================================================
  // STATIC METHODS: Visibility
  //==================================================

  private static getUseWall(range: Range3): boolean[]
  {
    const usedWall: boolean[] = new Array<boolean>(6);
    usedWall[0] = range.y.hasSpan && range.z.hasSpan;
    usedWall[1] = range.x.hasSpan && range.z.hasSpan;
    usedWall[2] = range.x.hasSpan && range.y.hasSpan;
    usedWall[3] = range.y.hasSpan && range.z.hasSpan;
    usedWall[4] = range.x.hasSpan && range.z.hasSpan;
    usedWall[5] = range.x.hasSpan && range.y.hasSpan;
    return usedWall;
  }
}
