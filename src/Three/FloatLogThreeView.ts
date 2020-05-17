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
import * as Color from 'color'

import { BaseGroupThreeView } from "./BaseGroupThreeView";
import { WellTrajectoryNode } from "../Nodes/Wells/Wells/WellTrajectoryNode";
import { FloatLogNode } from "../Nodes/Wells/Wells/FloatLogNode";
import { FloatLog } from "../Nodes/Wells/Logs/FloatLog";
import { WellTrajectory } from "../Nodes/Wells/Logs/WellTrajectory";
import { WellRenderStyle } from "../Nodes/Wells/Wells/WellRenderStyle";
import { ThreeConverter } from "./ThreeConverter";
import { NodeEventArgs } from "../Core/Views/NodeEventArgs";
import { Range3 } from '../Core/Geometry/Range3';
import { ThreeLabel as TreeLabel } from "./Utilities/ThreeLabel";
import { TrajectorySample } from "../Nodes/Wells/Samples/TrajectorySample";
import { FloatLogSample } from "../Nodes/Wells/Samples/FloatLogSample";
import { Vector3 } from "../Core/Geometry/Vector3";
import { TriangleStripBuffers } from "../Core/Geometry/TriangleStripBuffers";
import { Colors } from '../Core/PrimitiveClasses/Colors';
import { Range1 } from "../Core/Geometry/Range1";
import { Changes } from "../Core/Views/Changes";
import { Ma } from "../Core/PrimitiveClasses/Ma";
import { TextureKit } from './TextureKit';

