/*!
 * Copyright 2021 Cognite AS
 */

import { assertNever } from '@reveal/utilities';
import * as THREE from 'three';
import { RevealGeometryCollectionType } from '../types';

/**
 * Generate a three-dimensional plane geometry,
 * with an optional applied tranformation function (u, v) => [ x, y, z ]
 */
function generatePlane3D(
  segmentsX: number,
  segmentsY: number,
  transformFunc: (u: number, v: number) => number[] = (u, v) => [u, v, 0]
) {
  const vertices = [];
  const indices = [];

  const segmentsXInv = 1 / segmentsX;
  const segmentsYInv = 1 / segmentsY;
  for (let j = 0; j <= segmentsY; j++) {
    for (let i = 0; i <= segmentsX; i++) {
      // vertices
      const [x, y, z] = transformFunc(i * segmentsXInv, j * segmentsYInv);
      vertices.push(x || 0, y || 0, z || 0);
    }
  }

  for (let j = 1; j <= segmentsY; j++) {
    for (let i = 1; i <= segmentsX; i++) {
      // indices
      const a = (segmentsX + 1) * j + i - 1;
      const b = (segmentsX + 1) * (j - 1) + i - 1;
      const c = (segmentsX + 1) * (j - 1) + i;
      const d = (segmentsX + 1) * j + i;

      // faces
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  return {
    index: new THREE.Uint16BufferAttribute(indices, 1),
    position: new THREE.Float32BufferAttribute(vertices, 3)
  };
}

export function setBoxGeometry(geometry: THREE.BufferGeometry): THREE.Box3 {
  const boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1, 1, 1, 1);

  geometry.setIndex(boxGeometry.getIndex());
  geometry.setAttribute('position', boxGeometry.getAttribute('position'));
  geometry.setAttribute('normal', boxGeometry.getAttribute('normal'));

  geometry.computeBoundingBox();

  return geometry.boundingBox!;
}

export function setQuadGeometry(geometry: THREE.BufferGeometry, includeNormal = true): THREE.Box3 {
  const quadGeometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);

  geometry.setIndex(quadGeometry.getIndex());
  geometry.setAttribute('position', quadGeometry.getAttribute('position'));

  if (includeNormal) geometry.setAttribute('normal', quadGeometry.getAttribute('normal'));

  geometry.computeBoundingBox();

  return geometry.boundingBox!;
}

export function setTrapeziumGeometry(geometry: THREE.BufferGeometry): THREE.Box3 {
  const index = [0, 1, 3, 0, 3, 2];
  const position = [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3];

  geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(index), 1));
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position), 3));

  return new THREE.Box3().setFromArray(position);
}

export function setConeGeometry(geometry: THREE.BufferGeometry): THREE.Box3 {
  const positions = [];
  positions.push(-1, 1, -1);
  positions.push(-1, -1, -1);
  positions.push(1, 1, -1);
  positions.push(1, -1, -1);
  positions.push(1, 1, 1);
  positions.push(1, -1, 1);

  const indices = new Uint16Array([1, 2, 0, 1, 3, 2, 3, 4, 2, 3, 5, 4]);

  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  return new THREE.Box3().setFromArray(positions);
}

export function setTorusGeometry(geometry: THREE.BufferGeometry): THREE.Box3 {
  const lods = [
    { tubularSegments: 9, radialSegments: 18 },
    { tubularSegments: 5, radialSegments: 12 },
    { tubularSegments: 4, radialSegments: 5 }
  ];
  const transformFunc = (u: number, v: number) => [u, v * 2.0 * Math.PI];

  const torusGeometry = generatePlane3D(lods[0].radialSegments, lods[0].tubularSegments, transformFunc);

  geometry.setIndex(torusGeometry.index);
  geometry.setAttribute('position', torusGeometry.position);

  return new THREE.Box3().setFromArray(torusGeometry.position.array);
}

export function setNutGeometry(geometry: THREE.BufferGeometry): THREE.Box3 {
  const nutGeometry = new THREE.CylinderBufferGeometry(0.5, 0.5, 1, 6);
  nutGeometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

  geometry.setIndex(nutGeometry.getIndex());
  geometry.setAttribute('position', nutGeometry.getAttribute('position'));
  geometry.setAttribute('normal', nutGeometry.getAttribute('normal'));

  return new THREE.Box3().setFromArray(nutGeometry.getAttribute('position').array);
}

export function setPrimitiveTopology(
  primitiveCollectionName: RevealGeometryCollectionType,
  geometry: THREE.BufferGeometry
): void {
  switch (primitiveCollectionName) {
    case RevealGeometryCollectionType.BoxCollection:
      setBoxGeometry(geometry);
      break;
    case RevealGeometryCollectionType.CircleCollection:
      setQuadGeometry(geometry); // should use the position as normal
      break;
    case RevealGeometryCollectionType.ConeCollection:
      setConeGeometry(geometry);
      break;
    case RevealGeometryCollectionType.EccentricConeCollection:
      setConeGeometry(geometry);
      break;
    case RevealGeometryCollectionType.EllipsoidSegmentCollection:
      setConeGeometry(geometry);
      break;
    case RevealGeometryCollectionType.GeneralCylinderCollection:
      setConeGeometry(geometry);
      break;
    case RevealGeometryCollectionType.GeneralRingCollection:
      setQuadGeometry(geometry, false);
      break;
    case RevealGeometryCollectionType.NutCollection:
      setNutGeometry(geometry);
      break;
    case RevealGeometryCollectionType.QuadCollection:
      setQuadGeometry(geometry);
      break;
    case RevealGeometryCollectionType.TrapeziumCollection:
      setTrapeziumGeometry(geometry);
      break;
    case RevealGeometryCollectionType.TorusSegmentCollection:
      setTorusGeometry(geometry);
      break;
    case RevealGeometryCollectionType.InstanceMesh:
    case RevealGeometryCollectionType.TriangleMesh:
      break;
    default:
      assertNever(primitiveCollectionName);
  }
}
