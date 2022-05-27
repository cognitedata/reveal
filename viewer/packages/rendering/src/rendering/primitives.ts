/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { ParsePrimitiveAttribute } from '@cognite/reveal-parser-worker';
import {
  boxGeometry,
  quadGeometry,
  coneGeometry,
  trapeziumGeometry,
  nutGeometry,
  torusLodGeometries,
  boxGeometryBoundingBox,
  quadGeometryBoundingBox,
  // torusGeometryBoundingBox, // Disabled due to error in torus bounding box
  nutGeometryBoundingBox,
  SectorGeometry,
  filterPrimitivesOutsideClipBoxByBaseBoundsAndInstanceMatrix,
  filterPrimitivesOutsideClipBoxByCenterAndRadius,
  filterPrimitivesOutsideClipBoxByEllipse,
  filterPrimitivesOutsideClipBoxByVertices
} from '@reveal/cad-parsers';

import { BoundingBoxLOD, disposeAttributeArrayOnUpload, incrementOrInsertIndex } from '@reveal/utilities';

import { Materials } from './materials';

import assert from 'assert';

export function* createPrimitives(
  sector: SectorGeometry,
  materials: Materials,
  sectorBounds: THREE.Box3,
  geometryClipBox: THREE.Box3 | null = null
): Generator<THREE.Mesh | BoundingBoxLOD> {
  const primitives = sector.primitives;
  if (hasAny(primitives.boxCollection)) {
    yield createBoxes(primitives.boxCollection, primitives.boxAttributes, materials.box, geometryClipBox);
  }
  if (hasAny(primitives.circleCollection)) {
    yield createCircles(primitives.circleCollection, primitives.circleAttributes, materials.circle, geometryClipBox);
  }
  if (hasAny(primitives.coneCollection)) {
    const cones = createCones(
      primitives.coneCollection,
      primitives.coneAttributes,
      materials.cone,
      sectorBounds,
      geometryClipBox
    );

    if (cones) yield cones;
  }
  if (hasAny(primitives.eccentricConeCollection)) {
    const eccentricCones = createEccentricCones(
      primitives.eccentricConeCollection,
      primitives.eccentricConeAttributes,
      materials.eccentricCone,
      sectorBounds,
      geometryClipBox
    );

    if (eccentricCones) yield eccentricCones;
  }
  if (hasAny(primitives.ellipsoidSegmentCollection)) {
    const ellipsoidSegments = createEllipsoidSegments(
      primitives.ellipsoidSegmentCollection,
      primitives.ellipsoidSegmentAttributes,
      materials.ellipsoidSegment,
      sectorBounds,
      geometryClipBox
    );

    if (ellipsoidSegments) yield ellipsoidSegments;
  }
  if (hasAny(primitives.generalCylinderCollection)) {
    const cylinders = createGeneralCylinders(
      primitives.generalCylinderCollection,
      primitives.generalCylinderAttributes,
      materials.generalCylinder,
      sectorBounds,
      geometryClipBox
    );

    if (cylinders) yield cylinders;
  }
  if (hasAny(primitives.generalRingCollection)) {
    const generalRings = createGeneralRings(
      primitives.generalRingCollection,
      primitives.generalRingAttributes,
      materials.generalRing,
      geometryClipBox
    );

    if (generalRings) yield generalRings;
  }
  if (hasAny(primitives.quadCollection)) {
    const quads = createQuads(primitives.quadCollection, primitives.quadAttributes, materials.quad, geometryClipBox);

    if (quads) yield quads;
  }
  if (hasAny(primitives.sphericalSegmentCollection)) {
    const sphericalSegments = createSphericalSegments(
      primitives.sphericalSegmentCollection,
      primitives.sphericalSegmentAttributes,
      materials.sphericalSegment,
      sectorBounds,
      geometryClipBox
    );

    if (sphericalSegments) yield sphericalSegments;
  }

  if (hasAny(primitives.torusSegmentCollection)) {
    yield createTorusSegments(
      primitives.torusSegmentCollection,
      primitives.torusSegmentAttributes,
      materials.torusSegment,
      geometryClipBox
    );
  }
  if (hasAny(primitives.trapeziumCollection)) {
    const trapezi = createTrapeziums(
      primitives.trapeziumCollection,
      primitives.trapeziumAttributes,
      materials.trapezium,
      geometryClipBox
    );

    if (trapezi) yield trapezi;
  }
  if (hasAny(primitives.nutCollection)) {
    yield createNuts(primitives.nutCollection, primitives.nutAttributes, materials.nut, geometryClipBox);
  }
}

