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
import { Colors } from "@/Core/Primitives/Colors";

import { SurfaceNode } from "@/Nodes/Misc/SurfaceNode";
import { SurfaceRenderStyle } from "@/Nodes/Misc/SurfaceRenderStyle";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { RegularGrid2Buffers } from "@/Core/Geometry/RegularGrid2Buffers";

import { BaseGroupThreeView } from "@/Three/BaseViews/BaseGroupThreeView";
import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { TextureKit } from "@/Three/Utilities/TextureKit";
import { ContouringService } from "@/Core/Geometry/ContouringService";

export class SurfaceThreeView extends BaseGroupThreeView {
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get node(): SurfaceNode { return super.getNode() as SurfaceNode; }
  protected get style(): SurfaceRenderStyle { return super.getStyle() as SurfaceRenderStyle; }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  protected /*override*/ updateCore(args: NodeEventArgs): void {
    super.updateCore(args);
  }

  public calculateBoundingBoxCore(): Range3 | undefined {
    return this.node.boundingBox;
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3DCore(): THREE.Object3D | null {

    const node = this.node;
    const grid = node.data;
    if (!grid)
      return null;

    const group = new THREE.Group();
    var solid = this.createSolid();
    if (solid)
      group.add(solid);

    var contours = this.createContours();
    if (contours)
      group.add(contours);

    group.position.set(grid.xOrigin, grid.yOrigin, 0);
    return group;
  }


  protected /*override*/ createSolid(): THREE.Object3D | null {

    const node = this.node;
    const style = this.style;
    const grid = node.data;
    if (!grid)
      return null;

    let color = node.color;
    if (style.colorType !== ColorType.NodeColor)
      color = Colors.white; // Must be white because the colors are multiplicative

    const buffers = new RegularGrid2Buffers(grid);
    const geometry = buffers.getBufferGeometry();
    const material = new THREE.MeshPhongMaterial({ 
      color: ThreeConverter.toColor(color), 
      side: THREE.DoubleSide, 
      shininess: 100,
      polygonOffset: true,
      polygonOffsetFactor: 0,
      polygonOffsetUnits: 3.0    
    });
    //const material = createShader();

    if (style.colorType === ColorType.DepthColor && buffers.hasUvs) {
      const texture = TextureKit.create1D(grid.getZRange());
      texture.anisotropy = 4;
      material.map = texture;
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.drawMode = THREE.TrianglesDrawMode; //THREE.TriangleStripDrawMode (must use groups)
    return mesh;
  }

  createContours(): THREE.Object3D | null {
    const node = this.node;
    const style = this.style;
    const grid = node.data;
    if (!grid)
      return null;

    const service = new ContouringService(style.inc);

   const contours = service.createContoursAsXyzArray(grid);
    if (contours.length == 0)
       return null;

    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new  THREE.Float32BufferAttribute(contours, 3));

    const color = Colors.black;
    const material = new THREE.LineBasicMaterial({ color: ThreeConverter.toColor(color), linewidth: 1 });
    return new THREE.LineSegments(geometry, material);
  }
}


//==================================================
// LOCAL FUNCTIONS: Shader experiments
//==================================================

function vertexShader(): string {
  return `
    varying vec3 vUv; 

    void main() {
      vUv = position; 

      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * modelViewPosition; 
    }
  `;
}

function fragmentShader(): string {
  return `
      uniform vec3 colorA; 
      uniform vec3 colorB; 
      varying vec3 vUv;

      void main() {
        gl_FragColor = vec4(mix(colorA, colorB, 0.5), 1.0);
      }
  `;
}

function createShader(): THREE.ShaderMaterial {

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