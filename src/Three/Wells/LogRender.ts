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

import { Range1 } from '../../Core/Geometry/Range1';
import { Colors } from '../../Core/PrimitiveClasses/Colors';
import { ThreeConverter } from "./../ThreeConverter";
import { ThreeLabel } from "./../Utilities/ThreeLabel";
import { Vector3 } from "../../Core/Geometry/Vector3";
import { TriangleStripBuffers } from "../../Core/Geometry/TriangleStripBuffers";
import { Ma } from "../../Core/PrimitiveClasses/Ma";
import { TextureKit } from './../TextureKit';

import { PointLog } from "../../Nodes/Wells/Logs/PointLog";
import { FloatLog } from "../../Nodes/Wells/Logs/FloatLog";
import { DiscreteLog } from "../../Nodes/Wells/Logs/DiscreteLog";
import { FloatLogSample } from "../../Nodes/Wells/Samples/FloatLogSample";
import { WellTrajectory } from "../../Nodes/Wells/Logs/WellTrajectory";

export class LogRender 
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private cameraPosition: Vector3;
  private trajectory: WellTrajectory;
  private bandRange: Range1;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(trajectory: WellTrajectory, cameraPosition: Vector3, bandRange: Range1)
  {
    this.trajectory = trajectory;
    this.cameraPosition = cameraPosition;
    this.bandRange = bandRange;
  }

  //==================================================
  // INSTANCE METHODS: Band
  //==================================================

  public addBand(group: THREE.Group, color: Color, right: boolean): void
  {
    const buffers = new TriangleStripBuffers(2 * this.trajectory.count, false);
    for (const baseSample of this.trajectory.samples)
    {
      const position = this.trajectory.getAtMd(baseSample.md);

      // Get perpendicular
      const tangent = this.trajectory.getTangentAtMd(baseSample.md);
      const cameraDirection = Vector3.substract(position, this.cameraPosition);
      const prependicular = cameraDirection.getNormal(tangent);
      if (!right)
        prependicular.negate();

      const normal = prependicular.getNormal(tangent);

      const startPosition = Vector3.addWithFactor(position, prependicular, this.bandRange.min);
      const bandEndPosition = Vector3.addWithFactor(position, prependicular, this.bandRange.max);

      buffers.addPair(startPosition, bandEndPosition, normal, normal);
    }
    {
      const geometry = buffers.getBufferGeometry();
      const material = new THREE.MeshLambertMaterial({
        color: ThreeConverter.toColor(color),
        side: right ? THREE.FrontSide : THREE.BackSide,
        emissive: ThreeConverter.toColor(color),
        emissiveIntensity: 0.33,
      });
      LogRender.setPolygonOffset(material, 2);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.drawMode = THREE.TrianglesDrawMode;
      group.add(mesh);
    }
  }

  public addTickMarks(group: THREE.Group, color: Color, mdRange: Range1, tickFontSize: number, inc: number, right: boolean)
  {
    const geometry = new THREE.Geometry();

    mdRange.roundByInc(-inc);

    const labelInc = mdRange.getBoldInc(inc, 5);
    const endTickmark = this.bandRange.max + this.bandRange.delta * 0.1;
    const startLabel = this.bandRange.max + this.bandRange.delta * 0.2;

    for (const anyTick of mdRange.getTicks(inc))
    {
      const md = Number(anyTick);
      const position = this.trajectory.getAtMd(md);

      // Get perpendicular
      const tangent = this.trajectory.getTangentAtMd(md);
      const cameraDirection = Vector3.substract(position, this.cameraPosition);
      const prependicular = cameraDirection.getNormal(tangent);
      if (!right)
        prependicular.negate();

      const startPosition = Vector3.addWithFactor(position, prependicular, this.bandRange.min);
      const endPosition = Vector3.addWithFactor(position, prependicular, endTickmark);

      // Add tick mark
      geometry.vertices.push(ThreeConverter.toVector(startPosition));
      geometry.vertices.push(ThreeConverter.toVector(endPosition));

      if (!Ma.isInc(md, labelInc))
        continue;

      // Add label
      const labelEndPosition = Vector3.addWithFactor(position, prependicular, startLabel);
      const label = ThreeLabel.createByPositionAndDirection(`${md}`, labelEndPosition, prependicular, tickFontSize, true);
      if (label)
        group.add(label);
    }
    const material = new THREE.LineBasicMaterial({ color: ThreeConverter.toColor(color) });
    const object = new THREE.LineSegments(geometry, material);
    group.add(object);
  }


  //==================================================
  // INSTANCE METHODS: FloatLog
  //==================================================

  public addLineFloatLog(group: THREE.Group, log: FloatLog, color: Color, right: boolean): void
  {
    const valueRange = log.range;
    const geometry = new THREE.Geometry();
    for (const baseSample of log.samples)
    {
      const position = this.trajectory.getAtMd(baseSample.md);

      // Get perpendicular
      const tangent = this.trajectory.getTangentAtMd(baseSample.md);
      const cameraDirection = Vector3.substract(position, this.cameraPosition);
      const prependicular = cameraDirection.getNormal(tangent);
      if (!right)
        prependicular.negate();

      const sample = baseSample as FloatLogSample;
      const fraction = valueRange.getFraction(sample.value);
      const value = this.bandRange.getValue(fraction);

      const endPosition = Vector3.addWithFactor(position, prependicular, value);
      geometry.vertices.push(ThreeConverter.toVector(endPosition));
    }
    const material = new THREE.LineBasicMaterial({ color: ThreeConverter.toColor(color) });
    const line = new THREE.Line(geometry, material);
    group.add(line);
  }

  public addSolidFloatLog(group: THREE.Group, log: FloatLog, right: boolean): void
  {
    const valueRange = log.range;
    const buffers = new TriangleStripBuffers(2 * log.count, true);

    for (const baseSample of log.samples)
    {
      const position = this.trajectory.getAtMd(baseSample.md);

      // Get perpendicular
      const tangent = this.trajectory.getTangentAtMd(baseSample.md);
      const cameraDirection = Vector3.substract(position, this.cameraPosition);
      const prependicular = cameraDirection.getNormal(tangent);
      if (!right)
        prependicular.negate();

      const normal = prependicular.getNormal(tangent);

      const startPosition = Vector3.addWithFactor(position, prependicular, this.bandRange.min);

      const sample = baseSample as FloatLogSample;
      const fraction = valueRange.getFraction(sample.value);
      const value = this.bandRange.getValue(fraction);

      const endPosition = Vector3.addWithFactor(position, prependicular, value);

      buffers.addPair(startPosition, endPosition, normal, normal, fraction);
    }
    {
      const geometry = buffers.getBufferGeometry();
      const texture = TextureKit.create1D(valueRange);
      texture.anisotropy = 4;

      const material = new THREE.MeshLambertMaterial({
        color: ThreeConverter.toColor(Colors.white),
        side: right ? THREE.FrontSide : THREE.BackSide,
        map: texture
      });

      LogRender.setPolygonOffset(material, 1);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.drawMode = THREE.TrianglesDrawMode;
      group.add(mesh);
    }
  }

  //==================================================
  // INSTANCE METHODS: DiscreteLog
  //==================================================

  public addSolidDiscreteLog(group: THREE.Group, log: DiscreteLog, right: boolean): void
  {
    const valueRange = log.range;
    const buffers = new TriangleStripBuffers(log.count * 4 -2);
    const colors = new Array<number>();

    let prevColor = Colors.white;
    for (let i = 0; i < log.samples.length; i++)
    {
      const sample = log.getAt(i);
      const position = this.trajectory.getAtMd(sample.md);

      // Get perpendicular
      const tangent = this.trajectory.getTangentAtMd(sample.md);
      const cameraDirection = Vector3.substract(position, this.cameraPosition);
      const prependicular = cameraDirection.getNormal(tangent);
      if (!right)
        prependicular.negate();

      const normal = prependicular.getNormal(tangent);

      const startPosition = Vector3.addWithFactor(position, prependicular, this.bandRange.min);
      const endPosition = Vector3.addWithFactor(position, prependicular, this.bandRange.max);

      if (i > 0) 
      {
        buffers.addPair(startPosition, endPosition, normal, normal);
        TextureKit.add(colors, prevColor);
        TextureKit.add(colors, prevColor);
      }
      if (i < log.samples.length - 1)
      {
        const valueFraction = valueRange.getFraction(sample.value);
        const color = Color.hsv(valueFraction * 360, 255, 100);
        buffers.addPair(startPosition, endPosition, normal, normal);
        TextureKit.add(colors, color);
        TextureKit.add(colors, color);
        prevColor = color;
      }
    }
    {
      const geometry = buffers.getBufferGeometry();
      geometry.addAttribute('color', new THREE.Uint8BufferAttribute(colors, 3, true));

      const material = new THREE.MeshLambertMaterial({
        side: right ? THREE.FrontSide : THREE.BackSide,
        vertexColors: THREE.VertexColors,
      });
      LogRender.setPolygonOffset(material, 1);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.drawMode = THREE.TrianglesDrawMode;
      group.add(mesh);
    }
  }

  public addPointLog(group: THREE.Group, log: PointLog, color: Color): void
  {
    const radius = this.bandRange.min * 2;
    const geometry = new THREE.SphereGeometry(radius, 16, 8);
    const material = new THREE.MeshPhongMaterial({ color: ThreeConverter.toColor(color) });

    for (let i = 0; i < log.samples.length; i++)
    {
      const sample = log.getAt(i);
      const position = this.trajectory.getAtMd(sample.md);

      const sphere = new THREE.Mesh(geometry, material);

      sphere.position.x = position.x;
      sphere.position.y = position.y;
      sphere.position.z = position.z;

      group.add(sphere);
    }
  }

  //==================================================
  // STATIC METHODS: Helpers
  //==================================================

  private static setPolygonOffset(material: THREE.Material, value: number): void
  {
    material.polygonOffset = true;
    material.polygonOffsetFactor = value / 2;
    material.polygonOffsetUnits = value * 4;
  }
}

