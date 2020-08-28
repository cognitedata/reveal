/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { SectorGeometry } from '../sector/types';
import {
  boxGeometry,
  quadGeometry,
  coneGeometry,
  trapeziumGeometry,
  torusLODs,
  nutGeometry
} from './primitiveGeometries';
import { Materials } from './materials';
import { ParsePrimitiveAttribute } from '@cognite/reveal-parser-worker';
import { disposeAttributeArrayOnUpload } from '@/utilities/disposeAttributeArrayOnUpload';

export function* createPrimitives(sector: SectorGeometry, materials: Materials) {
  const primitives = sector.primitives;

  if (hasAny(primitives.boxCollection)) {
    yield createBoxes(primitives.boxCollection, primitives.boxAttributes, materials.box);
  }
  if (hasAny(primitives.circleCollection)) {
    yield createCircles(primitives.circleCollection, primitives.circleAttributes, materials.circle);
  }
  if (hasAny(primitives.coneCollection)) {
    yield createCones(primitives.coneCollection, primitives.coneAttributes, materials.cone);
  }
  if (hasAny(primitives.eccentricConeCollection)) {
    yield createEccentricCones(
      primitives.eccentricConeCollection,
      primitives.eccentricConeAttributes,
      materials.eccentricCone
    );
  }
  if (hasAny(primitives.ellipsoidSegmentCollection)) {
    yield createEllipsoidSegments(
      primitives.ellipsoidSegmentCollection,
      primitives.ellipsoidSegmentAttributes,
      materials.ellipsoidSegment
    );
  }
  if (hasAny(primitives.generalCylinderCollection)) {
    yield createGeneralCylinders(
      primitives.generalCylinderCollection,
      primitives.generalCylinderAttributes,
      materials.generalCylinder
    );
  }
  if (hasAny(primitives.generalRingCollection)) {
    yield createGeneralRings(primitives.generalRingCollection, primitives.generalRingAttributes, materials.generalRing);
  }
  if (hasAny(primitives.quadCollection)) {
    yield createQuads(primitives.quadCollection, primitives.quadAttributes, materials.quad);
  }
  if (hasAny(primitives.sphericalSegmentCollection)) {
    yield createSphericalSegments(
      primitives.sphericalSegmentCollection,
      primitives.sphericalSegmentAttributes,
      materials.sphericalSegment
    );
  }
  if (hasAny(primitives.torusSegmentCollection)) {
    yield createTorusSegments(
      primitives.torusSegmentCollection,
      primitives.torusSegmentAttributes,
      materials.torusSegment
    );
  }
  if (hasAny(primitives.trapeziumCollection)) {
    yield createTrapeziums(primitives.trapeziumCollection, primitives.trapeziumAttributes, materials.trapezium);
  }
  if (hasAny(primitives.nutCollection)) {
    yield createNuts(primitives.nutCollection, primitives.nutAttributes, materials.nut);
  }
}

function hasAny(collection: Uint8Array) {
  return collection.length > 0;
}

function splitMatrix(attributes: Map<string, ParsePrimitiveAttribute>) {
  const matrixColumns = 4;

  const matrixAttribute = attributes.get('instanceMatrix');

  if (!matrixAttribute) {
    return;
  }

  for (let i = 0; i < matrixColumns; i++) {
    const size = matrixAttribute!.size / matrixColumns;
    const columnAttribute = {
      size,
      offset: matrixAttribute!.offset + size * i
    } as ParsePrimitiveAttribute;

    attributes.set('instanceMatrix_column_' + i, columnAttribute);
  }

  attributes.delete('instanceMatrix');
}