function hasAny(collection: Uint8Array) {
  return collection.length > 0;
}

function setAttributes(
  geometry: THREE.InstancedBufferGeometry,
  collection: Uint8Array,
  attributes: Map<string, ParsePrimitiveAttribute>,
  mesh: THREE.Mesh
) {
  const attributesByteSize = Array.from(attributes.values()).reduce((a, b) => a + b.size, 0);

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

    const treeIndices = new Map<number, number>();

    for (let i = 0; i < geometry.instanceCount; i++) {
      incrementOrInsertIndex(
        treeIndices,
        collectionView.getFloat32(i * attributesByteSize + treeIndexAttributeOffset, true)
      );
    }
    mesh.userData.treeIndices = treeIndices;
  }
}

function createBoxes(
  boxCollection: Uint8Array,
  boxAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.RawShaderMaterial,
  geometryClipBox: THREE.Box3 | null
) {
  const filteredCollection = filterPrimitivesOutsideClipBoxByBaseBoundsAndInstanceMatrix(
    boxCollection,
    boxAttributes,
    boxGeometryBoundingBox,
    geometryClipBox
  );

  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(boxGeometry.index);
  geometry.setAttribute('position', boxGeometry.position);
  setAttributes(geometry, filteredCollection, boxAttributes, mesh);
  setBoundsFromInstanceMatrices(geometry);

  mesh.onBeforeRender = (_0, _1, camera: THREE.Camera) => {
    updateMaterialUniforms(material, mesh, camera);
  };

  mesh.name = `Primitives (Boxes)`;

  return mesh;
}

function createCircles(
  circleCollection: Uint8Array,
  circleAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.RawShaderMaterial,
  geometryClipBox: THREE.Box3 | null
) {
  const filteredCollection = filterPrimitivesOutsideClipBoxByBaseBoundsAndInstanceMatrix(
    circleCollection,
    circleAttributes,
    quadGeometryBoundingBox,
    geometryClipBox
  );

  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(quadGeometry.index);
  geometry.setAttribute('position', quadGeometry.position);
  geometry.setAttribute('normal', quadGeometry.position);
  setAttributes(geometry, filteredCollection, circleAttributes, mesh);
  setBoundsFromInstanceMatrices(geometry);

  mesh.onBeforeRender = (_0, _1, camera: THREE.Camera) => {
    updateMaterialUniforms(material, mesh, camera);
  };

  mesh.name = `Primitives (Circles)`;
  return mesh;
}

function createCones(
  coneCollection: Uint8Array,
  coneAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.RawShaderMaterial,
  bounds: THREE.Box3,
  geometryClipBox: THREE.Box3 | null
): THREE.Mesh | null {
  const filteredCollection = filterPrimitivesOutsideClipBoxByCenterAndRadius(
    coneCollection,
    coneAttributes,
    geometryClipBox
  );
  if (filteredCollection.length === 0) {
    return null;
  }

  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, filteredCollection, coneAttributes, mesh);

  setBoundsFromBox(geometry, bounds);

  mesh.onBeforeRender = (_0, _1, camera: THREE.Camera) => {
    updateMaterialUniforms(material, mesh, camera);
  };
  mesh.name = `Primitives (Cones)`;
  return mesh;
}

