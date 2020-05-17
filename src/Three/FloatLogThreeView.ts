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
import { Color } from "three";
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

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

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

    const wellTrajectory = wellTrajectoryNode.data;
    if (!wellTrajectory)
      return null;

    const wellLog = node.data;
    if (!wellLog)
      throw Error("Well trajectory is missing");

    const group = new THREE.Group();

    const  directionToCamera = new Vector3(1, 1, 0);
    directionToCamera.normalize();
    const color = Colors.white;

    const buffers = new TriangleStripBuffers(wellLog.count);

    for (const baseSample of wellLog.samples)
    {
      const position = wellTrajectory.getAtMd(baseSample.md);
      const tangent = wellTrajectory.getTangentAtMd(baseSample.md);

      const prependicular = directionToCamera.getCross(tangent);
      const normal = prependicular.getCross(tangent);

      prependicular.multiplyByNumber(100);

      const endPosition = position.copy();
      endPosition.add(prependicular);


      buffers.addPair(position, endPosition, normal, normal);

      const sample = baseSample as FloatLogSample;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.Float32BufferAttribute(buffers.positions, 3, true));
    geometry.addAttribute('normal', new THREE.Float32BufferAttribute(buffers.normals, 3, true));
    geometry.setIndex(new THREE.Uint32BufferAttribute(buffers.triangleIndexes, 1, true));

    const material = new THREE.MeshPhongMaterial({ color: ThreeConverter.toColor(color), side: THREE.DoubleSide, flatShading: false, shininess: 100 });
    //const material = createShader();

    const mesh = new THREE.Mesh(geometry, material);
    //mesh.position.set(grid.xOrigin, grid.yOrigin, 0);
    mesh.drawMode = THREE.TrianglesDrawMode; //THREE.TriangleStripDrawMode (must use groups)

    group.add(mesh);
    return group;
  }
}
