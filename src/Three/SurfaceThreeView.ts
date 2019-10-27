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
import * as Color from 'color'

import { BaseGroupThreeView } from "./BaseGroupThreeView";
import { SurfaceNode } from "../Nodes/SurfaceNode";
import { SurfaceRenderStyle } from "../Nodes/SurfaceRenderStyle";
import { NodeEventArgs } from "../Core/Views/NodeEventArgs";
import { RegularGrid2 } from '../Core/Geometry/RegularGrid2';
import { Range1 } from '../Core/Geometry/Range1';

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

    const geometry = new THREE.BufferGeometry();
    addAttributes(geometry, grid);

    const material = new THREE.MeshPhongMaterial({ /*vertexColors: THREE.VertexColors*/ side: THREE.DoubleSide, flatShading: false, shininess: 100 });
    //const material = craeteShader();
    
    const texture = createTexture(grid.getZRange());
    // texture.magFilter = THREE.NearestMipmapLinearFilter;
    // texture.minFilter = THREE.NearestMipmapLinearFilter;

    texture.anisotropy = 4;
    material.map = texture;

    const mesh = new THREE.Mesh(geometry, material);
    mesh.drawMode = THREE.TrianglesDrawMode; //THREE.TriangleStripDrawMode (must use groups)
    return mesh;
  }
}

//==================================================
// LOCAL FUNCTIONS: Helpers
//==================================================

function createTexture(range: Range1): THREE.DataTexture
{
  const darknessVolume = 0.3

  const width = 2000;
  const height = 2
  const data = new Uint8Array(3 * width * height);
  const inc = Math.round(width / 20);

  let index1 = 0;
  let index2 = 3 * width;

  for (let i = 0; i < width; i++)
  {
    let hue = i / (width - 1);
    //hue = (hue + 0.5) % 1;
    let color = Color.hsv(hue * 360, 255, 200);

    if (true)
      color = getGammaCorrected(color);

    if (true)
    {
      // Darkness correction
      const darknessFraction = (i % inc) / inc;
      color = color.darken(darknessVolume * (darknessFraction - 0.5));
    }
    data[index1++] = data[index2++] = color.red();
    data[index1++] = data[index2++] = color.green();
    data[index1++] = data[index2++] = color.blue();
  }
  return new THREE.DataTexture(data, width, height, THREE.RGBFormat);

  function getGammaCorrected(color: Color)
  {
    const gamma = 1 / 2.2;
    let r = color.red();
    let g = color.green();
    let b = color.blue();

    r = color.red() / 255;
    g = color.green() / 255;
    b = color.blue() / 255;

    r = Math.pow(r, gamma);
    g = Math.pow(g, gamma);
    b = Math.pow(b, gamma);

    r = Math.round(255 * r);
    g = Math.round(255 * g);
    b = Math.round(255 * b);

    color = Color.rgb(r, g, b);
    return color;
  }
}

function addAttributes(geometry: THREE.BufferGeometry, grid: RegularGrid2): void
{
  const [uniqueIndexes, numUniqueIndex] = createUniqueIndexes(grid);

  const positions = new Float32Array(3 * numUniqueIndex);
  const normals = new Float32Array(3 * numUniqueIndex);
  const uvs = new Float32Array(2 * numUniqueIndex);
  const zRange = grid.getZRange();

  // Generate the position, normal and uvs
  for (let j = grid.nodeSize.j - 1; j >= 0; j--)
  {
    for (let i = grid.nodeSize.i - 1; i >= 0; i--)
    {
      const nodeIndex = grid.getNodeIndex(i, j);
      const uniqueIndex = uniqueIndexes[nodeIndex];
      if (uniqueIndex < 0)
        continue;

      let index = 3 * uniqueIndex;

      const point = grid.getPoint3(i, j);
      positions[index + 0] = point.x
      positions[index + 1] = point.y
      positions[index + 2] = point.z

      const normal = grid.getNormal(i, j);
      normals[index + 0] = normal.x;
      normals[index + 1] = normal.y;
      normals[index + 2] = normal.z;

      const fraction = zRange.getFraction(point.z);

      index = 2 * uniqueIndex;
      uvs[index + 0] = fraction;
      uvs[index + 1] = 0;
    }
  }
  // Generate the triangle indices
  // Should be strip, but could not get it to work
  const indices: number[] = [];
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

      if (unique0 < 0)
      {
        indices.push(unique1);
        indices.push(unique2);
        indices.push(unique3);
      }
      if (n === 4 || unique1 < 0)
      {
        indices.push(unique0);
        indices.push(unique2);
        indices.push(unique3);
      }
      if (unique2 < 0)
      {
        indices.push(unique0);
        indices.push(unique1);
        indices.push(unique3);
      }
      if (n === 4 || unique3 < 0)
      {
        indices.push(unique0);
        indices.push(unique1);
        indices.push(unique2);
      }
    }
    //groups.push(indices.length);
  }
  geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.addAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.addAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(new THREE.Uint32BufferAttribute(indices, 1));

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
}


// function addGroup(geometry: THREE.BufferGeometry, indices: number[], prevCount: number): number
// {
//   const count = indices.length - 1;
//   const groupCount = count - prevCount;
//   if (groupCount > 0)
//   {
//     //geometry.addGroup(prevCount, groupCount);
//     console.log(groupCount);
//   }
//   return count;
// }

function createUniqueIndexes(grid: RegularGrid2): [number[], number]
{
  const uniqueIndexes = new Array<number>(grid.nodeSize.size);
  let numUniqueIndex = 0;
  for (let j = grid.nodeSize.j - 1; j >= 0; j--)
  {
    for (let i = grid.nodeSize.i - 1; i >= 0; i--)
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


//==================================================
// LOCAL FUNCTIONS: Shader experiments
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
  `
}

function createShader(): THREE.ShaderMaterial
{

  const uniforms = {
    colorB: { type: 'vec3', value: new THREE.Color(0xFF00000) },
    colorA: { type: 'vec3', value: new THREE.Color(0x00FF000) }
  }


  let material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader(),
    //fragmentShader: fragmentShader(),
    fragmentShader: THREE.ShaderLib.phong.fragmentShader,
    lights: true,
  })
  return material;
}