function createEccentricCones(
  eccentericConeCollection: Uint8Array,
  eccentericConeAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.RawShaderMaterial,
  bounds: THREE.Box3,
  geometryClipBox: THREE.Box3 | null
): THREE.Mesh | null {
  const filteredCollection = filterPrimitivesOutsideClipBoxByCenterAndRadius(
    eccentericConeCollection,
    eccentericConeAttributes,
    geometryClipBox
  );

  if (filteredCollection.length === 0) {
    return null;
  }

  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, filteredCollection, eccentericConeAttributes, mesh);
  setBoundsFromBox(geometry, bounds);

  mesh.onBeforeRender = (_0, _1, camera: THREE.Camera) => {
    updateMaterialUniforms(material, mesh, camera);
  };
  mesh.name = `Primitives (EccentricCones)`;
  return mesh;
}

function createEllipsoidSegments(
  ellipsoidSegmentCollection: Uint8Array,
  ellipsoidSegmentAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.RawShaderMaterial,
  bounds: THREE.Box3,
  geometryClipBox: THREE.Box3 | null
): THREE.Mesh | null {
  const filteredCollection = filterPrimitivesOutsideClipBoxByEllipse(
    ellipsoidSegmentCollection,
    ellipsoidSegmentAttributes,
    geometryClipBox
  );

  if (filteredCollection.length === 0) {
    return null;
  }

  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, filteredCollection, ellipsoidSegmentAttributes, mesh);
  setBoundsFromBox(geometry, bounds);

  mesh.onBeforeRender = (_0, _1, camera: THREE.Camera) => {
    updateMaterialUniforms(material, mesh, camera);
  };
  mesh.name = `Primitives (EllipsoidSegments)`;
  return mesh;
}

function createGeneralCylinders(
  generalCylinderCollection: Uint8Array,
  generalCylinderAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.RawShaderMaterial,
  bounds: THREE.Box3,
  geometryClipBox: THREE.Box3 | null
): THREE.Mesh | null {
  const filteredCollection = filterPrimitivesOutsideClipBoxByCenterAndRadius(
    generalCylinderCollection,
    generalCylinderAttributes,
    geometryClipBox,
    'radius',
    'radius'
  );
  if (filteredCollection.length === 0) {
    return null;
  }

  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(coneGeometry.index);
  geometry.setAttribute('position', coneGeometry.position);
  setAttributes(geometry, filteredCollection, generalCylinderAttributes, mesh);
  setBoundsFromBox(geometry, bounds);

  mesh.onBeforeRender = (_0, _1, camera: THREE.Camera) => {
    updateMaterialUniforms(material, mesh, camera);
  };

  mesh.name = `Primitives (GeneralCylinders)`;

  return mesh;
}

function createGeneralRings(
  generalRingCollection: Uint8Array,
  generalRingAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.RawShaderMaterial,
  geometryClipBox: THREE.Box3 | null
): THREE.Mesh | null {
  const filteredCollection = filterPrimitivesOutsideClipBoxByBaseBoundsAndInstanceMatrix(
    generalRingCollection,
    generalRingAttributes,
    quadGeometryBoundingBox,
    geometryClipBox
  );

  if (filteredCollection.length === 0) {
    return null;
  }

  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(quadGeometry.index);
  geometry.setAttribute('position', quadGeometry.position);
  setAttributes(geometry, filteredCollection, generalRingAttributes, mesh);
  setBoundsFromInstanceMatrices(geometry);

  mesh.onBeforeRender = (_0, _1, camera: THREE.Camera) => {
    updateMaterialUniforms(material, mesh, camera);
  };

  mesh.name = `Primitives (GeneralRings)`;

  return mesh;
}

