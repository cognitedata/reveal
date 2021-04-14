/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { SectorGeometry } from '../sector/types';
import {
  boxGeometry,
  quadGeometry,
  coneGeometry,
  trapeziumGeometry,
  nutGeometry,
  torusGeometry,
  boxGeometryBoundingBox,
  quadGeometryBoundingBox,
  torusGeometryBoundingBox,
  nutGeometryBoundingBox
} from './primitiveGeometries';
import { Materials } from './materials';
import { ParsePrimitiveAttribute } from '@cognite/reveal-parser-worker';
import { disposeAttributeArrayOnUpload } from '../../../utilities/disposeAttributeArrayOnUpload';
import assert from 'assert';
import {
  filterPrimitivesOutsideClipBoxByBaseBoundsAndInstanceMatrix,
  filterPrimitivesOutsideClipBoxByCenterAndRadius,
  filterPrimitivesOutsideClipBoxByEllipse,
  filterPrimitivesOutsideClipBoxByVertices
} from './filterPrimitives';

export function* createPrimitives(
  sector: SectorGeometry,
  materials: Materials,
  bounds: THREE.Box3,
  clipBox: THREE.Box3 | undefined
) {
  const primitives = sector.primitives;

  if (hasAny(primitives.boxCollection)) {
    yield createBoxes(primitives.boxCollection, primitives.boxAttributes, materials.box, clipBox);
  }
  if (hasAny(primitives.circleCollection)) {
    yield createCircles(primitives.circleCollection, primitives.circleAttributes, materials.circle, clipBox);
  }
  if (hasAny(primitives.coneCollection)) {
    yield createCones(primitives.coneCollection, primitives.coneAttributes, materials.cone, bounds, clipBox);
  }
  if (hasAny(primitives.eccentricConeCollection)) {
    yield createEccentricCones(
      primitives.eccentricConeCollection,
      primitives.eccentricConeAttributes,
      materials.eccentricCone,
      bounds,
      clipBox
    );
  }
  if (hasAny(primitives.ellipsoidSegmentCollection)) {
    yield createEllipsoidSegments(
      primitives.ellipsoidSegmentCollection,
      primitives.ellipsoidSegmentAttributes,
      materials.ellipsoidSegment,
      bounds,
      clipBox
    );
  }
  if (hasAny(primitives.generalCylinderCollection)) {
    const cylinders = createGeneralCylinders(
      primitives.generalCylinderCollection,
      primitives.generalCylinderAttributes,
      materials.generalCylinder,
      bounds,
      clipBox
    );
    if (cylinders) yield cylinders;
  }
  if (hasAny(primitives.generalRingCollection)) {
    yield createGeneralRings(
      primitives.generalRingCollection,
      primitives.generalRingAttributes,
      materials.generalRing,
      clipBox
    );
  }
  if (hasAny(primitives.quadCollection)) {
    yield createQuads(primitives.quadCollection, primitives.quadAttributes, materials.quad, clipBox);
  }
  if (hasAny(primitives.sphericalSegmentCollection)) {
    yield createSphericalSegments(
      primitives.sphericalSegmentCollection,
      primitives.sphericalSegmentAttributes,
      materials.sphericalSegment,
      bounds,
      clipBox
    );
  }

  if (hasAny(primitives.torusSegmentCollection)) {
    yield createTorusSegments(
      primitives.torusSegmentCollection,
      primitives.torusSegmentAttributes,
      materials.torusSegment,
      clipBox
    );
  }
  if (hasAny(primitives.trapeziumCollection)) {
    yield createTrapeziums(
      primitives.trapeziumCollection,
      primitives.trapeziumAttributes,
      materials.trapezium,
      clipBox
    );
  }
  if (hasAny(primitives.nutCollection)) {
    yield createNuts(primitives.nutCollection, primitives.nutAttributes, materials.nut, clipBox);
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

  const size = matrixAttribute.size / matrixColumns;
  for (let i = 0; i < matrixColumns; i++) {
    const columnAttribute: ParsePrimitiveAttribute = {
      size,
      offset: matrixAttribute.offset + size * i
    };
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
  material: THREE.ShaderMaterial,
  clipBox: THREE.Box3 | undefined
) {
  const filteredCollection = filterPrimitivesOutsideClipBoxByBaseBoundsAndInstanceMatrix(
    boxCollection,
    boxAttributes,
    boxGeometryBoundingBox,
    clipBox
  );

  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(boxGeometry.index);
  geometry.setAttribute('position', boxGeometry.position);
  geometry.setAttribute('normal', boxGeometry.normal);
  setAttributes(geometry, filteredCollection, boxAttributes, mesh);
  setBoundsFromInstanceMatrices(geometry);

  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);

  mesh.name = `Primitives (Boxes)`;

  return mesh;
}

function createCircles(
  circleCollection: Uint8Array,
  circleAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial,
  clipBox: THREE.Box3 | undefined
) {
  const filteredCollection = filterPrimitivesOutsideClipBoxByBaseBoundsAndInstanceMatrix(
    circleCollection,
    circleAttributes,
    quadGeometryBoundingBox,
    clipBox
  );

  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(quadGeometry.index);
  geometry.setAttribute('position', quadGeometry.position);
  geometry.setAttribute('normal', quadGeometry.position);
  setAttributes(geometry, filteredCollection, circleAttributes, mesh);
  setBoundsFromInstanceMatrices(geometry);

  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);

  mesh.name = `Primitives (Circles)`;
  return mesh;
}

