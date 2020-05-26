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
import { TrianglesBuffers } from "@/Core/Geometry/TrianglesBuffers";

import { Colors } from "@/Core/Primitives/Colors";

import { Canvas } from "@/Three/Utilities/Canvas";

import { FloatLog } from "@/Nodes/Wells/Logs/FloatLog";
import { PointLog } from "@/Nodes/Wells/Logs/PointLog";
import { DiscreteLog } from "@/Nodes/Wells/Logs/DiscreteLog";
import { WellTrajectory } from "@/Nodes/Wells/Logs/WellTrajectory";
import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";

export class LogRender {
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private bandRange: Range1;
  private mdRange: Range1;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(bandRange: Range1, mdRange: Range1) {
    this.bandRange = bandRange;
    this.mdRange = mdRange;
  }

  //==================================================
  // INSTANCE METHODS: Band
  //==================================================

  public createCanvas(): Canvas {
    const canvasDy = 100;
    const canvasDx = canvasDy * this.mdRange.delta / this.bandRange.delta;
    const canvas = new Canvas(canvasDx, canvasDy);
    canvas.clear(Colors.white);
    return canvas;
  }

  //==================================================
  // INSTANCE METHODS: Band
  //==================================================

  public createBands(parent: THREE.Object3D, trajectory: WellTrajectory, cameraPosition: Vector3, useRightBand: boolean, useLeftBand: boolean):
    [THREE.Mesh | null, THREE.Mesh | null] {
    const mdInc = 10;
    let more = true;

    let sampleCount = 0;
    for (let md = this.mdRange.min; more; md += mdInc) {
      more = md < this.mdRange.max;
      sampleCount++;
    }
    const rightBuffers = useRightBand ? new TrianglesBuffers(2 * sampleCount, true) : null;
    const leftBuffers = useLeftBand ? new TrianglesBuffers(2 * sampleCount, true) : null;
    if (leftBuffers)
      leftBuffers.side = THREE.BackSide;

    const bands: [THREE.Mesh | null, THREE.Mesh | null] = [null, null];

    more = true;
    const position = Vector3.newZero;
    const tangent = Vector3.newZero;

    for (let md = this.mdRange.min; more; md += mdInc) {
      more = md < this.mdRange.max;
      if (!more)
        md = this.mdRange.max;

      if (!trajectory.getPositionAtMd(md, position))
        continue;

      if (!trajectory.getTangentAtMd(md, tangent))
        continue;

      const fraction = this.mdRange.getFraction(md);

      // Get perpendicular
      const cameraDirection = Vector3.substract(position, cameraPosition);
      const prependicular = cameraDirection.getNormal(tangent);
      const normal = prependicular.getNormal(tangent);

      if (rightBuffers) {
        const startPosition = Vector3.addWithFactor(position, prependicular, this.bandRange.min);
        const endPosition = Vector3.addWithFactor(position, prependicular, this.bandRange.max);
        rightBuffers.addPair2(startPosition, endPosition, normal, fraction);
      }
      if (leftBuffers) {
        normal.negate();
        const startPosition = Vector3.addWithFactor(position, prependicular, -this.bandRange.min);
        const endPosition = Vector3.addWithFactor(position, prependicular, -this.bandRange.max);
        leftBuffers.addPair2(startPosition, endPosition, normal, fraction);
      }
    }
    let rightBand = false;
    for (const buffers of [rightBuffers, leftBuffers]) {
      rightBand = !rightBand;
      if (!buffers)
        continue;

      const geometry = buffers.getBufferGeometry();
      const material = new THREE.MeshLambertMaterial({
        side: buffers.side,
        emissive: ThreeConverter.toColor(Colors.white),
        emissiveIntensity: 0.05,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.drawMode = THREE.TrianglesDrawMode;
      bands[rightBand ? 0 : 1] = mesh;
    }
    return bands;
  }

  public addAnnotation(canvas: Canvas, fontSize: number, rightBand: boolean): void {
    const inc = 50;
    canvas.beginPath();

    for (const anyTick of this.mdRange.getTicks(inc)) {
      const md = Number(anyTick);
      const fraction = this.mdRange.getFraction(md);
      canvas.addVerticalLine(fraction);
    }
    canvas.drawPath();
    const labelInc = this.mdRange.getBoldInc(inc, 4);
    for (const anyTick of this.mdRange.getTicks(labelInc)) {
      const md = Number(anyTick);
      const fraction = this.mdRange.getFraction(md);
      canvas.drawText(fraction, `${md}`, fontSize, null, rightBand);
    }
  }

  public addFloatLog(canvas: Canvas, log: FloatLog | null, color: Color, fill: boolean): void {
    if (!log)
      return;

    const valueRange = log.range;
    canvas.beginFunction();
    for (let i = 0; i < log.samples.length; i++) {
      const sample = log.getAt(i);
      const mdFraction = this.mdRange.getFraction(sample.md);
      const valueFraction = valueRange.getFraction(sample.value);
      canvas.addFunctionValue(mdFraction, valueFraction);
    }
    canvas.closeFunction();
    if (fill) {
      canvas.fillPathBySemiTransparentGradient(color, 1);
    }
    else {
      canvas.drawPath(null, 3);
      canvas.drawPath(color, 1);
    }
  }

  public addDiscreteLog(canvas: Canvas, log: DiscreteLog | null): void {
    if (!log)
      return;

    let prevColor = Colors.white;
    let prevMdFraction = Number.NaN;

    for (let i = 0; i < log.samples.length; i++) {
      const sample = log.getAt(i);
      const color = Colors.getNextColor(sample.value);
      const mdFraction = this.mdRange.getFraction(sample.md);
      if (i > 0)
        canvas.fillRect(prevMdFraction, mdFraction, prevColor, 0.75);

      prevColor = color;
      prevMdFraction = mdFraction;
    }
  }

  public addPointLog(canvas: Canvas, log: PointLog | null, fontSize: number, rightBand: boolean): void {
    if (!log)
      return;

    for (let i = 0; i < log.samples.length; i++) {
      const sample = log.getAt(i);
      const mdFraction = this.mdRange.getFraction(sample.md);
      canvas.drawText(mdFraction, sample.label, fontSize, null, rightBand);

    }
  }
}