function createSphericalSegments(
  sphericalSegmentCollection: Uint8Array,
  sphericalSegmentAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.RawShaderMaterial,
  bounds: THREE.Box3,
  geometryClipBox: THREE.Box3 | null
): THREE.Mesh | null {
  const filteredCollection = filterPrimitivesOutsideClipBoxByEllipse(
    sphericalSegmentCollection,
    sphericalSegmentAttributes,
    geometryClipBox,
    'radius',
    'radius'
  );

  if (filteredCollection.length === 0) {
    return null;
  }

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

  mesh.onBeforeRender = (_0, _1, camera: THREE.Camera) => {
    updateMaterialUniforms(material, mesh, camera);
  };
  mesh.name = `Primitives (EllipsoidSegments)`;
  return mesh;
}

function createQuads(
  quadCollection: Uint8Array,
  quadAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.RawShaderMaterial,
  geometryClipBox: THREE.Box3 | null
): THREE.Mesh | null {
  const filteredCollection = filterPrimitivesOutsideClipBoxByBaseBoundsAndInstanceMatrix(
    quadCollection,
    quadAttributes,
    quadGeometryBoundingBox,
    geometryClipBox
  );

  if (filteredCollection.length === 0) {
    return null;
  }

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
  material: THREE.RawShaderMaterial,
  geometryClipBox: THREE.Box3 | null
): THREE.Mesh | null {
  const filteredCollection = filterPrimitivesOutsideClipBoxByVertices(
    trapeziumCollection,
    trapeziumAttributes,
    geometryClipBox
  );

  if (filteredCollection.length === 0) {
    return null;
  }

  const geometry = new THREE.InstancedBufferGeometry();
  const mesh = new THREE.Mesh(geometry, material);

  geometry.setIndex(trapeziumGeometry.index);
  geometry.setAttribute('position', trapeziumGeometry.position);
  setAttributes(geometry, filteredCollection, trapeziumAttributes, mesh);
  setBoundsFromVertexAttributes(geometry);

  mesh.onBeforeRender = (_0, _1, camera: THREE.Camera) => {
    updateMaterialUniforms(material, mesh, camera);
  };
  mesh.name = `Primitives (Trapeziums)`;
  return mesh;
}

function getBiggestTorusSize(
  torusSegmentCollection: Uint8Array,
  torusSegmentAttributes: Map<string, ParsePrimitiveAttribute>
) {
  const collectionStride = Array.from(torusSegmentAttributes.values()).reduce((sum, element) => sum + element.size, 0);

  const numberOfTorusSegments = torusSegmentCollection.length / collectionStride;

  let biggest = 0.0;

  const collectionView = new DataView(torusSegmentCollection.buffer);
  const sizeAttribute = torusSegmentAttributes.get('size')!;
  const sizeAttributeOffset = sizeAttribute.offset;

  for (let i = 0; i < numberOfTorusSegments; i++) {
    biggest = Math.max(biggest, collectionView.getFloat32(i * collectionStride + sizeAttributeOffset!, true));
  }

  return biggest;
}

function calcLODDistance(size: number, lodLevel: number): number {
  if (lodLevel === 0) {
    return 0;
  }
  const scaleFactor = 5.0;
  const distance = size * scaleFactor ** lodLevel;
  return distance;
}

