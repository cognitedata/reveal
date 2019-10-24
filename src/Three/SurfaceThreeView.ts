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

import { BaseGroupThreeView } from "./BaseGroupThreeView";
import { PolylinesNode } from "../Core/Geometry/PolylinesNode";
import { PolylinesRenderStyle } from "../Core/Geometry/PolylinesRenderStyle";
import { ThreeConverter } from "./ThreeConverter";
import { ColorType } from "../Core/Enums/ColorType";
import { Colors } from "../Core/PrimitivClasses/Colors";
import { NodeEventArgs } from "../Core/Views/NodeEventArgs";
import * as THREE from 'three';
import { Color } from "three";

export class SurfaceThreeView extends BaseGroupThreeView
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // PROPERTIES
  //==================================================

  protected get node(): PolylinesNode { return super.getNode() as PolylinesNode; }
  protected get style(): PolylinesRenderStyle { return super.getStyle() as PolylinesRenderStyle; }

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

  protected /*override*/ createGroup(): THREE.Object3D
  {
    const node = this.node;
    const style = this.style;

    // const geometry = new THREE.Geometry();

    // // Make the simplest shape possible: a triangle.
    // geometry.vertices.push(
    //   new THREE.Vector3(-10, 10, 0),
    //   new THREE.Vector3(-10, -10, 0),
    //   new THREE.Vector3(10, -10, 0)
    // );

    // // Note that I'm assigning the face to a variable
    // // I'm not just shoving it into the geometry.
    // const face = new THREE.Face3(0, 1, 2);

    // // Assign the colors to the vertices of the face.
    // face.vertexColors[0] = new THREE.Color(0xff0000); // red
    // face.vertexColors[1] = new THREE.Color(0x00ff00); // green
    // face.vertexColors[2] = new THREE.Color(0x0000ff); // blue

    // // Now the face gets added to the geometry.
    // geometry.faces.push(face);

    // // Using this material is important.
    // const material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });








    // return new THREE.Mesh(geometry, material);


















    // NOT A GOOD EXAMPLE OF HOW TO MAKE A CUBE!
    // Only trying to make it clear most vertices are unique
    const vertices = [
      // front
      { pos: [-1, -1, 1], norm: [0, 0, 1], uv: [0, 1], },
      { pos: [1, -1, 1], norm: [0, 0, 1], uv: [1, 1], },
      { pos: [-1, 1, 1], norm: [0, 0, 1], uv: [0, 0], },

      { pos: [-1, 1, 1], norm: [0, 0, 1], uv: [0, 0], },
      { pos: [1, -1, 1], norm: [0, 0, 1], uv: [1, 1], },
      { pos: [1, 1, 1], norm: [0, 0, 1], uv: [1, 0], },
      // right
      { pos: [1, -1, 1], norm: [1, 0, 0], uv: [0, 1], },
      { pos: [1, -1, -1], norm: [1, 0, 0], uv: [1, 1], },
      { pos: [1, 1, 1], norm: [1, 0, 0], uv: [0, 0], },

      { pos: [1, 1, 1], norm: [1, 0, 0], uv: [0, 0], },
      { pos: [1, -1, -1], norm: [1, 0, 0], uv: [1, 1], },
      { pos: [1, 1, -1], norm: [1, 0, 0], uv: [1, 0], },
      // back
      { pos: [1, -1, -1], norm: [0, 0, -1], uv: [0, 1], },
      { pos: [-1, -1, -1], norm: [0, 0, -1], uv: [1, 1], },
      { pos: [1, 1, -1], norm: [0, 0, -1], uv: [0, 0], },

      { pos: [1, 1, -1], norm: [0, 0, -1], uv: [0, 0], },
      { pos: [-1, -1, -1], norm: [0, 0, -1], uv: [1, 1], },
      { pos: [-1, 1, -1], norm: [0, 0, -1], uv: [1, 0], },
      // left
      { pos: [-1, -1, -1], norm: [-1, 0, 0], uv: [0, 1], },
      { pos: [-1, -1, 1], norm: [-1, 0, 0], uv: [1, 1], },
      { pos: [-1, 1, -1], norm: [-1, 0, 0], uv: [0, 0], },

      { pos: [-1, 1, -1], norm: [-1, 0, 0], uv: [0, 0], },
      { pos: [-1, -1, 1], norm: [-1, 0, 0], uv: [1, 1], },
      { pos: [-1, 1, 1], norm: [-1, 0, 0], uv: [1, 0], },
      // top
      { pos: [1, 1, -1], norm: [0, 1, 0], uv: [0, 1], },
      { pos: [-1, 1, -1], norm: [0, 1, 0], uv: [1, 1], },
      { pos: [1, 1, 1], norm: [0, 1, 0], uv: [0, 0], },

      { pos: [1, 1, 1], norm: [0, 1, 0], uv: [0, 0], },
      { pos: [-1, 1, -1], norm: [0, 1, 0], uv: [1, 1], },
      { pos: [-1, 1, 1], norm: [0, 1, 0], uv: [1, 0], },
      // bottom
      { pos: [1, -1, 1], norm: [0, -1, 0], uv: [0, 1], },
      { pos: [-1, -1, 1], norm: [0, -1, 0], uv: [1, 1], },
      { pos: [1, -1, -1], norm: [0, -1, 0], uv: [0, 0], },

      { pos: [1, -1, -1], norm: [0, -1, 0], uv: [0, 0], },
      { pos: [-1, -1, 1], norm: [0, -1, 0], uv: [1, 1], },
      { pos: [-1, -1, -1], norm: [0, -1, 0], uv: [1, 0], },
    ];
    const positions = [];
    const normals = [];
    const uvs = [];
    for (const vertex of vertices)
    {
      positions.push(...vertex.pos);
      normals.push(...vertex.norm);
      uvs.push(...vertex.uv);
    }

    const geometry = new THREE.BufferGeometry();
    const positionNumComponents = 3;
    const normalNumComponents = 3;
    const uvNumComponents = 2;
    geometry.addAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
    geometry.addAttribute(
      'normal',
      new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
    geometry.addAttribute(
      'uv',
      new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));

    const material = new THREE.MeshPhongMaterial({ color: new THREE.Color(0xff0000)});

    const cube = new THREE.Mesh(geometry, material);

    return cube;
  }

}


  // function(numWedges, apex)
  // {
  //   /* creates and returns an HLS pyramid with the lightness axis
  //    * coinciding with the Z axis. The 'apex' parameter is either 0 or 1,
  //    * depending on which one you want, and the ``bottom'' of the pyramid
  //    * is at z=lightness=0.5. The numWedges tells you how many vertices
  //    * are around the bottom of the pyramid. */

  //   if (numWedges < 3)
  //   {
  //     throw "number of wedges for a pyramid must be at least 3";
  //   }

  //   var geom = new THREE.Geometry();
  //   geom.colors = [];
  //   // First vertex is the apex
  //   geom.vertices.push(new THREE.Vector3(0, 0, apex));
  //   geom.vertexColors.push(apex == 0 ?
  //     new THREE.Color(0, 0, 0) : // black
  //     new THREE.Color(1, 1, 1)   // white
  //   );

  //   // Second vertex is the 50% gray point at the center of the base,
  //   // at (0,0) in the z=0.5 plane.
  //   geom.vertexColors.push(new THREE.Color(0.5, 0.5, 0.5));
  //   geom.vertices.push(new THREE.Vector3(0, 0, 0.5));

  //   // Build the base vertices first. w is the index of a vertex around
  //   // the perimeter of the pyramid's base
  //   var w;
  //   // Now, loop around the base, creating vertices and their colors.
  //   for (w = 0; w < numWedges; ++w)
  //   {
  //     var hue = w / numWedges;
  //     var color = new THREE.Color();
  //     color.setHSL(hue, 1, 0.5);
  //     var radians = hue * 2 * Math.PI;
  //     var cos = Math.cos(radians);
  //     var sin = Math.sin(radians);
  //     geom.vertices.push(new THREE.Vector3(cos, sin, 0.5));
  //     geom.vertexColors.push(color);
  //   }
  //   // Next loop creates all but the last two faces. Loop from w=3
  //   // .. numWedges+1 and use w-1 as the previous vertex.
  //   var last = numWedges + 1;
  //   for (w = 3; w <= last; ++w)
  //   {
  //     // Notice that, to get the CCW direction, we have to switch the order of
  //     // w and w-1 in these two faces.

  //     // the face up to the apex, vertex index 0
  //     geom.faces.push(new THREE.Face3(0, w, w - 1));
  //     // the face in to the center, vertex index 1
  //     geom.faces.push(new THREE.Face3(1, w - 1, w));
  //   }
  //   // Finally, do the last wedge as a special case
  //   geom.faces.push(new THREE.Face3(0, 2, last));
  //   geom.faces.push(new THREE.Face3(1, last, 2));
  //   // Finish up the geometry object
  //   TW.computeFaceColors(geom);
  //   var material = new THREE.MeshBasicMaterial(
  //     {
  //       vertexColors: THREE.VertexColors,
  //       side: THREE.DoubleSide, // in case we go inside the pyramid
  //     });
  //   var mesh = new THREE.Mesh(geom, material);
  //   return mesh;
  // }

