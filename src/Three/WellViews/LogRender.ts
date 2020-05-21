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
import * as Color from "color"

import { Range1 } from "@/Core/Geometry/Range1";
import { Vector3 } from "@/Core/Geometry/Vector3";
import { TriangleStripBuffers } from "@/Core/Geometry/TriangleStripBuffers";

import { Colors } from "@/Core/Primitives/Colors";

import { Canvas } from "@/Three/Utilities/Canvas";

import { FloatLog } from "@/Nodes/Wells/Logs/FloatLog";
import { DiscreteLog } from "@/Nodes/Wells/Logs/DiscreteLog";
import { WellTrajectory } from "@/Nodes/Wells/Logs/WellTrajectory";

export class LogRender 
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private cameraPosition: Vector3;
  private trajectoryNode: WellTrajectory;
  private bandRange: Range1;
  private mdRange: Range1;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(trajectory: WellTrajectory, cameraPosition: Vector3, bandRange: Range1, mdRange: Range1)
  {
    this.trajectoryNode = trajectory;
    this.cameraPosition = cameraPosition;
    this.bandRange = bandRange;
    this.mdRange = mdRange;
  }

  //==================================================
  // INSTANCE METHODS: Band
  //==================================================

  public static getBandName(rightBand: boolean): string { return rightBand ? "RightBand" : "LeftBand"; }

  public static setCanvas(group: THREE.Group, canvas: Canvas, rightBand: boolean): void
  {
    const object = group.getObjectByName(this.getBandName(rightBand));
    if (!object)
      return;

    if (!(object instanceof THREE.Mesh))
      return;

    const mesh = object as THREE.Mesh;
    const material = mesh.material as THREE.MeshLambertMaterial;
    if (!material)
      return;

    material.map = canvas.createTexture();
  }

  public createCanvas(): Canvas
  {
    const canvasDy = 100;
    const canvasDx = canvasDy * this.mdRange.delta / this.bandRange.delta;
    const canvas = new Canvas(canvasDx, canvasDy);
    canvas.clear(Colors.white);
    return canvas;
  }

  //==================================================
  // INSTANCE METHODS: Band
  //==================================================

  public addBand(group: THREE.Group, useRightBand: boolean, useLeftBand: boolean): void
  {
    const mdInc = 10;
    let more = true;

    let sampleCount = 0;
    for (let md = this.mdRange.min; more; md += mdInc)
    {
      more = md < this.mdRange.max;
      sampleCount++;
    }
    const rightBuffers = useRightBand ? new TriangleStripBuffers(2 * sampleCount, true) : null;
    const leftBuffers = useLeftBand ? new TriangleStripBuffers(2 * sampleCount, true) : null;
    if (leftBuffers)
      leftBuffers.side = THREE.BackSide;

    more = true;
    for (let md = this.mdRange.min; more; md += mdInc)
    {
      more = md < this.mdRange.max;
      if (!more)
        md = this.mdRange.max;

      const fraction = this.mdRange.getFraction(md);
      const position = this.trajectoryNode.getAtMd(md);

      // Get perpendicular
      const tangent = this.trajectoryNode.getTangentAtMd(md);
      const cameraDirection = Vector3.substract(position, this.cameraPosition);
      const prependicular = cameraDirection.getNormal(tangent);
      const normal = prependicular.getNormal(tangent);

      if (rightBuffers) 
      {
        const startPosition = Vector3.addWithFactor(position, prependicular, this.bandRange.min);
        const endPosition = Vector3.addWithFactor(position, prependicular, this.bandRange.max);
        rightBuffers.addPair2(startPosition, endPosition, normal, fraction);
      }
      if (leftBuffers)
      {
        normal.negate();
        const startPosition = Vector3.addWithFactor(position, prependicular, -this.bandRange.min);
        const endPosition = Vector3.addWithFactor(position, prependicular, -this.bandRange.max);
        leftBuffers.addPair2(startPosition, endPosition, normal, fraction);
      }
    }
    let rightBand = false;
    for (const buffers of [rightBuffers, leftBuffers]) 
    {
      rightBand = !rightBand;
      if (!buffers)
        continue;

      const geometry = buffers.getBufferGeometry();
      const material = new THREE.MeshLambertMaterial({
        side: buffers.side,
        transparent: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.drawMode = THREE.TrianglesDrawMode;
      mesh.name = LogRender.getBandName(rightBand);
      group.add(mesh);
    }
  }

  public addAnnotation(canvas: Canvas, rightBand: boolean): void
  {
    const inc = 50;
    canvas.beginPath();

    for (const anyTick of this.mdRange.getTicks(inc))
    {
      const md = Number(anyTick);
      const fraction = this.mdRange.getFraction(md);
      canvas.addVerticalLine(fraction);
    }
    canvas.drawPath();
    const labelInc = this.mdRange.getBoldInc(inc, 4);
    for (const anyTick of this.mdRange.getTicks(labelInc))
    {
      const md = Number(anyTick);
      const fraction = this.mdRange.getFraction(md);
      canvas.drawText(fraction, `${md}`, null, rightBand);
    }
  }

  public addFloatLog(canvas: Canvas, log: FloatLog | null, color: Color): void
  {
    if (!log)
      return;

    const valueRange = log.range;
    canvas.beginFunction();
    for (let i = 0; i < log.samples.length; i++)
    {
      const sample = log.getAt(i);
      const mdFraction = this.mdRange.getFraction(sample.md);
      const valueFraction = valueRange.getFraction(sample.value);
      canvas.addFunctionValue(mdFraction, valueFraction);
    }
    canvas.closeFunction();
    canvas.setMixMode();
    canvas.fillPathByGradient(color, 1);
    canvas.drawPath(color, 2);
    canvas.drawPath(null, 1);
  }

  public addDiscreteLog(canvas: Canvas, log: DiscreteLog | null): void
  {
    if (!log)
      return;

    let prevColor = Colors.white;
    let prevMdFraction = Number.NaN;

    for (let i = 0; i < log.samples.length; i++)
    {
      const sample = log.getAt(i);
      const color = Colors.getNextColor(sample.value);
      const mdFraction = this.mdRange.getFraction(sample.md);
      if (i > 0)
        canvas.fillRect(prevMdFraction, mdFraction, prevColor, 0.75);

      prevColor = color;
      prevMdFraction = mdFraction;
    }
  }
}