function setAttributes(
  geometry: THREE.InstancedBufferGeometry,
  collection: Uint8Array,
  attributes: Map<string, ParsePrimitiveAttribute>,
  mesh: THREE.Mesh
) {
  const attributesByteSize = Array.from(attributes.values()).reduce((a, b) => a + b.size, 0);

  splitMatrix(attributes);

  const interleavedBuffer8 = new THREE.InstancedInterleavedBuffer(collection, attributesByteSize);
  const interleavedBuffer32 = new THREE.InstancedInterleavedBuffer(
    new Float32Array(collection.buffer),
    attributesByteSize / 4
  );

  for (const [name, attribute] of attributes) {
    const is8BitAttribute = name === 'color';
    const interleavedBuffer = is8BitAttribute ? interleavedBuffer8 : interleavedBuffer32;
    const size = is8BitAttribute ? attribute.size : attribute.size / 4;
    const offset = is8BitAttribute ? attribute.offset : attribute.offset / 4;

    geometry.setAttribute(
      `a_${name}`,
      new THREE.InterleavedBufferAttribute(interleavedBuffer, size, offset, is8BitAttribute)
    );
  }

  mesh.onAfterRender = () => {
    disposeAttributeArrayOnUpload.bind(interleavedBuffer32)();
    disposeAttributeArrayOnUpload.bind(interleavedBuffer8)();
    mesh.onAfterRender = () => {};
  };

  geometry.instanceCount = collection.length / attributesByteSize;

  setTreeIndeciesToUserData();

  function setTreeIndeciesToUserData() {
    const collectionView = new DataView(collection.buffer);
    const treeIndexAttribute = attributes.get('treeIndex')!;
    const treeIndexAttributeOffset = treeIndexAttribute.offset;

    const treeIndices = new Set();

    for (let i = 0; i < geometry.instanceCount; i++) {
      treeIndices.add(collectionView.getFloat32(i * attributesByteSize + treeIndexAttributeOffset, true));
    }
    mesh.userData.treeIndices = treeIndices;
  }
}

function createBoxes(
  boxCollection: Uint8Array,
  boxAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial
) {
  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(boxGeometry.index);
  geometry.setAttribute('position', boxGeometry.position);
  geometry.setAttribute('normal', boxGeometry.normal);
  setAttributes(geometry, boxCollection, boxAttributes, mesh);

  // TODO add frustum culling back for all meshes after adding proper boudning boxes
  mesh.frustumCulled = false;
  mesh.name = `Primitives (Boxes)`;

  return mesh;
}

function createCircles(
  circleCollection: Uint8Array,
  circleAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial
) {
  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(quadGeometry.index);
  geometry.setAttribute('position', quadGeometry.position);
  geometry.setAttribute('normal', quadGeometry.position);
  setAttributes(geometry, circleCollection, circleAttributes, mesh);

  mesh.frustumCulled = false;

  mesh.name = `Primitives (Circles)`;
  return mesh;
}

function createCones(
  coneCollection: Uint8Array,
  coneAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial
) {
  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, coneCollection, coneAttributes, mesh);

  mesh.frustumCulled = false;
  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (Cones)`;
  return mesh;
}

function createEccentricCones(
  eccentericConeCollection: Uint8Array,
  eccentericConeAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial
) {
  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, eccentericConeCollection, eccentericConeAttributes, mesh);

  mesh.frustumCulled = false;
  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (EccentricCones)`;
  return mesh;
}

function createEllipsoidSegments(
  ellipsoidSegmentCollection: Uint8Array,
  ellipsoidSegmentAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial
) {
  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, ellipsoidSegmentCollection, ellipsoidSegmentAttributes, mesh);

  mesh.frustumCulled = false;
  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (EllipsoidSegments)`;
  return mesh;
}

function createGeneralCylinders(
  generalCylinderCollection: Uint8Array,
  generalCylinderAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial
) {
  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, generalCylinderCollection, generalCylinderAttributes, mesh);

  mesh.frustumCulled = false;
  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (GeneralCylinders)`;
  return mesh;
}

function createGeneralRings(
  generalRingCollection: Uint8Array,
  generalRingAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial
) {
  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(quadGeometry.index);
  geometry.setAttribute('position', quadGeometry.position);
  setAttributes(geometry, generalRingCollection, generalRingAttributes, mesh);

  mesh.frustumCulled = false;
  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (GeneralRings)`;
  return mesh;
}

function createSphericalSegments(
  sphericalSegmentCollection: Uint8Array,
  sphericalSegmentAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial
) {
  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, sphericalSegmentCollection, sphericalSegmentAttributes, mesh);

  // TODO We need to set the radius manually here because
  // we are reusing the ellipsoid shader. We should
  // consider making this cleaner - either by duplicating
  // this data from Rust or by creating a separate shader for
  // spherical segments

  geometry.setAttribute(`a_horizontalRadius`, geometry.getAttribute('a_radius'));
  geometry.setAttribute(`a_verticalRadius`, geometry.getAttribute('a_radius'));

  mesh.frustumCulled = false;
  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (EllipsoidSegments)`;
  return mesh;
}

