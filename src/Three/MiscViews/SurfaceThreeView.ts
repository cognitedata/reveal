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

import { ColorType } from "@/Core/Enums/ColorType";
import { Range3 } from "@/Core/Geometry/Range3";

import { SurfaceNode } from "@/Nodes/Misc/SurfaceNode";
import { SurfaceRenderStyle } from "@/Nodes/Misc/SurfaceRenderStyle";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { RegularGrid2Buffers } from "@/Core/Geometry/RegularGrid2Buffers";

import { BaseGroupThreeView } from "@/Three/BaseViews/BaseGroupThreeView";
import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { TextureKit } from "@/Three/Utilities/TextureKit";
import { ContouringService } from "@/Core/Geometry/ContouringService";
import { Ma } from '@/Core/Primitives/Ma';

export class SurfaceThreeView extends BaseGroupThreeView
{
  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get node(): SurfaceNode { return super.getNode() as SurfaceNode; }
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

  public /*override*/ calculateBoundingBoxCore(): Range3 | undefined { return this.node.boundingBox; }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3DCore(): THREE.Object3D | null
  {
    const node = this.node;
    const grid = node.surface;
    if (!grid)
      return null;

    const parent = new THREE.Group();
    const solid = this.createSolid();
    if (solid)
      parent.add(solid);

    const contours = this.createContours();
    if (contours)
      parent.add(contours);

    const transformer = this.transformer;

    parent.rotateZ(grid.rotationAngle);
    parent.position.copy(transformer.to3D(grid.origin));
    parent.scale.copy(transformer.scale);
    return parent;
  }


  protected /*override*/ createSolid(): THREE.Object3D | null
  {
    const node = this.node;
    const style = this.style.solid;
    const grid = node.surface;
    if (!grid)
      return null;

    const color = node.getColorByColorType(style.colorType);
    const buffers = new RegularGrid2Buffers(grid, style.colorType == ColorType.DepthColor);
    const geometry = buffers.getBufferGeometry();

    const material = new THREE.MeshPhongMaterial({
      color: ThreeConverter.to3DColor(color),
      side: THREE.DoubleSide,
      shininess: 100 * style.shininess,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 4.0
    });
    //const material = createShader();

    if (style.colorType === ColorType.DepthColor && buffers.hasUvs)
    {
      const texture = TextureKit.create1D(grid.getZRange());
      texture.anisotropy = 4;
      material.map = texture;
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.drawMode = THREE.TrianglesDrawMode; //THREE.TriangleStripDrawMode (must use groups)
    return mesh;
  }

  createContours(): THREE.Object3D | null
  {
    const node = this.node;
    const style = this.style.contours;
    const grid = node.surface;
    if (!grid)
      return null;

    const color = node.getColorByColorType(style.colorType);
    const service = new ContouringService(style.inc);

    const contours = service.createContoursAsXyzArray(grid);
    if (contours.length == 0)
      return null;

    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.Float32BufferAttribute(contours, 3));

    const material = new THREE.LineBasicMaterial({ color: ThreeConverter.to3DColor(color), linewidth: 1 });
    return new THREE.LineSegments(geometry, material);
  }
}


//==================================================
// LOCAL METHODS: Shader experiments
//==================================================

function vertexShader(): string
{
  return `
    varying vec3 vUv; 

    void main() {
      vUv = position; 

      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * modelViewPosition; 
    }
  `;
}

function fragmentShader(): string
{
  return `
      uniform vec3 colorA; 
      uniform vec3 colorB; 
      varying vec3 vUv;

      void main() {
        gl_FragColor = vec4(mix(colorA, colorB, 0.5), 1.0);
      }
  `;
}

function createShader(): THREE.ShaderMaterial
{

  const uniforms = {
    colorB: { type: "vec3", value: new THREE.Color(0xFF00000) },
    colorA: { type: "vec3", value: new THREE.Color(0x00FF000) }
  };


  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vertexShader(),
    //fragmentShader: fragmentShader(),
    fragmentShader: THREE.ShaderLib.phong.fragmentShader,
    lights: true,
  });
  return material;
}