/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { SectorMetadata, SectorQuads } from '../../../models/sector/types';
import { SectorNode } from './SectorNode';
import { sectorShaders } from './shaders';
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
  if (sector.buffer.byteLength === 0) {
    // No data, just skip
    return;
  }
  const group = new THREE.Group();
  group.name = `Quads for sector ${sectorId}`;

  const bounds = toThreeJsBox3(metadata.bounds);
  const boundsRenderer = new THREE.Box3Helper(bounds.expandByScalar(0.1), new THREE.Color(0xff00ff));
  boundsRenderer.name = `Bounding box ${sectorId}`;
  group.add(boundsRenderer);

  const geometry = new THREE.InstancedBufferGeometry();

  const interleavedBuffer32 = new THREE.InstancedInterleavedBuffer(sector.buffer, 3 + 3 + 16);
  const color = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 3, 0, true);
  const normal = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 3, 3, true);
  const matrix0 = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 4, 6, false);
  const matrix1 = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 4, 10, false);
  const matrix2 = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 4, 14, false);
  const matrix3 = new THREE.InterleavedBufferAttribute(interleavedBuffer32, 4, 18, false);

  geometry.setAttribute('position', quadVertexBufferAttribute);
  geometry.setAttribute('color', color);
  geometry.setAttribute('normal', normal);
  geometry.setAttribute('matrix0', matrix0);
  geometry.setAttribute('matrix1', matrix1);
  geometry.setAttribute('matrix2', matrix2);
  geometry.setAttribute('matrix3', matrix3);

  const uniforms = {};
  const material = new THREE.ShaderMaterial({
    uniforms,
    fragmentShader: sectorShaders.simpleMesh.fragment,
    vertexShader: sectorShaders.simpleMesh.vertex
  });
  const obj = new THREE.Mesh(geometry, material);

  obj.name = `Quads ${sectorId}`;
  // TODO 20191028 dragly figure out why the quads are being culled wrongly and if we
  // can avoid disabling it entirely
  obj.frustumCulled = false;
  group.add(obj);

  sectorNode.add(group);
}