function createCones(
  coneCollection: Uint8Array,
  coneAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial,
  bounds: THREE.Box3,
  clipBox: THREE.Box3 | undefined
) {
  const filteredCollection = filterPrimitivesOutsideClipBoxByCenterAndRadius(coneCollection, coneAttributes, clipBox);

  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, filteredCollection, coneAttributes, mesh);
  setBoundsFromBox(geometry, bounds);

  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (Cones)`;
  return mesh;
}

function createEccentricCones(
  eccentericConeCollection: Uint8Array,
  eccentericConeAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial,
  bounds: THREE.Box3,
  clipBox: THREE.Box3 | undefined
) {
  const filteredCollection = filterPrimitivesOutsideClipBoxByCenterAndRadius(
    eccentericConeCollection,
    eccentericConeAttributes,
    clipBox
  );

  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, filteredCollection, eccentericConeAttributes, mesh);
  setBoundsFromBox(geometry, bounds);

  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (EccentricCones)`;
  return mesh;
}

function createEllipsoidSegments(
  ellipsoidSegmentCollection: Uint8Array,
  ellipsoidSegmentAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial,
  bounds: THREE.Box3,
  clipBox: THREE.Box3 | undefined
) {
  const filteredCollection = filterPrimitivesOutsideClipBoxByEllipse(
    ellipsoidSegmentCollection,
    ellipsoidSegmentAttributes,
    clipBox
  );
  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, filteredCollection, ellipsoidSegmentAttributes, mesh);
  setBoundsFromBox(geometry, bounds);

  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (EllipsoidSegments)`;
  return mesh;
}

function createGeneralCylinders(
  generalCylinderCollection: Uint8Array,
  generalCylinderAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial,
  bounds: THREE.Box3,
  clipBox: THREE.Box3 | undefined
): THREE.Mesh | null {
  const filteredCollection = filterPrimitivesOutsideClipBoxByCenterAndRadius(
    generalCylinderCollection,
    generalCylinderAttributes,
    clipBox,
    'radius',
    'radius'
  );
  if (filteredCollection.length === 0) {
    console.log('SKIP');
    return null;
  }

  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, filteredCollection, generalCylinderAttributes, mesh);
  setBoundsFromBox(geometry, bounds);

  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (GeneralCylinders)`;
  return mesh;
}

function createGeneralRings(
  generalRingCollection: Uint8Array,
  generalRingAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial,
  clipBox: THREE.Box3 | undefined
) {
  const filteredCollection = filterPrimitivesOutsideClipBoxByBaseBoundsAndInstanceMatrix(
    generalRingCollection,
    generalRingAttributes,
    quadGeometryBoundingBox,
    clipBox
  );

  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(quadGeometry.index);
  geometry.setAttribute('position', quadGeometry.position);
  setAttributes(geometry, filteredCollection, generalRingAttributes, mesh);
  setBoundsFromInstanceMatrices(geometry);

  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (GeneralRings)`;
  return mesh;
}

function createSphericalSegments(
  sphericalSegmentCollection: Uint8Array,
  sphericalSegmentAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial,
  bounds: THREE.Box3,
  clipBox: THREE.Box3 | undefined
) {
  const filteredCollection = filterPrimitivesOutsideClipBoxByEllipse(
    sphericalSegmentCollection,
    sphericalSegmentAttributes,
    clipBox,
    'radius',
    'radius'
  );

  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, filteredCollection, sphericalSegmentAttributes, mesh);
  setBoundsFromBox(geometry, bounds);

  // TODO We need to set the radius manually here because
  // we are reusing the ellipsoid shader. We should
  // consider making this cleaner - either by duplicating
  // this data from Rust or by creating a separate shader for
  // spherical segments

  geometry.setAttribute(`a_horizontalRadius`, geometry.getAttribute('a_radius'));
  geometry.setAttribute(`a_verticalRadius`, geometry.getAttribute('a_radius'));

  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (EllipsoidSegments)`;
  return mesh;
}

