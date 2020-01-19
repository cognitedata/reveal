/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { PrimitiveAttributes } from '../../../../workers/types/parser.types';
import { Sector } from '../../../models/sector/types';
import { TypedArray } from 'three';
import {
  nutsMaterial,
  boxMaterial,
  circleMaterial,
  quadsMaterial,
  createSphericalSegmentsMaterial,
  createConeMaterial,
  createEccentricConesMaterial,
  createEllipsoidSegmentsMaterial,
  createGeneralCylinderMaterial,
  createGeneralRingsMaterial,
  createTrapeziumsMaterial,
  createTorusSegmentsMaterial
} from './primitivesMaterials';
import {
  boxGeometry,
  quadGeometry,
  coneGeometry,
  trapeziumGeometry,
  torusLODs,
  nutGeometry
} from './primitiveGeometries';

export function* createPrimitives(sector: Sector) {
  if (hasAny(sector.boxes)) {
    yield createBoxes(sector.boxes);
  }
  if (hasAny(sector.circles)) {
    yield createCircles(sector.circles);
  }
  if (hasAny(sector.cones)) {
    yield createCones(sector.cones);
  }
  if (hasAny(sector.eccentricCones)) {
    yield createEccentricCones(sector.eccentricCones);
  }
  if (hasAny(sector.ellipsoidSegments)) {
    yield createEllipsoidSegments(sector.ellipsoidSegments);
  }
  if (hasAny(sector.generalCylinders)) {
    yield createGeneralCylinders(sector.generalCylinders);
  }
  if (hasAny(sector.generalRings)) {
    yield createGeneralRings(sector.generalRings);
  }
  if (hasAny(sector.quads)) {
    yield createQuads(sector.quads);
  }
  if (hasAny(sector.sphericalSegments)) {
    yield createSphericalSegments(sector.sphericalSegments);
  }
  if (hasAny(sector.torusSegments)) {
    yield createTorusSegments(sector.torusSegments);
  }
  if (hasAny(sector.trapeziums)) {
    yield createTrapeziums(sector.trapeziums);
  }
  if (hasAny(sector.nuts)) {
    yield createNuts(sector.nuts);
  }
}

function hasAny(attributes: PrimitiveAttributes) {
  return (
    hasAnyElements(attributes.f32Attributes) ||
    hasAnyElements(attributes.f64Attributes) ||
    hasAnyElements(attributes.mat4Attributes) ||
    hasAnyElements(attributes.u8Attributes) ||
    hasAnyElements(attributes.vec3Attributes) ||
    hasAnyElements(attributes.vec4Attributes)
  );
}

function hasAnyElements<T extends TypedArray>(attributeMap: Map<string, T>): boolean {
  let anyElements = false;
  for (const value of attributeMap.values()) {
    anyElements = anyElements || value.length > 0;
  }
  return anyElements;
}

function setAttributes(geometry: THREE.InstancedBufferGeometry, attributes: PrimitiveAttributes) {
  // TODO u8Attributes should probably be renamed to colorAttributes or similar
  // TODO should be enough with 3 elements for color instead of 4
  for (const [name, value] of attributes.u8Attributes) {
    const itemSize = 4;
    // We assume uint8 data is color and that it always is normalized. For now this is probably ok.
    // See comment above
    geometry.setAttribute(`a_${name}`, new THREE.InstancedBufferAttribute(value, itemSize, true));
  }
  for (const [name, value] of attributes.f32Attributes) {
    const itemSize = 1;
    geometry.setAttribute(`a_${name}`, new THREE.InstancedBufferAttribute(value, itemSize));
  }
  for (const [name, value] of attributes.vec3Attributes) {
    const itemSize = 3;
    geometry.setAttribute(`a_${name}`, new THREE.InstancedBufferAttribute(value, itemSize));
  }
  for (const [name, value] of attributes.vec4Attributes) {
    const itemSize = 4;
    geometry.setAttribute(`a_${name}`, new THREE.InstancedBufferAttribute(value, itemSize));
  }
  for (const [name, value] of attributes.mat4Attributes) {
    const buffer = new THREE.InstancedInterleavedBuffer(value, 16);
    for (let column = 0; column < 4; column++) {
      const attribute = new THREE.InterleavedBufferAttribute(buffer, 4, column * 4);
      geometry.setAttribute(`a_${name}_column_${column}`, attribute);
    }
  }
  for (const [name, value] of attributes.f64Attributes) {
    // TODO consider passing this properly from Rust instead
    const float32Value = new Float32Array(value);
    const itemSize = 1;
    geometry.setAttribute(`a_${name}`, new THREE.InstancedBufferAttribute(float32Value, itemSize));
  }
  const nodeIds = attributes.f64Attributes.get('nodeId');
  if (!nodeIds) {
    throw new Error('nodeId not present in f64Attributes');
  }
  geometry.maxInstancedCount = nodeIds.length;
}