export class FloatLogThreeView extends BaseGroupThreeView
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get node(): FloatLogNode { return super.getNode() as FloatLogNode; }
  protected get style(): WellRenderStyle { return super.getStyle() as WellRenderStyle; }

  private cameraDirection: Vector3 = new Vector3(0, 0, 1);
  private cameraPosition: Vector3 = new Vector3(0, 0, 1);

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  public /*override*/ beforeRender(): void 
  {
    super.beforeRender();

    const node = this.node;

    const wellTrajectoryNode = node.wellTrajectory;
    if (!wellTrajectoryNode)
      return;

    const wellTrajectory = wellTrajectoryNode.data;
    if (!wellTrajectory)
      return;

    const target = this.renderTarget;
    const camera = target.activeCamera;
    const cameraPosition = ThreeConverter.fromVector(camera.position);
    const cameraDirection = wellTrajectory.getRange().center;

    cameraDirection.substract(cameraPosition);
    cameraDirection.normalize();

    const angle = Math.acos(cameraDirection.getDot(this.cameraDirection));
    if (angle < 0.01)
      return;

    this.cameraDirection = cameraDirection;
    this.cameraPosition = cameraPosition;
    this.update(new NodeEventArgs(Changes.geometry));
  }

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    super.updateCore(args);
  }

  public calculateBoundingBoxCore(): Range3 | undefined
  {
    const node = this.node;

    const wellTrajectoryNode = node.wellTrajectory;
    if (!wellTrajectoryNode)
      return undefined;

    const boundingBox = wellTrajectoryNode.boundingBox;
    if (!boundingBox)
      return undefined;

    boundingBox.expandByMargin(this.style.radius);
    return boundingBox;
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3D(): THREE.Object3D | null
  {
    const node = this.node;
    const style = this.style;

    const wellTrajectoryNode = node.wellTrajectory;
    if (!wellTrajectoryNode)
      return null;

    const wellRenderStyle = wellTrajectoryNode.getRenderStyle() as WellRenderStyle;;
    if (!wellRenderStyle)
      return null;

    const trajectory = wellTrajectoryNode.data;
    if (!trajectory)
      return null;

    const log = node.data;
    if (!log)
      throw Error("Well trajectory is missing");

    const valueRange = log.getRange();
    const bandRange = new Range1(wellRenderStyle.radius, 150);
    const mdRange = log.getMdRange();
    const group = new THREE.Group();

    const axisColor = Colors.grey;
    const bandColor = Colors.white;
    const logColor = node.color;

    this.addTickMarks(group, trajectory, axisColor, bandRange, mdRange, 25, 50);
    this.addBand(group, trajectory, bandColor, bandRange, mdRange);
    if (node.childIndex === 0)
    {
      this.addSolidLog(group, trajectory, log, logColor, bandRange, valueRange);
      this.addLineLog(group, trajectory, log, Colors.black, bandRange, valueRange);
    }
    else
      this.addLineLog(group, trajectory, log, logColor, bandRange, valueRange);

    return group;
  }


  private addLineLog(group: THREE.Group, trajectory: WellTrajectory, log: FloatLog, color: Color, bandRange: Range1, valueRange: Range1): void
  {
    const geometry = new THREE.Geometry();
    for (const baseSample of log.samples)
    {
      const position = trajectory.getAtMd(baseSample.md);
      const tangent = trajectory.getTangentAtMd(baseSample.md);

      const cameraDirection = Vector3.substract(position, this.cameraPosition);
      const prependicular = cameraDirection.getNormal(tangent);

      const sample = baseSample as FloatLogSample;
      const fraction = valueRange.getFraction(sample.value);
      const value = bandRange.getValue(fraction);

      const endPosition = Vector3.addFactor(position, prependicular, value);
      geometry.vertices.push(ThreeConverter.toVector(endPosition));

    }
    const material = new THREE.LineBasicMaterial({ color: ThreeConverter.toColor(color) });
    const line = new THREE.Line(geometry, material);
    group.add(line);
  }

  private addSolidLog(group: THREE.Group, trajectory: WellTrajectory, log: FloatLog, color: Color, bandRange: Range1, valueRange: Range1): void
  {
    const buffers = new TriangleStripBuffers(2 * log.count, true);

    for (const baseSample of log.samples)
    {
      const position = trajectory.getAtMd(baseSample.md);
      const tangent = trajectory.getTangentAtMd(baseSample.md);

      const cameraDirection = Vector3.substract(position, this.cameraPosition);
      const prependicular = cameraDirection.getNormal(tangent);
      const normal = prependicular.getNormal(tangent);

      const startPosition = Vector3.addFactor(position, prependicular, bandRange.min);

      const sample = baseSample as FloatLogSample;
      const fraction = valueRange.getFraction(sample.value);
      const value = bandRange.getValue(fraction);

      const endPosition = Vector3.addFactor(position, prependicular, value);

      buffers.addPair(startPosition, endPosition, normal, normal, fraction);
    }
    {
      const geometry = buffers.getBufferGeometry();
      color = Colors.white;

      const material1 = new THREE.MeshPhongMaterial({
        color: ThreeConverter.toColor(color),
        side: THREE.FrontSide,
        shininess: 10,
        polygonOffset: true,
        polygonOffsetFactor: 1.0,
        polygonOffsetUnits: 4.0,
        specular: ThreeConverter.toColor(color),
        //emissive: ThreeConverter.toColor(color),
        //emissiveIntensity: 0.1,
      });

      const material = new THREE.MeshLambertMaterial({
        color: ThreeConverter.toColor(color),
        side: THREE.FrontSide,
        polygonOffset: true,
        polygonOffsetFactor: 1.0,
        polygonOffsetUnits: 4.0,
        //emissive: ThreeConverter.toColor(color),
        //emissiveIntensity: 0.1,
      });

      //if (style.colorType === ColorType.DepthColor && buffers.uvs)
      {
        buffers.addUv(geometry);
        const texture = TextureKit.create1D(valueRange);
        texture.anisotropy = 4;
        material.map = texture;
        //material.emissiveMap = texture;
        //material.emissiveIntensity = 1;
      }

      //const material = createShader();
      const mesh = new THREE.Mesh(geometry, material);
      //mesh.position.set(grid.xOrigin, grid.yOrigin, 0);
      mesh.drawMode = THREE.TrianglesDrawMode; //THREE.TriangleStripDrawMode (must use groups)
      group.add(mesh);
    }
  }



  private addBand(group: THREE.Group, trajectory: WellTrajectory, color: Color, bandRange: Range1, mdRange: Range1): void
  {
    const node = this.node;

    const wellTrajectoryNode = node.wellTrajectory;
    if (!wellTrajectoryNode)
      return;

    const buffers = new TriangleStripBuffers(2 * trajectory.count, false);

    for (const baseSample of trajectory.samples)
    {
      const position = trajectory.getAtMd(baseSample.md);
      const tangent = trajectory.getTangentAtMd(baseSample.md);
      const cameraDirection = Vector3.substract(position, this.cameraPosition);
      const prependicular = cameraDirection.getNormal(tangent);
      const normal = prependicular.getNormal(tangent);
      const startPosition = Vector3.addFactor(position, prependicular, bandRange.min);
      const bandEndPosition = Vector3.addFactor(position, prependicular, bandRange.max);
      buffers.addPair(startPosition, bandEndPosition, normal, normal);
    }
    {
      const geometry = buffers.getBufferGeometry();
      const material = new THREE.MeshLambertMaterial({
        color: ThreeConverter.toColor(Colors.white),
        side: THREE.FrontSide,
        emissive: ThreeConverter.toColor(color),
        emissiveIntensity: 0.4,
        polygonOffset: true,
        polygonOffsetFactor: 2.0,
        polygonOffsetUnits: 8.0
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.drawMode = THREE.TrianglesDrawMode; //THREE.TriangleStripDrawMode (must use groups)
      group.add(mesh);
    }
  }


  private addTickMarks(group: THREE.Group, trajectory: WellTrajectory, color: Color, bandRange: Range1, mdRange: Range1, tickFontSize: number, inc: number)
  {
    const geometry = new THREE.Geometry();

    mdRange.roundByInc(-inc);

    const labelInc = mdRange.getBoldInc(inc, 5);
    const endTickmark = bandRange.max + bandRange.delta * 0.1;
    const startLabel = bandRange.max + bandRange.delta * 0.2;

    for (const anyTick of mdRange.getTicks(inc))
    {
      const md = Number(anyTick);
      const position = trajectory.getAtMd(md);
      const tangent = trajectory.getTangentAtMd(md);

      const cameraDirection = Vector3.substract(position, this.cameraPosition);
      const prependicular = cameraDirection.getNormal(tangent);

      const startPosition = Vector3.addFactor(position, prependicular, bandRange.min);
      const endPosition = Vector3.addFactor(position, prependicular, endTickmark);

      // Add tick mark
      geometry.vertices.push(ThreeConverter.toVector(startPosition));
      geometry.vertices.push(ThreeConverter.toVector(endPosition));

      if (!Ma.isInc(md, labelInc))
        continue;

      // Add label
      const labelEndPosition = Vector3.addFactor(position, prependicular, startLabel);
      const label = TreeLabel.createByPositionAndDirection(`${md}`, labelEndPosition, prependicular, tickFontSize, true);
      if (label)
        group.add(label);
    }
    const threeColor = ThreeConverter.toColor(color);
    const material = new THREE.LineBasicMaterial({ color: threeColor, linewidth: 1 });
    const object = new THREE.LineSegments(geometry, material);

    group.add(object);
    return group;
  }
}
