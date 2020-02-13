/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { PrimitiveAttributes } from '../../../workers/types/parser.types';
import { Sector } from '../../../models/cad/types';
import { TypedArray } from 'three';
import {
  boxGeometry,
  quadGeometry,
  coneGeometry,
  trapeziumGeometry,
  torusLODs,
  nutGeometry
} from './primitiveGeometries';
import { Materials } from './materials';

type SetColorDelegate = (treeIndex: number, red: number, green: number, blue: number) => void;

export function* createPrimitives(sector: Sector, materials: Materials, setColor: SetColorDelegate) {
  if (hasAny(sector.boxes)) {
    setColors(sector.boxes, setColor);
    yield createBoxes(sector.boxes, materials.box);
  }
  if (hasAny(sector.circles)) {
    setColors(sector.circles, setColor);
    yield createCircles(sector.circles, materials.circle);
  }
  if (hasAny(sector.cones)) {
    setColors(sector.cones, setColor);
    yield createCones(sector.cones, materials.cone);
  }
  if (hasAny(sector.eccentricCones)) {
    setColors(sector.eccentricCones, setColor);
    yield createEccentricCones(sector.eccentricCones, materials.eccentricCone);
  }
  if (hasAny(sector.ellipsoidSegments)) {
    setColors(sector.ellipsoidSegments, setColor);
    yield createEllipsoidSegments(sector.ellipsoidSegments, materials.ellipsoidSegment);
  }
  if (hasAny(sector.generalCylinders)) {
    setColors(sector.generalCylinders, setColor);
    yield createGeneralCylinders(sector.generalCylinders, materials.generalCylinder);
  }
  if (hasAny(sector.generalRings)) {
    setColors(sector.generalRings, setColor);
    yield createGeneralRings(sector.generalRings, materials.generalRing);
  }
  if (hasAny(sector.quads)) {
    setColors(sector.quads, setColor);
    yield createQuads(sector.quads, materials.quad);
  }
  if (hasAny(sector.sphericalSegments)) {
    setColors(sector.sphericalSegments, setColor);
    yield createSphericalSegments(sector.sphericalSegments, materials.sphericalSegment);
  }
  if (hasAny(sector.torusSegments)) {
    setColors(sector.torusSegments, setColor);
    yield createTorusSegments(sector.torusSegments, materials.torusSegment);
  }
  if (hasAny(sector.trapeziums)) {
    setColors(sector.trapeziums, setColor);
    yield createTrapeziums(sector.trapeziums, materials.trapezium);
  }
  if (hasAny(sector.nuts)) {
    setColors(sector.nuts, setColor);
    yield createNuts(sector.nuts, materials.nut);
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

function setColors(attributes: PrimitiveAttributes, setColor: SetColorDelegate) {
  // TODO ensure this exists instead of assuming it here (bake it into the type)
  const treeIndices = attributes.f64Attributes.get('treeIndex')!;
  const colors = attributes.u8Attributes.get('color')!;
  for (let i = 0; i < treeIndices.length; i++) {
    const treeIndex = treeIndices[i];
    const red = colors[4 * i];
    const green = colors[4 * i + 1];
    const blue = colors[4 * i + 2];
    setColor(treeIndex, red, green, blue);
  }
}

function createBoxes(boxes: PrimitiveAttributes, material: THREE.ShaderMaterial) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(boxGeometry.index);
  geometry.setAttribute('position', boxGeometry.position);
  geometry.setAttribute('normal', boxGeometry.normal);
  setAttributes(geometry, boxes);

  // TODO add frustum culling back for all meshes after adding proper boudning boxes
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;

  mesh.name = `Primitives (Boxes)`;
  return mesh;
}

function createCircles(circles: PrimitiveAttributes, material: THREE.ShaderMaterial) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(quadGeometry.index);
  geometry.setAttribute('position', quadGeometry.position);
  geometry.setAttribute('normal', quadGeometry.position);
  setAttributes(geometry, circles);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;

  mesh.name = `Primitives (Circles)`;
  return mesh;
}

function createCones(cones: PrimitiveAttributes, material: THREE.ShaderMaterial) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, cones);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (Cones)`;
  return mesh;
}

function createEccentricCones(eccentricCones: PrimitiveAttributes, material: THREE.ShaderMaterial) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, eccentricCones);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (EccentricCones)`;
  return mesh;
}

function createEllipsoidSegments(ellipsoidSegments: PrimitiveAttributes, material: THREE.ShaderMaterial) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, ellipsoidSegments);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (EllipsoidSegments)`;
  return mesh;
}

function createGeneralCylinders(generalCylinders: PrimitiveAttributes, material: THREE.ShaderMaterial) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, generalCylinders);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (GeneralCylinders)`;
  return mesh;
}

function createGeneralRings(generalRings: PrimitiveAttributes, material: THREE.ShaderMaterial) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(quadGeometry.index);
  geometry.setAttribute('position', quadGeometry.position);
  setAttributes(geometry, generalRings);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (GeneralRings)`;
  return mesh;
}

function createSphericalSegments(sphericalSegments: PrimitiveAttributes, material: THREE.ShaderMaterial) {
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

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (EllipsoidSegments)`;
  return mesh;
}

function createQuads(quads: PrimitiveAttributes, material: THREE.ShaderMaterial) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(quadGeometry.index);
  geometry.setAttribute('position', quadGeometry.position);
  geometry.setAttribute('normal', quadGeometry.normal);
  setAttributes(geometry, quads);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.name = `Primitives (Quads)`;
  return mesh;
}

function createTrapeziums(trapeziums: PrimitiveAttributes, material: THREE.ShaderMaterial) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(trapeziumGeometry.index);
  geometry.setAttribute('position', trapeziumGeometry.position);
  setAttributes(geometry, trapeziums);

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

function createTorusSegments(torusSegments: PrimitiveAttributes, material: THREE.ShaderMaterial) {
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

    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    // TODO consider removing if not used in shader
    mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
    mesh.name = `Primitives (TorusSegments) - LOD ${level}`;

    lod.addLevel(mesh, calcLODDistance(biggestTorus, level, torusLODs.length));
  }

  return lod;
}

function createNuts(nuts: PrimitiveAttributes, material: THREE.ShaderMaterial) {
  const geometry = new THREE.InstancedBufferGeometry();

  geometry.setIndex(nutGeometry.index);
  geometry.setAttribute('position', nutGeometry.position);
  geometry.setAttribute('normal', nutGeometry.normal);
  setAttributes(geometry, nuts);

  const mesh = new THREE.Mesh(geometry, material);
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
