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

import * as THREE from 'three';
import { BaseGroupThreeView } from "./BaseGroupThreeView";
import { PolylinesNode } from "../Nodes/PolylinesNode";
import { PolylinesRenderStyle } from "../Nodes/PolylinesRenderStyle";
import { ThreeConverter } from "./ThreeConverter";
import { Colors } from "../Core/PrimitiveClasses/Colors";
import { Ma } from "../Core/PrimitiveClasses/Ma";
import { NodeEventArgs } from "../Core/Views/NodeEventArgs";
import { Range3 } from '../Core/Geometry/Range3';
import { Range1 } from '../Core/Geometry/Range1';
import { Vector3 } from '../Core/Geometry/Vector3';
import { TreeLabel } from "./Utilities/TreeLabel";
import * as Color from 'color'

export class AxisThreeView extends BaseGroupThreeView
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE PROPERTIES
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

  public /*override*/ beforeRender(): void 
  {
    super.beforeRender();
    const object3D = this.object3D;
    if (!object3D)
      return;

    const target = this.renderTarget;
    const camera = target.activeCamera;
    const cameraPosition = ThreeConverter.fromVector(camera.position);

    for (const child of object3D.children)
      AxisThreeView.updateVisible(child, cameraPosition);
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  private corners: Vector3[] = [];
  private centers = new Array<Vector3>(6);
  private axisColor = Colors.red;
  private zScale = 1;

  protected /*override*/ createObject3D(): THREE.Object3D | null
  {
    const target = this.renderTarget;
    const boundingBox = target.getBoundingBoxFromViews();
    const center = boundingBox.center;
    const tickLength = boundingBox.diagonal / 200;

    const node = this.node;
    const style = this.style;

    this.zScale = 1;
    this.axisColor = Colors.black; //Foreground

    // Initialize the corners and the centers
    this.corners = boundingBox.getCornerPoints();
    const useWall = AxisThreeView.getUseWall(boundingBox);

    for (let wallIndex = 0; wallIndex < 6; wallIndex++)
    {
      const indexes = Range3.getWallCornerIndexes(wallIndex);
      this.centers[wallIndex] = Vector3.getCenterOf4(this.corners[indexes[0]], this.corners[indexes[1]], this.corners[indexes[2]], this.corners[indexes[3]]);
    }
    const group = new THREE.Group();

    const inc = AxisThreeView.getGridInc(boundingBox);

    // Walls
    for (let wallIndex = 0; wallIndex < 6; wallIndex++)
      if (useWall[wallIndex])
        this.addWall(group, wallIndex);

    // X axis
    if (boundingBox.x.hasSpan)
    {
      this.addAxis(group, useWall, inc, tickLength, 0, 1, 0, center, 1, 2);
      this.addAxis(group, useWall, inc, tickLength, 3, 2, 0, center, 2, 4);
      this.addAxis(group, useWall, inc, tickLength, 7, 6, 0, center, 4, 5);
      this.addAxis(group, useWall, inc, tickLength, 4, 5, 0, center, 1, 5);
    }

    // Y axis
    if (boundingBox.y.hasSpan)
    {
      this.addAxis(group, useWall, inc, tickLength, 3, 0, 1, center, 0, 2);
      this.addAxis(group, useWall, inc, tickLength, 1, 2, 1, center, 2, 3);
      this.addAxis(group, useWall, inc, tickLength, 5, 6, 1, center, 3, 5);
      this.addAxis(group, useWall, inc, tickLength, 7, 4, 1, center, 0, 5);
    }
    // Z axis
    if (boundingBox.z.hasSpan)
    {
      this.addAxis(group, useWall, inc, tickLength, 0, 4, 2, center, 0, 1);
      this.addAxis(group, useWall, inc, tickLength, 1, 5, 2, center, 1, 3);
      this.addAxis(group, useWall, inc, tickLength, 2, 6, 2, center, 3, 4);
      this.addAxis(group, useWall, inc, tickLength, 3, 7, 2, center, 0, 4);
    }

    // Grid
    if (useWall[0]) this.addGrid(group, 0, inc, 1, 2);
    if (useWall[1]) this.addGrid(group, 1, inc, 0, 2);
    if (useWall[2]) this.addGrid(group, 2, inc, 0, 1);
    if (useWall[3]) this.addGrid(group, 3, inc, 1, 2);
    if (useWall[4]) this.addGrid(group, 4, inc, 0, 2);
    if (useWall[5]) this.addGrid(group, 5, inc, 0, 1);

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
        color = this.axisColor

      const lineWidth = isMainAxis ? 2 : 1;

      const geometry = new THREE.Geometry();
      geometry.vertices.push(ThreeConverter.toVector(this.corners[i0]));
      geometry.vertices.push(ThreeConverter.toVector(this.corners[i1]));

      const material = new THREE.LineBasicMaterial({ color: ThreeConverter.toColor(color), linewidth: lineWidth });
      const object = new THREE.LineSegments(geometry, material);

      this.setUserDataOnAxis(object, wallIndex0, wallIndex1, isMainAxis);
      group.add(object);
    }
    {
      const [realRange, realInc] = AxisThreeView.getRealRange(inc, this.corners[i0].getAt(dimension), this.corners[i1].getAt(dimension), dimension, this.zScale);
      if (realRange.isEmpty)
        return;

      const geometry = new THREE.Geometry();
      const color = Colors.white;
      const axis = Vector3.getAxis(dimension);
      const tickStart = this.corners[i0].copy();

      let tickFontSize = tickLength * 3;
      let labelFontSize = tickFontSize * 2;
      let minBoldTick = 0;
      let numBoldTick = 0;

      // Draw ticks
      const boldInc = AxisThreeView.getBoldInc(realRange, realInc);

      for (const tick of realRange.getTicks(realInc)) 
      {
        const realTick = Number(tick);
        tickStart.setAt(dimension, realTick);
        if (dimension === 2)
          tickStart.scaleZ(this.zScale);

        const tickEnd = tickStart.copy();
        const tickDirection = Range3.getTickDirection(wallIndex0, wallIndex1);

        const vector = tickDirection.copy();
        vector.multiplyByNumber(tickLength);

        tickEnd.add(vector);

        geometry.vertices.push(ThreeConverter.toVector(tickStart));
        geometry.vertices.push(ThreeConverter.toVector(tickEnd));

        if (!Ma.isInc(realTick, boldInc))
          continue;

        if (numBoldTick === 0)
          minBoldTick = realTick;
        numBoldTick++;

        tickEnd.add(vector);

        //if (down)
        //{
        //  vector = tickDirection.copy();
        //  vector.multiplyByNumber(tickFontSize);
        //  tickEnd.add(vector);
        //}
        tickEnd.z /= this.zScale;

        const label = TreeLabel.create(`${realTick}`, tickFontSize, true);
        if (!label)
          continue;

        const deltaX = label.scale.x;
        const deltaY = label.scale.y;


        label.position.copy(ThreeConverter.toVector(tickEnd));

        if (dimension === 0) {
          if (tickDirection.y > 0)
            label.position.y += deltaY / 2;
          else
            label.position.y -= deltaY / 2;
        }
        if (dimension === 1)
        {
          if (tickDirection.y > 0)
            label.position.y += deltaY / 2;
          else
            label.position.y -= deltaY / 2;
        }

        group.add(label);

        this.setUserDataOnAxis(label, wallIndex0, wallIndex1, true);
      }

      // Draw axis label
      {
        let textPoint: Vector3;
        if (numBoldTick >= 2)
        {
          numBoldTick /= 2;
          const tick = minBoldTick + numBoldTick * boldInc - realInc;
          tickStart.setAt(dimension, tick);
          textPoint = tickStart.copy();
          if (dimension === 2)
            textPoint.scaleZ(this.zScale);
        }
        else
          textPoint = Vector3.getCenterOf2(this.corners[i0], this.corners[i1]);

        //const tickDirection = AxisThreeView.getTickDirection(camera, center, axis, textPoint);
        //let vector = tickDirection.copy();
        //vector.multiplyByNumber(tickLength * 5);
        //textPoint.add(vector);

        //const alignment = this.getAligment(camera, tickDirection, out const down);

        //if (down)
        //{
        //  // TODO: Generalize this vertical alignment
        //  vector = tickDirection.copy();
        //  vector.multiplyByNumber(labelFontSize);
        //  textPoint.add(vector);
        //}
        //textPoint.z /= this.zScale;
        //GlCache.AddText(Vector3.GetAxisName(dimension), textPoint, labelFontSize, _axisColor, alignment);
      }
      const threeColor = ThreeConverter.toColor(color);
      const material = new THREE.LineBasicMaterial({ color: threeColor, linewidth: 2 });
      const object = new THREE.LineSegments(geometry, material);

      this.setUserDataOnAxis(object, wallIndex0, wallIndex1, true);
      group.add(object);
    }
  }

  //==================================================
  // INSTANCE METHODS: Add wall
  //==================================================

  private addWall(group: THREE.Group, wallIndex: number): void
  {
    const indexes = Range3.getWallCornerIndexes(wallIndex);
    const geometry = new THREE.Geometry();

    geometry.vertices.push(ThreeConverter.toVector(this.corners[indexes[0]]));
    geometry.vertices.push(ThreeConverter.toVector(this.corners[indexes[1]]));
    geometry.vertices.push(ThreeConverter.toVector(this.corners[indexes[2]]));
    geometry.vertices.push(ThreeConverter.toVector(this.corners[indexes[3]]));
    geometry.faces.push(new THREE.Face3(0, 1, 2));
    geometry.faces.push(new THREE.Face3(0, 2, 3));

    const threeColor = ThreeConverter.toColor(Colors.grey);
    const squareMaterial = new THREE.MeshBasicMaterial({
      color: threeColor,
      side: THREE.DoubleSide, //BackSide,
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

  private addGrid(group: THREE.Group, wallIndex: number, inc: number, dim1: number, dim2: number): void
  {
    const indexes = Range3.getWallCornerIndexes(wallIndex);
    const geometry = new THREE.Geometry();

    this.addGridInOneDirection(geometry, inc, indexes[0], indexes[1], indexes[3], dim1);
    this.addGridInOneDirection(geometry, inc, indexes[0], indexes[3], indexes[1], dim2);

    const threeColor = ThreeConverter.toColor(Colors.white);
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

    const p0 = this.corners[i0].copy();
    const p1 = this.corners[i1].copy();
    const p2 = this.corners[i2].copy();

    const zScale = 1;
    const [realRange, realInc] = AxisThreeView.getRealRange(inc, p0.getAt(dimension), p1.getAt(dimension), dimension, zScale);

    if (realRange.isEmpty)
      return;

    const boldInc = AxisThreeView.getBoldInc(realRange, realInc);
    for (const tick of realRange.getTicks(realInc))
    {
      const realTick = Number(tick);
      if (!Ma.isInc(realTick, boldInc))
        continue;

      p0.setAt(dimension, realTick);
      p2.setAt(dimension, realTick);

      if (dimension === 2)
      {
        p0.scaleZ(zScale);
        p2.scaleZ(zScale);
      }
      geometry.vertices.push(ThreeConverter.toVector(p0));
      geometry.vertices.push(ThreeConverter.toVector(p2));
    }
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

  private static getBoldInc(range: Range1, inc: number): number
  {
    let numTicks = 0;
    const boldInc = inc * 2;
    for (const tick of range.getTicks(inc))
    {
      const realTick = Number(tick);
      if (!Ma.isInc(realTick, boldInc))
        continue;

      numTicks++;
      if (numTicks > 1)
        return boldInc;
    }
    return inc;
  }


  private static getRealRange(inc: number, min: number, max: number, dimension: number, zScale: number): [Range1, number]
  {
    // Calculate the correct inc and range
    const range = new Range1(min, max);
    if (dimension === 2 && zScale !== 1) // If z scale:
    {
      const numTicks = range.getNumTicks(inc);
      range.scale(1 / zScale);
      inc = range.getBestInc(numTicks);
    }
    if (!range.roundByInc(-inc))
      return [new Range1(), 0];
    return [range, inc];
  }

  private static getInc(inc: number, min: number, max: number, dimension: number, zScale: number): number
  {
    // Calculate the correct inc and range
    const range = new Range1(min, max);
    if (dimension === 2 && zScale !== 1) // If z scale:
    {
      const numTicks = range.getNumTicks(inc);
      range.scale(1 / zScale);
      inc = range.getBestInc(numTicks);
    }
    return inc;
  }

  //==================================================
  // STATIC METHODS: Visibility
  //==================================================

  public setUserDataOnWall(object: THREE.Object3D, setUserDataOnWall: number): void
  {
    object.userData["wallIndex0"] = setUserDataOnWall;
    object.userData["wallCenter0"] = this.centers[setUserDataOnWall];
  }

  public setUserDataOnAxis(object: THREE.Object3D, wallIndex0: number, wallIndex1: number, mainAxis: boolean): void
  {
    object.userData["wallIndex0"] = wallIndex0;
    object.userData["wallIndex1"] = wallIndex1;
    object.userData["wallCenter0"] = this.centers[wallIndex0];
    object.userData["wallCenter1"] = this.centers[wallIndex1];
    object.userData["mainAxis"] = mainAxis;
  }

  public static updateVisible(object: THREE.Object3D, cameraPosition: Vector3): void
  {
    const wallIndex0 = object.userData["wallIndex0"];
    const wallCenter0 = object.userData["wallCenter0"];
    if (wallIndex0 === undefined || wallCenter0 === undefined)
      return;

    const visible0 = AxisThreeView.isVisible(wallIndex0, wallCenter0, cameraPosition);

    const wallIndex1 = object.userData["wallIndex1"];
    const wallCenter1 = object.userData["wallCenter1"];
    if (wallIndex1 === undefined || wallCenter1 === undefined)
    {
      object.visible = visible0;
      return;
    }
    const visible1 = AxisThreeView.isVisible(wallIndex1, wallCenter1, cameraPosition);

    const mainAxis = object.userData["mainAxis"];
    if (mainAxis)
      object.visible = visible0 !== visible1;
    else
      object.visible = visible0 && visible1;
  }

  public static isVisible(wallIndex: number, wallCenter: Vector3, cameraPosition: Vector3): boolean
  {
    const normal = Range3.getWallNormal(wallIndex);
    const cameraDirection = wallCenter.copy();
    cameraDirection.substract(cameraPosition);
    return cameraDirection.dot(normal) > 0;

    //const threeDirection = new THREE.Vector3();
    //camera.getWorldDirection(threeDirection);
    //const direction = ThreeConverter.fromVector(threeDirection);
  }

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


  //private static getTickDirection(camera: THREE.Camera, center: Vector3, axis: Vector3, tickStart: Vector3): Vector3
  //{
  //  const cameraDirection = camera.IsOrthographic ? camera.Forward : tickStart - camera.Position;
  //  const tickDirection = cameraDirection.Normal(axis);
  //  const vectorFromCenter = tickStart - center;
  //  if (vectorFromCenter.Dot2(tickDirection) < 0)
  //    tickDirection.Negate();

  //  return tickDirection;
  //}

}