function createQuads(
  quadCollection: Uint8Array,
  quadAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial
) {
  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(quadGeometry.index);
  geometry.setAttribute('position', quadGeometry.position);
  geometry.setAttribute('normal', quadGeometry.normal);
  setAttributes(geometry, quadCollection, quadAttributes, mesh);

  mesh.frustumCulled = false;
  mesh.name = `Primitives (Quads)`;
  return mesh;
}

function createTrapeziums(
  trapeziumCollection: Uint8Array,
  trapeziumAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial
) {
  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(trapeziumGeometry.index);
  geometry.setAttribute('position', trapeziumGeometry.position);
  setAttributes(geometry, trapeziumCollection, trapeziumAttributes, mesh);

  mesh.frustumCulled = false;
  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (Trapeziums)`;
  return mesh;
}

function calcLODDistance(size: number, lodLevel: number, numLevels: number): number {
  if (lodLevel >= numLevels - 1) {
    return 0;
  }
  const scaleFactor = 15; // Seems to be a reasonable number
  return size * scaleFactor ** (numLevels - 1 - lodLevel);
}

function createTorusSegments(
  torusSegmentCollection: Uint8Array,
  torusSegmentAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial
) {
  const sizes = getTorusSizes(torusSegmentCollection, torusSegmentAttributes);
  if (!sizes) {
    throw new Error('Torus segments are missing size attribute');
  }
  const biggestTorus = sizes.reduce((acc, size) => Math.max(acc, size));
  const lod = new THREE.LOD();
  lod.name = 'Primitives (TorusSegments)';

  for (const [level, torus] of torusLODs.entries()) {
    const geometry = new THREE.InstancedBufferGeometry();
    const mesh = new THREE.Mesh(geometry, material);

    geometry.setIndex(torus.index);
    geometry.setAttribute('position', torus.position);

    setAttributes(geometry, torusSegmentCollection, torusSegmentAttributes, mesh);

    mesh.frustumCulled = false;
    mesh.name = `Primitives (TorusSegments) - LOD ${level}`;

    lod.addLevel(mesh, calcLODDistance(biggestTorus, level, torusLODs.length));
  }

  return lod;
}

function getTorusSizes(
  torusSegmentCollection: Uint8Array,
  torusSegmentAttributes: Map<string, ParsePrimitiveAttribute>
) {
  const collectionStride = Array.from(torusSegmentAttributes.values()).reduce((sum, element) => sum + element.size, 0);

  const numberOfTorusSegments = torusSegmentCollection.length / collectionStride;

  const sizes = new Float32Array(numberOfTorusSegments);

  const collectionView = new DataView(torusSegmentCollection.buffer);
  const sizeAttribute = torusSegmentAttributes.get('size')!;
  const sizeAttributeOffset = sizeAttribute.offset;

  for (let i = 0; i < numberOfTorusSegments; i++) {
    sizes[i] = collectionView.getFloat32(i * collectionStride + sizeAttributeOffset!, true);
  }

  return sizes;
}

function createNuts(
  nutCollection: Uint8Array,
  nutAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial
) {
  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(nutGeometry.index);
  geometry.setAttribute('position', nutGeometry.position);
  geometry.setAttribute('normal', nutGeometry.normal);
  setAttributes(geometry, nutCollection, nutAttributes, mesh);

  mesh.frustumCulled = false;
  mesh.name = `Primitives (Nuts)`;
  return mesh;
}

function updateMaterialInverseModelMatrix(
  material: THREE.ShaderMaterial | THREE.RawShaderMaterial,
  matrixWorld: THREE.Matrix4
) {
  material.uniforms.inverseModelMatrix.value.getInverse(matrixWorld);
}