function createTorusSegments(
  torusSegmentCollection: Uint8Array,
  torusSegmentAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.RawShaderMaterial,
  _geometryClipBox: THREE.Box3 | null
): BoundingBoxLOD {
  // Torus filtering is disabled due to currently faulty bounding box definition
  /* const filteredCollection = filterPrimitivesOutsideClipBoxByBaseBoundsAndInstanceMatrix(
    torusSegmentCollection,
    torusSegmentAttributes,
    torusGeometryBoundingBox,
    geometryClipBox
    ); */
  const filteredCollection = torusSegmentCollection;

  const biggestTorus = getBiggestTorusSize(filteredCollection, torusSegmentAttributes);

  const lod = new BoundingBoxLOD(new THREE.Box3());
  lod.name = 'Primitives (TorusSegments)';

  let boundingBox: THREE.Box3 | null = null;
  let boundingSphere: THREE.Sphere | null = null;
  for (const [level, torus] of torusLodGeometries.entries()) {
    const geometry = new THREE.InstancedBufferGeometry();
    const mesh = new THREE.Mesh(geometry, material);

    geometry.setIndex(torus.index);
    geometry.setAttribute('position', torus.position);
    setAttributes(geometry, torusSegmentCollection, torusSegmentAttributes, mesh);

    if (boundingBox === null) {
      const bounds = determineBoundsFromInstanceMatrices(geometry);
      boundingBox = bounds.boundingBox;
      boundingSphere = bounds.boundingSphere;
      lod.setBoundingBox(boundingBox);
    }
    geometry.boundingBox = boundingBox;
    geometry.boundingSphere = boundingSphere;

    mesh.name = `Primitives (TorusSegments) - LOD ${level}`;
    lod.addLevel(mesh, calcLODDistance(biggestTorus, level));

    mesh.onBeforeRender = (_0, _1, camera: THREE.Camera) => {
      updateMaterialUniforms(material, mesh, camera);
    };
  }

  lod.userData = lod.children[0].userData;

  return lod;
}

function createNuts(
  nutCollection: Uint8Array,
  nutAttributes: Map<string, ParsePrimitiveAttribute>,
  material: THREE.RawShaderMaterial,
  geometryClipBox: THREE.Box3 | null
) {
  const filteredCollection = filterPrimitivesOutsideClipBoxByBaseBoundsAndInstanceMatrix(
    nutCollection,
    nutAttributes,
    nutGeometryBoundingBox,
    geometryClipBox
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

function updateMaterialUniforms(material: THREE.RawShaderMaterial, mesh: THREE.Mesh, camera: THREE.Camera) {
  (material.uniforms.cameraPosition?.value as THREE.Vector3)?.copy(camera.position);

  const inverseModelMatrix: THREE.Matrix4 = material.uniforms.inverseModelMatrix.value;
  inverseModelMatrix.copy(mesh.matrixWorld).invert();
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

export function determineBoundsFromInstanceMatrices(geometry: THREE.InstancedBufferGeometry): {
  boundingBox: THREE.Box3;
  boundingSphere: THREE.Sphere;
} {
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
  const instanceMatrixAttribute = geometry.getAttribute('a_instanceMatrix') as THREE.InterleavedBufferAttribute;

  assert(instanceMatrixAttribute !== undefined);

  const attributeOffset = instanceMatrixAttribute.offset;
  const count = instanceMatrixAttribute.data.count;
  const stride = instanceMatrixAttribute.data.stride;

  const view = new Float32Array(instanceMatrixAttribute.array);

  for (let i = 0; i < count; ++i) {
    /* eslint-disable */
    const offset = attributeOffset + i * stride;

    instanceMatrix.set(
      view[offset], view[offset + 4], view[offset + 8], view[offset + 12],
      view[offset + 1], view[offset + 5], view[offset + 9], view[offset + 13],
      view[offset + 2], view[offset + 6], view[offset + 10], view[offset + 14],
      view[offset + 3], view[offset + 7], view[offset + 11], view[offset + 15]
    );

    /* eslint-enable */
    instanceBoundingBox.copy(baseBoundingBox).applyMatrix4(instanceMatrix);
    bbox.expandByPoint(instanceBoundingBox.min);
    bbox.expandByPoint(instanceBoundingBox.max);
  }

  return { boundingBox: bbox, boundingSphere: bbox.getBoundingSphere(new THREE.Sphere()) };
}

function setBoundsFromInstanceMatrices(geometry: THREE.InstancedBufferGeometry) {
  const { boundingBox, boundingSphere } = determineBoundsFromInstanceMatrices(geometry);
  geometry.boundingBox = boundingBox;
  geometry.boundingSphere = boundingSphere;
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
  // TODO 20210804 larsmoa: Compute better bounding spheres for primitives
  geometry.boundingSphere = geometry.boundingSphere || new THREE.Sphere();
  geometry.boundingBox.getBoundingSphere(geometry.boundingSphere);
}
