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
import { Index2 } from '@/Core/Geometry/Index2';
import { Changes } from '@/Core/Views/Changes';
import { RegularGrid3 } from '@/Core/Geometry/RegularGrid3';
import { Index3 } from '@/Core/Geometry/Index3';
import { ViewInfo } from '@/Core/Views/ViewInfo';
import { ColorMap } from "@/Core/Primitives/ColorMap";

const SolidName = "Solid";

export class SeismicCubePlaneView extends BaseGroupThreeView
{
  //==================================================
  // INSTANCE MEMBERS
  //==================================================

  private _index = -1;

  private _axis = -1;

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
    if (args.isChanged(Changes.geometry))
    {
      this.touchBoundingBox();
      this.invalidateTarget();
    }
    if (args.isChanged(Changes.filter))
    {
      this._index = -1;
      this._axis = -1;
      this.invalidateTarget();
    }
  }

  //==================================================
  // OVERRIDES of Base3DView
  //==================================================

  public /*override*/ calculateBoundingBoxCore(): Range3 | undefined
  {
    const { node } = this;
    const { surveyCube } = node;
    if (!surveyCube)
      return undefined;

    const range = new Range3();
    const position: Vector3 = Vector3.newZero;
    {
      const minCell = node.getMinCell();
      surveyCube.getCellCenter(minCell.i, minCell.j, minCell.k, position);
      range.add(position);
    }
    {
      const maxCell = node.getMaxCell();
      surveyCube.getCellCenter(maxCell.i, maxCell.j, maxCell.k, position);
      range.add(position);
    }
    range.expandByMargin(surveyCube.inc.maxCoord);
    return range;
  }

  public /*override*/ beforeRender(): void
  {
    super.beforeRender();
    const parent = this.object3D;
    if (!parent)
      return;

    const { node } = this;
    if (node.perpendicularIndex !== this._index || node.perpendicularAxis !== this._axis)
    {
      this._index = node.perpendicularIndex;
      this._axis = node.perpendicularAxis;
      this.updateTextureCoords(parent, node, node.surveyCube, this.getSeismicCube());
    }
  }

  public /*override*/ onShowInfo(viewInfo: ViewInfo, intersection: THREE.Intersection): void
  {
    const { node } = this;
    viewInfo.addPickedNode(node);

    const { transformer } = this;
    const position = transformer.toWorld(intersection.point);
    viewInfo.addValue("Position", position.getString(2));

    const { surveyNode } = node;
    if (!surveyNode)
      return;

    const { surveyCube } = surveyNode;
    if (!surveyCube)
      return;

    const cell = Index3.newZero;
    surveyCube.getCellFromPosition(position, cell);
    if (!surveyCube.isCellInside(cell.i, cell.j, cell.k))
      return;

    viewInfo.addValue("Cell", cell.toString());
    const seismicCubeNode = this.getSeismicCubeNode();
    if (!seismicCubeNode)
      return;

    viewInfo.addValue("Seismic cube", seismicCubeNode.displayName);
    const { seismicCube } = seismicCubeNode;
    if (!seismicCube)
      return;

    const trace = seismicCube.getTrace(cell.i, cell.j);
    if (!trace)
      return;

    const value = trace.getAt(cell.k);
    viewInfo.addNumber("Amplitude", value, 4);
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3DCore(): THREE.Object3D | null
  {
    const { node } = this;
    const parent = new THREE.Group();

    const { surveyNode } = node;
    if (!surveyNode)
      return parent;

    const { surveyCube } = surveyNode;
    if (!surveyCube)
      return parent;

    const style = surveyNode.getRenderStyle(this.targetId) as SurfaceRenderStyle;
    if (!style)
      return parent;

    const solid = this.createSolid(node, surveyCube, style);
    if (solid)
      parent.add(solid);

    return parent;
  }

  //==================================================
  // INSTANCE METHODS: 
  //==================================================

  private createSolid(node: SeismicPlaneNode, surveyCube: RegularGrid3, style: SurfaceRenderStyle): THREE.Object3D | null
  {
    const cells = node.createCells(false);
    if (cells.length < 2)
      return null;

    const { unrotatedNormal } = node;
    if (node.perpendicularAxis === 0)
      unrotatedNormal.negate();

    const buffers = new RegularGrid3Buffers(surveyCube, unrotatedNormal, cells);
    const geometry = buffers.getBufferGeometry();

    const material = new THREE.MeshStandardMaterial({
      color: ThreeConverter.toThreeColor(Colors.white),
      side: THREE.DoubleSide,
      //shininess: 100 * style.solid.shininess,
      //polygonOffset: true,
      //polygonOffsetFactor: 1,
      //polygonOffsetUnits: 4.0
    });
    {
      const range = new Range1(-1, 1);
      const texture = TextureKit.create1D(ColorMap.createDefaultSeismic());
      texture.anisotropy = 1;
      material.map = texture;
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = SolidName;
    const { transformer } = this;
    mesh.scale.copy(transformer.scale);
    mesh.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), surveyCube.rotationAngle);
    this._index = -1;
    this._axis = -1;
    return mesh;
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  private updateTextureCoords(parent: THREE.Object3D, node: SeismicPlaneNode, surveyCube: RegularGrid3 | null, seismicCube: SeismicCube | null): void
  {
    if (!surveyCube)
      return;

    const mesh = parent.getObjectByName(SolidName) as THREE.Mesh;
    if (!mesh)
      return;

    const geometry = mesh.geometry as THREE.BufferGeometry;
    if (!geometry)
      return;

    const cells = node.createCells();
    if (cells.length < 2)
      return;

    const origin: Vector3 = Vector3.newZero;
    const cell = cells[0];
    surveyCube.getNodePosition(cell.i, cell.j, 0, origin);

    const { transformer } = this;
    mesh.position.copy(transformer.to3D(origin));

    const attribute = geometry.getAttribute("uv");
    if (!attribute)
      return;

    const uv = attribute.array as Float32Array;
    if (!uv)
      return;

    SeismicCubePlaneView.updateTextureCoords(uv, cells, seismicCube);
    attribute.needsUpdate = true;
  }

  private getSeismicCubeNode(): SeismicCubeNode | null
  {
    const { node } = this;
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

  private getSeismicCube(): SeismicCube | null
  {
    const seismicCubeNode = this.getSeismicCubeNode();
    return seismicCubeNode ? seismicCubeNode.seismicCube : null;
  }

  //==================================================
  // STATIC METHODS
  //==================================================

  private static updateTextureCoords(uv: Float32Array, cells: Index2[], seismicCube: SeismicCube | null): void
  {
    if (!seismicCube)
    {
      for (let i = uv.length - 1; i >= 0; i--)
        uv[i] = 0;
      return;
    }
    const count = cells.length * seismicCube.cellSize.k * 2;
    const range = new Range1(-1, 1);
    let index = 0;
    for (const cell of cells)
    {
      const trace = seismicCube.getTrace(cell.i, cell.j);
      if (trace == null)
        continue;

      for (let k = 0; k < trace.length; k++)
      {
        const u = range.getTruncatedFraction(trace.values[k]);
        uv[index++] = u;
        uv[index++] = 0;
      }
    }
    if (count !== index)
      throw Error("Error in createTextureCoords");
  }
}
