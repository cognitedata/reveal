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
import { RegularGrid2 } from '../Core/Geometry/RegularGrid2';

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

  protected /*override*/ createObject3D(): THREE.Object3D | null
  {
    const node = this.node;
    const style = this.style;
    const grid = node.data;
    if (grid == null)
      return null;

    const group = new Group();
    {
      const color = 0xFFFFFF;
      const intensity = 0;
      const light = new THREE.AmbientLight(color, intensity);
      light.position.set(0, 0, 0);
      group.add(light);
    }
    {

      const skyColor = 0xB1E1FF;  // light blue
      const groundColor = 0xB97A20;  // brownish orange
      const intensity = 0;
      const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
      group.add(light);
    }
    {
      const color = 0xFFFFFF;
      const intensity = 1;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(0, 0, 1000);
      light.target.position.set(0.5, -0.5, -1);
      group.add(light);
    }
    {
      const geometry = new THREE.BufferGeometry();
      addAttributes(geometry, grid);

      //const material = new THREE.MeshStandardMaterial({ vertexColors: THREE.VertexColors, side: THREE.DoubleSide, roughness:0.8, metalness:0.75, flatShading: false });
      const material = new THREE.MeshPhongMaterial({ vertexColors: THREE.VertexColors, side: THREE.DoubleSide, flatShading: false, shininess: 30 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.drawMode = THREE.TrianglesDrawMode;//THREE.TriangleStripDrawMode;
      group.add(mesh);
    }
    return group;
  }
}



function addAttributes(geometry: THREE.BufferGeometry, grid: RegularGrid2): void
{
  const [uniqueIndexes, numUniqueIndex] = createUniqueIndexes(grid);
  const positions = new Float32Array(numUniqueIndex * 3);
  const normals = new Float32Array(numUniqueIndex * 3);
  const colors: number[] = new Array(numUniqueIndex * 3);
  const indices: number[] = [];
  // const groups: number[] = [];

  const color = new Color()


  const currentRange = grid.getZRange();
  for (let j = 0; j < grid.nodeSize.j; j++)
  {
    for (let i = 0; i < grid.nodeSize.i; i++)
    {
      const nodeIndex = grid.getNodeIndex(i, j);
      const uniqueIndex = uniqueIndexes[nodeIndex];
      if (uniqueIndex < 0)
        continue;

      const point = grid.getPoint3(i, j);
      const index = 3 * uniqueIndex;
      positions[index + 0] = point.x
      positions[index + 1] = point.y
      positions[index + 2] = point.z

      const normal = grid.getNormal(i, j);
      normals[index + 0] = normal.x;
      normals[index + 1] = normal.y;
      normals[index + 2] = normal.z;

      let fraction = (point.z - currentRange.min) / currentRange.delta;

      color.setHSL((fraction + 0.5) % 1, 1, 0.5);
      colors[index + 0] = color.r;
      colors[index + 1] = color.g;
      colors[index + 2] = color.b;
    }
  }
  for (let i = 0; i < grid.nodeSize.i - 1; i++)
  {
    for (let j = 0; j < grid.nodeSize.j - 1; j++)
    {
      const nodeIndex0 = grid.getNodeIndex(i, j);
      const nodeIndex1 = grid.getNodeIndex(i + 1, j);
      const nodeIndex2 = grid.getNodeIndex(i + 1, j + 1);
      const nodeIndex3 = grid.getNodeIndex(i, j + 1);

      const unique0 = uniqueIndexes[nodeIndex0];
      const unique1 = uniqueIndexes[nodeIndex1];
      const unique2 = uniqueIndexes[nodeIndex2];
      const unique3 = uniqueIndexes[nodeIndex3];

      //(i,j+1)     (i+1,j+1)
      //     3------2
      //     |      |
      //     0------1
      //(i,j)       (i+1,j)

      let n = 0;
      if (unique0 >= 0) n++;
      if (unique1 >= 0) n++;
      if (unique2 >= 0) n++;
      if (unique3 >= 0) n++;
      if (n < 3)
        continue;

      if (n === 4)
      {
        indices.push(unique0);
        indices.push(unique1);
        indices.push(unique2);

        indices.push(unique0);
        indices.push(unique2);
        indices.push(unique3);
      }
      else if (unique0 < 0)
      {
        indices.push(unique1);
        indices.push(unique2);
        indices.push(unique3);
      }
      else if (unique1 < 0)
      {
        indices.push(unique0);
        indices.push(unique2);
        indices.push(unique3);
      }
      else if (unique2 < 0)
      {
        indices.push(unique0);
        indices.push(unique1);
        indices.push(unique3);
      }
      else if (unique3 < 0)
      {
        indices.push(unique0);
        indices.push(unique1);
        indices.push(unique2);
      }
    }
    //groups.push(indices.length);
  }
  // let prevCount = 0;
  // for (const count of groups) 
  // {
  //   const groupCount = count - prevCount;
  //   if (groupCount > 0)
  //   {      
  //     geometry.addGroup(prevCount, groupCount);
  //   }
  //   prevCount = count;
  // }

  geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.addAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  //  geometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 3));
  geometry.setIndex(new THREE.Uint32BufferAttribute(indices, 1));
}


function addGroup(geometry: THREE.BufferGeometry, indices: number[], prevCount: number): number
{
  const count = indices.length - 1;
  const groupCount = count - prevCount;
  if (groupCount > 0)
  {
    //geometry.addGroup(prevCount, groupCount);
    console.log(groupCount);
  }
  return count;
}

function createUniqueIndexes(grid: RegularGrid2): [number[], number]
{
  const uniqueIndexes = new Array<number>(grid.nodeSize.size);
  let numUniqueIndex = 0;
  for (let j = 0; j < grid.nodeSize.j; j++)
  {
    for (let i = 0; i < grid.nodeSize.j; i++)
    {
      const nodeIndex = grid.getNodeIndex(i, j);
      if (grid.isNodeDef(i, j))
      {
        uniqueIndexes[nodeIndex] = numUniqueIndex;
        numUniqueIndex++;
      }
      else
        uniqueIndexes[nodeIndex] = -1;
    }
  }
  return [uniqueIndexes, numUniqueIndex];
}