function createQuads(
  quadCollection: Uint8Array,
  quadAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial,
  clipBox: THREE.Box3 | undefined
) {
  const filteredCollection = filterPrimitivesOutsideClipBoxByBaseBoundsAndInstanceMatrix(
    quadCollection,
    quadAttributes,
    quadGeometryBoundingBox,
    clipBox
  );

  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(quadGeometry.index);
  geometry.setAttribute('position', quadGeometry.position);
  geometry.setAttribute('normal', quadGeometry.normal);
  setAttributes(geometry, filteredCollection, quadAttributes, mesh);
  setBoundsFromInstanceMatrices(geometry);

  mesh.name = `Primitives (Quads)`;
  return mesh;
}

function createTrapeziums(
  trapeziumCollection: Uint8Array,
  trapeziumAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial,
  clipBox: THREE.Box3 | undefined
) {
  const filteredCollection = filterPrimitivesOutsideClipBoxByVertices(
    trapeziumCollection,
    trapeziumAttributes,
    clipBox
  );

  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(trapeziumGeometry.index);
  geometry.setAttribute('position', trapeziumGeometry.position);
  setAttributes(geometry, filteredCollection, trapeziumAttributes, mesh);
  setBoundsFromVertexAttributes(geometry);

  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (Trapeziums)`;
  return mesh;
}

function createTorusSegments(
  torusSegmentCollection: Uint8Array,
  torusSegmentAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial,
  clipBox: THREE.Box3 | undefined
) {
  const filteredCollection = filterPrimitivesOutsideClipBoxByBaseBoundsAndInstanceMatrix(
    torusSegmentCollection,
    torusSegmentAttributes,
    torusGeometryBoundingBox,
    clipBox
  );

  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(torusGeometry.index);
  geometry.setAttribute('position', torusGeometry.position);
  setAttributes(geometry, filteredCollection, torusSegmentAttributes, mesh);
  setBoundsFromInstanceMatrices(geometry);

  mesh.onBeforeRender = () => updateMaterialInverseModelMatrix(material, mesh.matrixWorld);
  mesh.name = `Primitives (TorusSegments)`;
  return mesh;
}

function createNuts(
  nutCollection: Uint8Array,
  nutAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.ShaderMaterial,
  clipBox: THREE.Box3 | undefined
) {
  const filteredCollection = filterPrimitivesOutsideClipBoxByBaseBoundsAndInstanceMatrix(
    nutCollection,
    nutAttributes,
    nutGeometryBoundingBox,
    clipBox
  );

  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(nutGeometry.index);
  geometry.setAttribute('position', nutGeometry.position);
  geometry.setAttribute('normal', nutGeometry.normal);
  setAttributes(geometry, filteredCollection, nutAttributes, mesh);
  setBoundsFromInstanceMatrices(geometry);

  mesh.name = `Primitives (Nuts)`;
  return mesh;
}

function updateMaterialInverseModelMatrix(
  material: THREE.ShaderMaterial | THREE.RawShaderMaterial,
  matrixWorld: THREE.Matrix4
) {
  const inverseModelMatrix: THREE.Matrix4 = material.uniforms.inverseModelMatrix.value;
  inverseModelMatrix.copy(matrixWorld).invert();
}

function setBoundsFromBox(geometry: THREE.InstancedBufferGeometry, bounds: THREE.Box3) {
  geometry.boundingSphere = geometry.boundingSphere || new THREE.Sphere();
  bounds.getBoundingSphere(geometry.boundingSphere);
}

const setBoundingSphereFromVerticesVars = {
  baseBoundingBox: new THREE.Box3(),
  instanceBoundingBox: new THREE.Box3(),
  instanceMatrix: new THREE.Matrix4(),
  p: new THREE.Vector3()
};

function setBoundsFromInstanceMatrices(geometry: THREE.InstancedBufferGeometry) {
  const { baseBoundingBox, instanceBoundingBox, instanceMatrix, p } = setBoundingSphereFromVerticesVars;
  baseBoundingBox.makeEmpty();
  const bbox = new THREE.Box3();

  // Determine base bounding box
  const positionAttribute = geometry.getAttribute('position');
  for (let i = 0; i < positionAttribute.count; ++i) {
    p.set(positionAttribute.getX(i), positionAttribute.getY(i), positionAttribute.getZ(i));
    baseBoundingBox.expandByPoint(p);
  }

  // Apply instance matrix to bounds to compute real bounds
  const matCol0Attribute = geometry.getAttribute('a_instanceMatrix_column_0');
  const matCol1Attribute = geometry.getAttribute('a_instanceMatrix_column_1');
  const matCol2Attribute = geometry.getAttribute('a_instanceMatrix_column_2');
  const matCol3Attribute = geometry.getAttribute('a_instanceMatrix_column_3');
  assert(
    matCol0Attribute !== undefined &&
      matCol1Attribute !== undefined &&
      matCol2Attribute !== undefined &&
      matCol3Attribute !== undefined
  );

  for (let i = 0; i < matCol0Attribute.count; ++i) {
    /* eslint-disable */
    instanceMatrix.set(
      matCol0Attribute.getX(i), matCol1Attribute.getX(i), matCol2Attribute.getX(i), matCol3Attribute.getX(i),
      matCol0Attribute.getY(i), matCol1Attribute.getY(i), matCol2Attribute.getY(i), matCol3Attribute.getY(i),
      matCol0Attribute.getZ(i), matCol1Attribute.getZ(i), matCol2Attribute.getZ(i), matCol3Attribute.getZ(i),
      matCol0Attribute.getW(i), matCol1Attribute.getW(i), matCol2Attribute.getW(i), matCol3Attribute.getW(i),
    );
    /* eslint-enable */
    instanceBoundingBox.copy(baseBoundingBox).applyMatrix4(instanceMatrix);
    bbox.expandByPoint(instanceBoundingBox.min);
    bbox.expandByPoint(instanceBoundingBox.max);
  }
  geometry.boundingBox = bbox;
  geometry.boundingSphere = geometry.boundingSphere || new THREE.Sphere();
  geometry.boundingBox.getBoundingSphere(geometry.boundingSphere);
}

const setBoundsFromVertexAttributesVars = {
  bbox: new THREE.Box3(),
  p: new THREE.Vector3()
};

function setBoundsFromVertexAttributes(geometry: THREE.InstancedBufferGeometry) {
  const { bbox, p } = setBoundsFromVertexAttributesVars;
  bbox.makeEmpty();

  const vertex1Attribute = geometry.getAttribute('a_vertex1');
  const vertex2Attribute = geometry.getAttribute('a_vertex2');
  const vertex3Attribute = geometry.getAttribute('a_vertex3');
  const vertex4Attribute = geometry.getAttribute('a_vertex4');
  assert(
    vertex1Attribute !== undefined &&
      vertex2Attribute !== undefined &&
      vertex3Attribute !== undefined &&
      vertex4Attribute !== undefined
  );

  for (let i = 0; i < vertex1Attribute.count; ++i) {
    p.set(vertex1Attribute.getX(i), vertex1Attribute.getY(i), vertex1Attribute.getZ(i));
    bbox.expandByPoint(p);
    p.set(vertex2Attribute.getX(i), vertex2Attribute.getY(i), vertex2Attribute.getZ(i));
    bbox.expandByPoint(p);
    p.set(vertex3Attribute.getX(i), vertex3Attribute.getY(i), vertex3Attribute.getZ(i));
    bbox.expandByPoint(p);
    p.set(vertex4Attribute.getX(i), vertex4Attribute.getY(i), vertex4Attribute.getZ(i));
    bbox.expandByPoint(p);
  }

  geometry.boundingBox = bbox;
  geometry.boundingSphere = geometry.boundingSphere || new THREE.Sphere();
  geometry.boundingBox.getBoundingSphere(geometry.boundingSphere);
}