function createBoxes(boxes: PrimitiveAttributes) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(boxGeometry.index);
  geometry.setAttribute('position', boxGeometry.position);
  geometry.setAttribute('normal', boxGeometry.normal);
  setAttributes(geometry, boxes);

  // TODO add frustum culling back for all meshes after adding proper boudning boxes
  const mesh = new THREE.Mesh(geometry, boxMaterial);
  mesh.frustumCulled = false;

  mesh.name = `Primitives (Boxes)`;
  return mesh;
}

function createCircles(circles: PrimitiveAttributes) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(quadGeometry.index);
  geometry.setAttribute('position', quadGeometry.position);
  geometry.setAttribute('normal', quadGeometry.position);
  setAttributes(geometry, circles);

  const mesh = new THREE.Mesh(geometry, circleMaterial);
  mesh.frustumCulled = false;

  mesh.name = `Primitives (Circles)`;
  return mesh;
}

function createCones(cones: PrimitiveAttributes) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, cones);

  const material = createConeMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (Cones)`;
  return mesh;
}

function createEccentricCones(eccentricCones: PrimitiveAttributes) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, eccentricCones);

  const material = createEccentricConesMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (EccentricCones)`;
  return mesh;
}

function createEllipsoidSegments(ellipsoidSegments: PrimitiveAttributes) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, ellipsoidSegments);

  const material = createEllipsoidSegmentsMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (EllipsoidSegments)`;
  return mesh;
}

function createGeneralCylinders(generalCylinders: PrimitiveAttributes) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, generalCylinders);

  const material = createGeneralCylinderMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (GeneralCylinders)`;
  return mesh;
}

function createGeneralRings(generalRings: PrimitiveAttributes) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(quadGeometry.index);
  geometry.setAttribute('position', quadGeometry.position);
  setAttributes(geometry, generalRings);

  const material = createGeneralRingsMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (GeneralRings)`;
  return mesh;
}

function createSphericalSegments(sphericalSegments: PrimitiveAttributes) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, sphericalSegments);

  const radii = sphericalSegments.f32Attributes.get('radius');
  if (!radii) {
    throw new Error('Spherical segments missing radius');
  }
  // TODO We need to set the radii manually here because
  // we are reusing the ellipsoid shader. We should
  // consider making this cleaner - either by duplicating
  // this data from Rust or by creating a separate shader for
  // spherical segments
  geometry.setAttribute(`a_horizontalRadius`, new THREE.InstancedBufferAttribute(radii, 1));
  geometry.setAttribute(`a_verticalRadius`, new THREE.InstancedBufferAttribute(radii, 1));

  const material = createSphericalSegmentsMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (EllipsoidSegments)`;
  return mesh;
}

function createQuads(quads: PrimitiveAttributes) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(quadGeometry.index);
  geometry.setAttribute('position', quadGeometry.position);
  geometry.setAttribute('normal', quadGeometry.normal);
  setAttributes(geometry, quads);

  const mesh = new THREE.Mesh(geometry, quadsMaterial);
  mesh.frustumCulled = false;
  mesh.name = `Primitives (Quads)`;
  return mesh;
}

function createTrapeziums(trapeziums: PrimitiveAttributes) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(trapeziumGeometry.index);
  geometry.setAttribute('position', trapeziumGeometry.position);
  setAttributes(geometry, trapeziums);

  const material = createTrapeziumsMaterial();
  const mesh = new THREE.Mesh(geometry, material);
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

function createTorusSegments(torusSegments: PrimitiveAttributes) {
  const sizes = torusSegments.f32Attributes.get('size');
  if (!sizes) {
    throw new Error('Torus segments are missing size attribute');
  }
  const biggestTorus = sizes.reduce((acc, size) => Math.max(acc, size));
  const lod = new THREE.LOD();
  lod.name = 'Primitives (TorusSegments)';

  for (const [level, torus] of torusLODs.entries()) {
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.setIndex(torus.index);
    geometry.setAttribute('position', torus.position);
    setAttributes(geometry, torusSegments);

    const material = createTorusSegmentsMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    // TODO consider removing if not used in shader
    mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
    mesh.name = `Primitives (TorusSegments) - LOD ${level}`;

    lod.addLevel(mesh, calcLODDistance(biggestTorus, level, torusLODs.length));
  }

  return lod;
}

function createNuts(nuts: PrimitiveAttributes) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(nutGeometry.index);
  geometry.setAttribute('position', nutGeometry.position);
  geometry.setAttribute('normal', nutGeometry.normal);
  setAttributes(geometry, nuts);

  const mesh = new THREE.Mesh(geometry, nutsMaterial);
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
