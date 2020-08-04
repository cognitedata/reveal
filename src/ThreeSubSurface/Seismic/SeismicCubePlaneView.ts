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

import { SurfaceRenderStyle } from "@/SubSurface/Basics/SurfaceRenderStyle";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";

import { BaseGroupThreeView } from "@/Three/BaseViews/BaseGroupThreeView";
import { SeismicPlaneNode } from '@/SubSurface/Seismic/Nodes/SeismicPlaneNode';
import { SeismicCubeNode } from '@/SubSurface/Seismic/Nodes/SeismicCubeNode';
import { ThreeConverter } from '@/Three/Utilities/ThreeConverter';
import { RegularGrid3Buffers } from '@/Core/Geometry/RegularGrid3Buffers';
import { TextureKit } from '@/Three/Utilities/TextureKit';
import { Colors } from '@/Core/Primitives/Colors';
import { SeismicCube } from '@/SubSurface/Seismic/Data/SeismicCube';
import { Range1 } from '@/Core/Geometry/Range1';
import { Range3 } from '@/Core/Geometry/Range3';
import { Vector3 } from '@/Core/Geometry/Vector3';

export class SeismicCubePlaneView extends BaseGroupThreeView
{
  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get node(): SeismicPlaneNode { return super.getNode() as SeismicPlaneNode; }
  protected get style(): SurfaceRenderStyle { return super.getStyle() as SurfaceRenderStyle; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    super.updateCore(args);
  }

  //==================================================
  // OVERRIDES of Base3DView
  //==================================================

  public /*override*/ calculateBoundingBoxCore(): Range3 | undefined
  {
    const node = this.node;
    var cube = node.surveyCube;
    if (!cube)
      return undefined;

    return cube.boundingBox;
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3DCore(): THREE.Object3D | null
  {
    const node = this.node;
    const parent = new THREE.Group();

    const seismicCubeNode = this.getSeismicCubeNode();
    if (!seismicCubeNode)
      return parent;

    const seismicCube = seismicCubeNode.seismicCube;
    if (!seismicCube)
      return parent;

    var style = seismicCubeNode.getRenderStyle(this.targetId) as SurfaceRenderStyle;
    if (!style)
      return parent;

    const solid = this.createSolid(node, seismicCube, style);
    if (solid)
      parent.add(solid);

    return parent;
  }



  protected /*override*/ createSolid(node: SeismicPlaneNode, seismicCube: SeismicCube, style: SurfaceRenderStyle): THREE.Object3D | null
  {
    let index = node.perpendicularIndex;
    const axis = node.perpendicularAxis;

    //index = 0;

    const buffers = new RegularGrid3Buffers(seismicCube, axis);

    var range = new Range1(0, 1);

    let count = axis == 1 ? seismicCube.cellSize.i : seismicCube.cellSize.j
    for (let i = 0; i < count; i++)
    {
      var trace = seismicCube.getTrace(axis == 1 ? i : index, axis == 0 ? i : index);
      if (trace == null)
        continue;

      for (let k = 0; k < trace.length; k++)
      {
        const uniqueIndex = i * seismicCube.cellSize.k + k;
        buffers.setUAt(uniqueIndex, range.getTruncatedFraction(trace.values[k]));
      }
    }
    const geometry = buffers.getBufferGeometry();

    const material = new THREE.MeshPhongMaterial({
      color: ThreeConverter.to3DColor(Colors.white),
      side: THREE.DoubleSide,
      shininess: 100 * style.solid.shininess,
      //polygonOffset: true,
      //polygonOffsetFactor: 1,
      //polygonOffsetUnits: 4.0
    });
    {
      const texture = TextureKit.create1D(range);
      texture.anisotropy = 1;
      material.map = texture;
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.drawMode = THREE.TrianglesDrawMode; //THREE.TriangleStripDrawMode (must use groups)

    const transformer = this.transformer;

    let origin: Vector3 = Vector3.newZero;
    if (axis == 0)
      seismicCube.getCellCenter(index, 0, 0, origin);
    else
      seismicCube.getCellCenter(0, index, 0, origin);

    mesh.rotateZ(seismicCube.rotationAngle);
    mesh.position.copy(transformer.to3D(origin));
    mesh.scale.copy(transformer.scale);

    return mesh;
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  private getSeismicCubeNode(): SeismicCubeNode | null
  {
    const node = this.node;
    const survey = node.surveyNode;
    if (!survey)
      return null;

    for (const seismicCubeNode of survey.getDescendantsByType(SeismicCubeNode))
    {
      const view = seismicCubeNode.getViewByTarget(this.renderTarget);
      if (view)
        return seismicCubeNode;
    }
    return null;
  }
}
