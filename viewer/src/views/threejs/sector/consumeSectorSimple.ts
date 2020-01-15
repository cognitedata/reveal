/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { SectorMetadata, SectorQuads } from '../../../models/sector/types';
import { SectorNode } from './SectorNode';
import { sectorShaders, shaderDefines } from './shaders';
import { toThreeJsBox3 } from '../utilities';

const quadVertexData = new Float32Array([
  // tslint:disable: prettier
  -0.5, -0.5, 0.0,
  0.5, -0.5, 0.0,
  0.5, 0.5, 0.0,

  0.5, 0.5, 0.0,
  -0.5, 0.5, 0.0,
  -0.5, -0.5, 0.0,
  // tslint:enable: prettier
]);
const quadVertexBufferAttribute = new THREE.Float32BufferAttribute(quadVertexData.buffer, 3);

export function consumeSectorSimple(
  sectorId: number,
  sector: SectorQuads,
  metadata: SectorMetadata,
  sectorNode: SectorNode
) {
  const stride = 3 + 1 + 3 + 16;
  if (sector.buffer.byteLength === 0) {
    // No data, just skip
    return;
  }
  if (sector.buffer.byteLength % stride !== 0) {
    throw new Error(`Expected buffer size to be multiple of ${stride}, but got ${sector.buffer.byteLength}`);
  }
  const bounds = toThreeJsBox3(metadata.bounds);
  const boundsRenderer = new THREE.Box3Helper(bounds.expandByScalar(0.1), new THREE.Color(0xff00ff));
  boundsRenderer.name = `Bounding box ${sectorId}`;

  const geometry = new THREE.InstancedBufferGeometry();

  const interleavedBuffer32 = new THREE.InstancedInterleavedBuffer(sector.buffer, 3 + 1 + 3 + 16);
  const color = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 3, 0, true);
  const treeIndex = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 1, 3, false);
  const normal = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 3, 4, true);
  const matrix0 = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 4, 7, false);
  const matrix1 = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 4, 11, false);
  const matrix2 = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 4, 15, false);
  const matrix3 = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 4, 19, false);

  geometry.setAttribute('position', quadVertexBufferAttribute);
  geometry.setAttribute('color', color);
  geometry.setAttribute('treeIndex', treeIndex);
  geometry.setAttribute('normal', normal);
  geometry.setAttribute('matrix0', matrix0);
  geometry.setAttribute('matrix1', matrix1);
  geometry.setAttribute('matrix2', matrix2);
  geometry.setAttribute('matrix3', matrix3);

  const uniforms = {};
  const material = new THREE.ShaderMaterial({
    ...shaderDefines,
    uniforms,
    fragmentShader: sectorShaders.simpleMesh.fragment,
    vertexShader: sectorShaders.simpleMesh.vertex
  });
  const obj = new THREE.Mesh(geometry, material);

  obj.name = `Quads ${sectorId}`;
  // TODO 20191028 dragly figure out why the quads are being culled wrongly and if we
  // can avoid disabling it entirely
  obj.frustumCulled = false;
  sectorNode.add(obj);
}
