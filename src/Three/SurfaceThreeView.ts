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
import { BaseGroupThreeView } from "./BaseGroupThreeView";
import { SurfaceNode } from "../Nodes/SurfaceNode";
import { SurfaceRenderStyle } from "../Nodes/SurfaceRenderStyle";
import { NodeEventArgs } from "../Core/Views/NodeEventArgs";
import { Color, Group } from 'three';

export class SurfaceThreeView extends BaseGroupThreeView
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // PROPERTIES
  //==================================================

  protected get node(): SurfaceNode { return super.getNode() as SurfaceNode; }
  protected get style(): SurfaceRenderStyle { return super.getStyle() as SurfaceRenderStyle; }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    super.updateCore(args);
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3D(): THREE.Object3D
  {
    const node = this.node;
    const style = this.style;

    const vertices = [
      { pos: [0, 0, 0], norm: [0, 0, 1] },
      { pos: [1, 0, 0], norm: [0, 0, 1] },
      { pos: [0, 1, 0], norm: [0, 0, 1] },
      { pos: [1, 1, 0], norm: [0, 0, 1] },
      { pos: [0, 2, 0], norm: [0, 0, 1] },
      { pos: [1, 2, 0], norm: [0, 0, 1] },
    ];
    const positions = [];
    const normals = [];
    const colors = [];
    for (const vertex of vertices)
    {
      positions.push(...vertex.pos);
      normals.push(...vertex.norm);
    }

    var indices = new Uint16Array([0, 1, 2, 3, 4, 5]);
    for (let i = 0; i < indices.length; i++)
    {
      if (i == 0)
      {
        colors.push(0);
        colors.push(0);
        colors.push(0);
      }
      else if (i == indices.length - 1)
      {
        colors.push(1);
        colors.push(1);
        colors.push(1);
      }
      else
      {
        var c = new THREE.Color();
        c.setHSL(i / 6, 1, 0.5);
        colors.push(c.r);
        colors.push(c.g);
        colors.push(c.b);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
    geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
    geometry.addGroup(0, 6);
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    const material = new THREE.MeshPhongMaterial({ vertexColors: THREE.VertexColors, side: THREE.DoubleSide, flatShading: false, shininess: 60 });
    const group = new Group();
    {
      const color = 0xFFFFFF;
      const intensity = 0.5;
      const light = new THREE.AmbientLight(color, intensity);
      light.position.set(0, 0, 0);
      group.add(light);
    }
    {
      const color = 0xFFFFFF;
      const intensity = 0.5;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(0, 0, 100);
      group.add(light);
    }
    {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.drawMode = THREE.TriangleStripDrawMode;
      group.add(mesh);
    }
    return group;
  }

}
