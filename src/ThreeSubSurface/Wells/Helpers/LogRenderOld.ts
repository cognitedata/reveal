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
import * as Color from "color";

import { Range1 } from "@/Core/Geometry/Range1";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { TrianglesBuffers } from "@/Core/Geometry/TrianglesBuffers";

import { Colors } from "@/Core/Primitives/Colors";
import { Ma } from "@/Core/Primitives/Ma";

import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { SpriteCreator } from "@/Three/Utilities/SpriteCreator";
import { TextureKit } from "@/Three/Utilities/TextureKit";

import { FloatLog } from "@/SubSurface/Wells/Logs/FloatLog";
import { DiscreteLog } from "@/SubSurface/Wells/Logs/DiscreteLog";
import { FloatLogSample } from "@/SubSurface/Wells/Samples/FloatLogSample";
import { WellTrajectory } from "@/SubSurface/Wells/Logs/WellTrajectory";

export class LogRenderOld
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

  public addTickMarks(group: THREE.Group, bandColor: Color, textColor: Color, mdRange: Range1, tickFontSize: number, inc: number, right: boolean, left: boolean)
  {

    const geometry = new THREE.Geometry();
    const labelInc = mdRange.getBoldInc(inc, 5);
    const endTickmark = this.bandRange.max + this.bandRange.delta * 0.1;
    const startLabel = this.bandRange.max + this.bandRange.delta * 0.2;
    const position = Vector3.newZero;
    const tangent = Vector3.newZero;

    for (const anyTick of mdRange.getTicks(inc))
    {
      const md = Number(anyTick);
      if (!this.trajectory.getPositionAtMd(md, position))
        continue;

      if (!this.trajectory.getTangentAtMd(md, tangent))
        continue;

      // Get perpendicular
      const cameraDirection = Vector3.substract(position, this.cameraPosition);
      const prependicular = cameraDirection.getNormal(tangent);
      if (!right)
        prependicular.negate();

      const startPosition = Vector3.addWithFactor(position, prependicular, this.bandRange.min);
      const endPosition = Vector3.addWithFactor(position, prependicular, endTickmark);

      // Add tick mark
      geometry.vertices.push(ThreeConverter.toThreeVector3(startPosition));
      geometry.vertices.push(ThreeConverter.toThreeVector3(endPosition));

      if (!Ma.isInc(md, labelInc))
        continue;

      // Add label
      const labelEndPosition = Vector3.addWithFactor(position, prependicular, startLabel);
      const label = SpriteCreator.createByPositionAndDirection(`${md}`, labelEndPosition, prependicular, tickFontSize, textColor);
      if (label)
        group.add(label);
    }
    const material = new THREE.LineBasicMaterial({ color: ThreeConverter.toThreeColor(bandColor) });
    const lineSegments = new THREE.LineSegments(geometry, material);
    group.add(lineSegments);
  }

  //==================================================
  // INSTANCE METHODS: FloatLog
  //==================================================

  public addLineFloatLog(group: THREE.Group, log: FloatLog, color: Color, right: boolean): void
  {
    const valueRange = log.range;
    const geometry = new THREE.Geometry();
    const position = Vector3.newZero;
    const tangent = Vector3.newZero;

    for (const baseSample of log.samples)
    {
      if (!this.trajectory.getPositionAtMd(baseSample.md, position))
        continue;

      if (!this.trajectory.getTangentAtMd(baseSample.md, tangent))
        continue;

      // Get perpendicular
      const cameraDirection = Vector3.substract(position, this.cameraPosition);
      const prependicular = cameraDirection.getNormal(tangent);
      if (!right)
        prependicular.negate();

      const sample = baseSample as FloatLogSample;
      const fraction = valueRange.getFraction(sample.value);
      const value = this.bandRange.getValue(fraction);

      const endPosition = Vector3.addWithFactor(position, prependicular, value);
      geometry.vertices.push(ThreeConverter.toThreeVector3(endPosition));
    }
    const material = new THREE.LineBasicMaterial({ color: ThreeConverter.toThreeColor(color) });
    const line = new THREE.Line(geometry, material);
    group.add(line);
  }

  public addSolidFloatLog(group: THREE.Group, log: FloatLog, right: boolean): void
  {
    const valueRange = log.range;
    const buffers = new TrianglesBuffers(2 * log.length, true);
    const position = Vector3.newZero;
    const tangent = Vector3.newZero;

    for (const baseSample of log.samples)
    {
      if (!this.trajectory.getPositionAtMd(baseSample.md, position))
        continue;

      if (!this.trajectory.getTangentAtMd(baseSample.md, tangent))
        continue;

      // Get perpendicular
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
        color: ThreeConverter.toThreeColor(Colors.white),
        side: right ? THREE.FrontSide : THREE.BackSide,
        map: texture
      });

      LogRenderOld.setPolygonOffset(material, 1);
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);
    }
  }

  //==================================================
  // INSTANCE METHODS: DiscreteLog
  //==================================================

  public addSolidDiscreteLog(group: THREE.Group, log: DiscreteLog, right: boolean): void
  {
    const valueRange = log.range;
    const buffers = new TrianglesBuffers(log.length * 4 - 2);
    const colors = new Array<number>();
    const position = Vector3.newZero;
    const tangent = Vector3.newZero;

    let prevColor = Colors.white;
    for (let i = 0; i < log.samples.length; i++)
    {
      const sample = log.getAt(i);
      if (!this.trajectory.getPositionAtMd(sample.md, position))
        continue;

      if (!this.trajectory.getTangentAtMd(sample.md, tangent))
        continue;

      // Get perpendicular
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
        const color = sample.isEmpty ? Colors.grey : Colors.getNextColor(sample.value);
        buffers.addPair(startPosition, endPosition, normal, normal);
        TextureKit.add(colors, color);
        TextureKit.add(colors, color);
        prevColor = color;
      }
    }
    {
      const geometry = buffers.getBufferGeometry();
      geometry.setAttribute("color", new THREE.Uint8BufferAttribute(colors, 3, true));

      const material = new THREE.MeshLambertMaterial({
        side: right ? THREE.FrontSide : THREE.BackSide,
        vertexColors: true,
        emissiveIntensity: 100,
      });
      LogRenderOld.setPolygonOffset(material, 1);
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);
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
