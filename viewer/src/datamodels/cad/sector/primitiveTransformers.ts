/*!
 * Copyright 2021 Cognite AS
 */

import { ParsePrimitiveAttribute } from '@cognite/reveal-parser-worker';

import * as THREE from 'three';

const boxInputStructSize = 52;
const circleInputStructSize = 40;
const closedConeInputStructSize = 48;
const closedCylinderInputStructSize = 44;
const closedEccentricConeInputStructSize = 60;
const closedEllipsoidSegmentInputStructSize = 48;
const closedExtrudedRingSegmentInputStructSize = 56;
const closedSphericalSegmentInputStructSize = 44;
const closedTorusSegmentInputStructSize = 52;
const ellipsoidInputStructSize = 44;
const extrudedRingInputStructSize = 48;
const nutInputStructSize = 48;
const openConeInputStructSize = 48;
const openCylinderInputStructSize = 44;
const openEccentricConeInputStructSize = 60;
const openEllipsoidSegmentInputStructSize = 48;
const openExtrudedRingSegmentInputStructSize = 56;
const openSphericalSegmentInputStructSize = 44;
const openTorusSegmentInputStructSize = 52;
const ringInputStructSize = 44;
const sphereInputStructSize = 28;
const torusInputStructSize = 44;
const openGeneralCylinderInputStructSize = 68;
const closedGeneralCylinderInputStructSize = 68;
const solidOpenGeneralCylinderInputStructSize = 72;
const solidClosedGeneralCylinderInputStructSize = 72;
const openGeneralConeInputStructSize = 72;
const closedGeneralConeInputStructSize = 72;
const solidOpenGeneralConeInputStructSize = 76;
const solidClosedGeneralConeInputStructSize = 76;

const boxOutputStructSize = 72;
const circleOutputStructSize = 84;
const coneOutputStructSize = 60;
const eccentricConeOutputStructSize = 52;
const ellipsoidSegmentOutputStructSize = 44;
const generalCylinderOutputStructSize = 88;
const generalRingOutputStructSize = 96;
const nutOutputStructSize = 72;
const quadOutputStructSize = 72;
const sphericalSegmentOutputStructSize = 40;
const torusSegmentOutputStructSize = 88;
const trapeziumOutputStructSize = 56;

export function getBoxOutputSize(boxInputBuffer: Uint8Array): number {
  return Math.round((boxInputBuffer.byteLength / boxInputStructSize) * boxOutputStructSize);
}

export function getCircleOutputSize(
  circleInputBuffer: Uint8Array,
  closedConeInputBuffer: Uint8Array,
  closedEccentricConeInputBuffer: Uint8Array,
  closedCylinderInputBuffer: Uint8Array,
  closedEllipsoidSegmentInputBuffer: Uint8Array,
  closedSphericalSegmentInputBuffer: Uint8Array
): number {
  return Math.round(
    (circleInputBuffer.byteLength / circleInputStructSize +
      (2 * closedConeInputBuffer.byteLength) / closedConeInputStructSize +
      (2 * closedEccentricConeInputBuffer.byteLength) / closedEccentricConeInputStructSize +
      (2 * closedCylinderInputBuffer.byteLength) / closedCylinderInputStructSize +
      closedEllipsoidSegmentInputBuffer.byteLength / closedEllipsoidSegmentInputStructSize +
      closedSphericalSegmentInputBuffer.byteLength / closedSphericalSegmentInputStructSize) *
      circleOutputStructSize
  );
}

export function getConeOutputSize(
  closedConeInputBuffer: Uint8Array,
  openConeInputBuffer: Uint8Array,
  openGeneralConeInputBuffer: Uint8Array,
  closedGeneralConeInputBuffer: Uint8Array,
  solidOpenGeneralConeInputBuffer: Uint8Array,
  solidClosedGeneralConeInputBuffer: Uint8Array,
  closedCylinderInputBuffer: Uint8Array,
  openCylinderInputBuffer: Uint8Array,
  closedExtrudedRingSegmentInputBuffer: Uint8Array,
  extrudedRingInputBuffer: Uint8Array,
  openExtrudedRingSegmentInputBuffer: Uint8Array
): number {
  return Math.round(
    (closedConeInputBuffer.byteLength / closedConeInputStructSize +
      openConeInputBuffer.byteLength / openConeInputStructSize +
      openGeneralConeInputBuffer.byteLength / openGeneralConeInputStructSize +
      closedGeneralConeInputBuffer.byteLength / closedGeneralConeInputStructSize +
      (2 * solidOpenGeneralConeInputBuffer.byteLength) / solidOpenGeneralConeInputStructSize +
      (2 * solidClosedGeneralConeInputBuffer.byteLength) / solidClosedGeneralConeInputStructSize +
      closedCylinderInputBuffer.byteLength / closedCylinderInputStructSize +
      openCylinderInputBuffer.byteLength / openCylinderInputStructSize +
      (2 * closedExtrudedRingSegmentInputBuffer.byteLength) / closedExtrudedRingSegmentInputStructSize +
      (2 * extrudedRingInputBuffer.byteLength) / extrudedRingInputStructSize +
      (2 * openExtrudedRingSegmentInputBuffer.byteLength) / openExtrudedRingSegmentInputStructSize) *
      coneOutputStructSize
  );
}

export function getEccentricConeOutputSize(
  closedEccentricConeInputBuffer: Uint8Array,
  openEccentricConeInputBuffer: Uint8Array
): number {
  return Math.round(
    (closedEccentricConeInputBuffer.byteLength / closedEccentricConeInputStructSize +
      openEccentricConeInputBuffer.byteLength / openEccentricConeInputStructSize) *
      eccentricConeOutputStructSize
  );
}

export function getEllipsoidSegmentOutputSize(
  closedEllipsoidSegmentInputBuffer: Uint8Array,
  ellipsoidInputBuffer: Uint8Array,
  openEllipsoidSegmentInputBuffer: Uint8Array
): number {
  return Math.round(
    (closedEllipsoidSegmentInputBuffer.byteLength / closedEllipsoidSegmentInputStructSize +
      ellipsoidInputBuffer.byteLength / ellipsoidInputStructSize +
      openEllipsoidSegmentInputBuffer.byteLength / openEllipsoidSegmentInputStructSize) *
      ellipsoidSegmentOutputStructSize
  );
}

export function getGeneralCylinderOutputSize(
  openGeneralCylinderInputBuffer: Uint8Array,
  closedGeneralCylinderInputBuffer: Uint8Array,
  solidOpenGeneralCylinderInputBuffer: Uint8Array,
  solidClosedGeneralCylinderInputBuffer: Uint8Array
): number {
  return Math.round(
    (openGeneralCylinderInputBuffer.byteLength / openGeneralCylinderInputStructSize +
      closedGeneralCylinderInputBuffer.byteLength / closedGeneralCylinderInputStructSize +
      (2 * solidOpenGeneralCylinderInputBuffer.byteLength) / solidOpenGeneralCylinderInputStructSize +
      (2 * solidClosedGeneralCylinderInputBuffer.byteLength) / solidClosedGeneralCylinderInputStructSize) *
      generalCylinderOutputStructSize
  );
}

export function getGeneralRingOutputSize(
  closedGeneralConeInputBuffer: Uint8Array,
  solidOpenGeneralConeInputBuffer: Uint8Array,
  solidClosedGeneralConeInputBuffer: Uint8Array,
  closedGeneralCylinderInputBuffer: Uint8Array,
  solidOpenGeneralCylinderInputBuffer: Uint8Array,
  solidClosedGeneralCylinderInputBuffer: Uint8Array,
  closedExtrudedRingSegmentInputBuffer: Uint8Array,
  extrudedRingInputBuffer: Uint8Array,
  openExtrudedRingSegmentInputBuffer: Uint8Array,
  ringInputBuffer: Uint8Array
): number {
  return Math.round(
    ((2 * closedGeneralConeInputBuffer.byteLength) / closedGeneralConeInputStructSize +
      (2 * solidOpenGeneralConeInputBuffer.byteLength) / solidOpenGeneralConeInputStructSize +
      (2 * solidClosedGeneralConeInputBuffer.byteLength) / solidClosedGeneralConeInputStructSize +
      (2 * closedGeneralCylinderInputBuffer.byteLength) / closedGeneralCylinderInputStructSize +
      (2 * solidOpenGeneralCylinderInputBuffer.byteLength) / solidOpenGeneralCylinderInputStructSize +
      (2 * solidClosedGeneralCylinderInputBuffer.byteLength) / solidClosedGeneralCylinderInputStructSize +
      (2 * closedExtrudedRingSegmentInputBuffer.byteLength) / closedExtrudedRingSegmentInputStructSize +
      (2 * extrudedRingInputBuffer.byteLength) / extrudedRingInputStructSize +
      (2 * openExtrudedRingSegmentInputBuffer.byteLength) / openExtrudedRingSegmentInputStructSize +
      ringInputBuffer.byteLength / ringInputStructSize) *
      generalRingOutputStructSize
  );
}

export function getNutOutputSize(nutInputBuffer: Uint8Array): number {
  return Math.round((nutInputBuffer.byteLength / nutInputStructSize) * nutOutputStructSize);
}

export function getQuadOutputSize(closedExtrudedRingSegmentInputBuffer: Uint8Array): number {
  return Math.round(
    ((2 * closedExtrudedRingSegmentInputBuffer.byteLength) / closedExtrudedRingSegmentInputStructSize) *
      quadOutputStructSize
  );
}

export function getSphericalSegmentOutputSize(
  openSphericalSegmentInputBuffer: Uint8Array,
  sphereInputBuffer: Uint8Array,
  closedSphericalSegmentInputBuffer: Uint8Array
): number {
  return Math.round(
    (openSphericalSegmentInputBuffer.byteLength / openSphericalSegmentInputStructSize +
      sphereInputBuffer.byteLength / sphereInputStructSize +
      closedSphericalSegmentInputBuffer.byteLength / closedSphericalSegmentInputStructSize) *
      sphericalSegmentOutputStructSize
  );
}

export function getTorusSegmentOutputSize(
  torusInputBuffer: Uint8Array,
  closedTorusSegmentInputBuffer: Uint8Array,
  openTorusSegmentInputBuffer: Uint8Array
): number {
  return Math.round(
    (torusInputBuffer.byteLength / torusInputStructSize +
      closedTorusSegmentInputBuffer.byteLength / closedTorusSegmentInputStructSize +
      openTorusSegmentInputBuffer.byteLength / openTorusSegmentInputStructSize) *
      torusSegmentOutputStructSize
  );
}

export function getTrapeziumOutputSize(
  solidClosedGeneralConeInputBuffer: Uint8Array,
  solidClosedGeneralCylinderInputBuffer: Uint8Array
): number {
  return Math.round(
    ((2 * solidClosedGeneralConeInputBuffer.byteLength) / solidClosedGeneralConeInputStructSize +
      (2 * solidClosedGeneralCylinderInputBuffer.byteLength) / solidClosedGeneralCylinderInputStructSize) *
      trapeziumOutputStructSize
  );
}

/**
 * Util functions
 */

function createTranslation(center: THREE.Vector3): THREE.Matrix4 {
  return new THREE.Matrix4().makeTranslation(center.x, center.y, center.z);
}

function createRotationBetweenZ(axis: THREE.Vector3): THREE.Matrix4 {
  return new THREE.Matrix4().makeRotationFromQuaternion(
    new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), axis)
  );
}

function createRotationAxisAngle(axis: THREE.Vector3, angle: number): THREE.Matrix4 {
  return new THREE.Matrix4().makeRotationAxis(axis, angle);
}

function createScale(scale: THREE.Vector3): THREE.Matrix4 {
  return new THREE.Matrix4().makeScale(scale.x, scale.y, scale.z);
}

function createRotationAroundZ(angle: number): THREE.Matrix4 {
  return new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), angle);
}

function createGeneralRingMatrix(
  center: THREE.Vector3,
  normal: THREE.Vector3,
  localXAxis: THREE.Vector3,
  radiusA: number,
  radiusB: number
): THREE.Matrix4 {
  const localYAxis = normal.clone().cross(localXAxis);

  const rotationMatrix = new THREE.Matrix4().set(
    localXAxis.x,
    localYAxis.x,
    normal.x,
    0,
    localXAxis.y,
    localYAxis.y,
    normal.y,
    0,
    localXAxis.z,
    localYAxis.z,
    normal.z,
    0,
    0,
    0,
    0,
    1
  );

  const translationMatrix = createTranslation(center);
  const scale = createScale(new THREE.Vector3(2 * radiusA, 2 * radiusB, 1.0));
  return translationMatrix.clone().multiply(rotationMatrix).multiply(scale);
}

/*
 * Read utils
 */

function getVector3(inView: DataView, offset: number): THREE.Vector3 {
  return new THREE.Vector3(
    inView.getFloat32(offset + 0, true),
    inView.getFloat32(offset + 4, true),
    inView.getFloat32(offset + 8, true)
  );
}

function getColor(inView: DataView, offset: number): THREE.Vector4 {
  return new THREE.Vector4(
    inView.getUint8(offset + 0),
    inView.getUint8(offset + 1),
    inView.getUint8(offset + 2),
    inView.getUint8(offset + 3)
  );
}

/**
 * Output utils
 */

interface CylinderCap {
  treeIndex: number;
  color: THREE.Vector4;
  normal: THREE.Vector3;
  thickness: number;
  angle: number;
  arcAngle: number;
  instanceMatrix: THREE.Matrix4;
  plane: THREE.Vector4;
  center: THREE.Vector3;
}

function getCylinderCap(
  treeIndex: number,
  color: THREE.Vector4,
  cylinderRotation: THREE.Matrix4,
  cylinderRotationAngle: number,
  axis: THREE.Vector3,
  extA: THREE.Vector3,
  extB: THREE.Vector3,
  center: THREE.Vector3,
  radius: number,
  thickness: number,
  arcAngle: number,
  slope: number,
  zAngle: number,
  height: number,
  invNormal: boolean
): CylinderCap {
  const slopeRotation = createRotationAxisAngle(new THREE.Vector3(0, 1, 0), slope);
  const zAngleRotation = createRotationAxisAngle(new THREE.Vector3(0, 0, 1), zAngle);
  const rotation = zAngleRotation.clone().multiply(slopeRotation);
  const localXAxis = new THREE.Vector3(1, 0, 0).applyMatrix4(rotation);
  const localZAxis = new THREE.Vector3(0, 0, 1).applyMatrix4(rotation);
  const normal = localZAxis.clone().multiplyScalar(invNormal ? -1 : 1);

  const centerAxisRotation = createRotationBetweenZ(axis);

  const plane = new THREE.Vector4(normal.x, normal.y, normal.z, height);
  const capXAxisA = localXAxis.applyMatrix4(centerAxisRotation).normalize();
  const capZAxisA = localZAxis.applyMatrix4(cylinderRotation).normalize();

  const capRadiusXA = radius / Math.abs(Math.cos(slope));
  const capRadiusY = radius;

  let linePoint = new THREE.Vector3(Math.cos(cylinderRotationAngle), Math.sin(cylinderRotationAngle), 0);

  linePoint = linePoint.applyMatrix4(cylinderRotation).normalize().multiplyScalar(radius);
  const lineStartA = extB.clone().sub(axis).add(linePoint);
  const lineEndA = extA.clone().add(axis).add(linePoint);
  const lineVector = lineEndA.clone().sub(lineStartA);

  const intersectionPoint = intersect(lineVector, lineStartA, capZAxisA, center);
  const capAngleAxisA = intersectionPoint.clone().sub(center).normalize();
  const capAngleA = angleBetweenVectors(capAngleAxisA, capXAxisA, capZAxisA);

  const instanceMatrix = createGeneralRingMatrix(center, capZAxisA, capXAxisA, capRadiusXA, capRadiusY);

  return {
    treeIndex,
    color,
    normal: (invNormal ? capZAxisA.clone().negate() : capZAxisA),
    thickness: thickness / radius,
    angle: normalizeRadians(capAngleA),
    arcAngle,
    instanceMatrix,
    plane,
    center
  };
}

interface GeneralCylinder {
  treeIndex: number;
  color: THREE.Vector4;
  centerA: THREE.Vector3;
  centerB: THREE.Vector3;
  radius: number;
  angle: number;
  planeA: THREE.Vector4;
  planeB: THREE.Vector4;
  arcAngle: number;
  localXAxis: THREE.Vector3;
  capA: CylinderCap;
  capB: CylinderCap;
  extA: THREE.Vector3;
  extB: THREE.Vector3;
}

function getGeneralCylinder(
  treeIndex: number,
  color: THREE.Vector4,
  center: THREE.Vector3,
  axis: THREE.Vector3,
  height: number,
  radius: number,
  thickness: number,
  rotationAngle: number,
  arcAngle: number,
  slopeA: number,
  slopeB: number,
  zAngleA: number,
  zAngleB: number
): GeneralCylinder {
  const centerA = center.clone().addScaledVector(axis, height / 2);
  const centerB = center.clone().addScaledVector(axis, -height / 2);

  const distFromAToExtA = radius + Math.tan(slopeA);
  const distFromBToExtB = radius + Math.tan(slopeB);

  const heightA = distFromBToExtB + height;
  const heightB = distFromBToExtB;

  const extA = centerA.clone().addScaledVector(axis, distFromAToExtA);
  const extB = centerB.clone().addScaledVector(axis, -distFromBToExtB);

  const normal = extA.clone().sub(extB).normalize();

  const rotation = createRotationBetweenZ(normal);

  const localXAxis = new THREE.Vector3(1, 0, 0).applyMatrix4(rotation);

  const capA = getCylinderCap(
    treeIndex,
    color,
    rotation,
    rotationAngle,
    axis,
    extA,
    extB,
    centerA,
    radius,
    thickness,
    arcAngle,
    slopeA,
    zAngleA,
    heightA,
    false
  );

  const capB = getCylinderCap(
    treeIndex,
    color,
    rotation,
    rotationAngle,
    axis,
    extA,
    extB,
    centerB,
    radius,
    thickness,
    arcAngle,
    slopeB,
    zAngleB,
    heightB,
    true
  );

  return {
    treeIndex,
    color,
    centerA: extA,
    centerB: extB,
    radius,
    angle: normalizeRadians(rotationAngle),
    planeA: capA.plane,
    planeB: capB.plane,
    arcAngle,
    localXAxis,
    capA,
    capB,
    extA,
    extB
  };
}

/**
 * Util write functions
 */

function writeFloat(float: number, dataView: DataView, byteOffset: number) {
  dataView.setFloat32(byteOffset, float, true);
}

function writeMatrix4(matrix: THREE.Matrix4, dataView: DataView, byteOffset: number) {
  const elements = matrix.elements;

  for (let i = 0; i < 16; i++) {
    writeFloat(elements[i], dataView, byteOffset + i * 4);
  }
}

function writeColor(outColor: THREE.Vector4, outView: DataView, offset: number) {
  outView.setUint8(offset + 0, outColor.z);
  outView.setUint8(offset + 1, outColor.y);
  outView.setUint8(offset + 2, outColor.x);
  outView.setUint8(offset + 3, outColor.w);
}

function writeVector3(outVector: THREE.Vector3, outView: DataView, offset: number) {
  writeFloat(outVector.x, outView, offset + 0);
  writeFloat(outVector.y, outView, offset + 4);
  writeFloat(outVector.z, outView, offset + 8);
}

function writeVector4(outVector: THREE.Vector4, outView: DataView, offset: number) {
  writeFloat(outVector.x, outView, offset + 0);
  writeFloat(outVector.y, outView, offset + 4);
  writeFloat(outVector.z, outView, offset + 8);
  writeFloat(outVector.w, outView, offset + 12);
}

/*
 * Primitive write functions
 */

function outputBox3(
  treeIndex: number,
  color: THREE.Vector4,
  instanceMatrix: THREE.Matrix4,
  outView: DataView,
  offset: number,
  boxAttributes: Map<string, ParsePrimitiveAttribute>
) {
  const treeIndexOffset = offset + boxAttributes.get('treeIndex')!.offset;
  const colorOffset = offset + boxAttributes.get('color')!.offset;
  const instanceMatrixOffset = offset + boxAttributes.get('instanceMatrix')!.offset;

  outView.setFloat32(treeIndexOffset, treeIndex, true);
  writeColor(color, outView, colorOffset);

  writeMatrix4(instanceMatrix, outView, instanceMatrixOffset);
}

function outputCircle(
  treeIndex: number,
  color: THREE.Vector4,
  center: THREE.Vector3,
  normal: THREE.Vector3,
  radius: number,
  outView: DataView,
  offset: number,
  circleAttributes: Map<string, ParsePrimitiveAttribute>
) {
  const translationMatrix = createTranslation(center);
  const rotationMatrix = createRotationBetweenZ(normal);
  const scale = createScale(new THREE.Vector3(2 * radius, 2 * radius, 1));

  const instanceMatrix = translationMatrix.clone().multiply(rotationMatrix).multiply(scale);

  const treeIndexOffset = offset + circleAttributes.get('treeIndex')!.offset;
  const colorOffset = offset + circleAttributes.get('color')!.offset;
  const normalOffset = offset + circleAttributes.get('normal')!.offset;
  const instanceMatrixOffset = offset + circleAttributes.get('instanceMatrix')!.offset;

  writeFloat(treeIndex, outView, treeIndexOffset);
  writeColor(color, outView, colorOffset);
  writeVector3(normal, outView, normalOffset);
  writeMatrix4(instanceMatrix, outView, instanceMatrixOffset);
}

function outputRing(
  treeIndex: number,
  color: THREE.Vector4,
  normal: THREE.Vector3,
  thickness: number,
  rotationAngle: number,
  arcAngle: number,
  transformation: THREE.Matrix4,
  outView: DataView,
  offset: number,
  ringAttributes: Map<string, ParsePrimitiveAttribute>
) {
  const treeIndexOffset = offset + ringAttributes.get('treeIndex')!.offset;
  const colorOffset = offset + ringAttributes.get('color')!.offset;
  const normalOffset = offset + ringAttributes.get('normal')!.offset;
  const thicknessOffset = offset + ringAttributes.get('thickness')!.offset;
  const rotationAngleOffset = offset + ringAttributes.get('angle')!.offset;
  const arcAngleOffset = offset + ringAttributes.get('arcAngle')!.offset;
  const instanceMatrixOffset = offset + ringAttributes.get('instanceMatrix')!.offset;

  writeFloat(treeIndex, outView, treeIndexOffset);
  writeColor(color, outView, colorOffset);
  writeVector3(normal, outView, normalOffset);
  writeFloat(thickness, outView, thicknessOffset);
  writeFloat(rotationAngle, outView, rotationAngleOffset);
  writeFloat(arcAngle, outView, arcAngleOffset);
  writeMatrix4(transformation, outView, instanceMatrixOffset);
}

function outputCone(
  treeIndex: number,
  color: THREE.Vector4,
  centerA: THREE.Vector3,
  centerB: THREE.Vector3,
  radiusA: number,
  radiusB: number,
  rotationAngle: number,
  arcAngle: number,
  localXAxis: THREE.Vector3,
  outView: DataView,
  offset: number,
  coneAttributes: Map<string, ParsePrimitiveAttribute>
) {
  const treeIndexOffset = offset + coneAttributes.get('treeIndex')!.offset;
  const colorOffset = offset + coneAttributes.get('color')!.offset;
  const centerAOffset = offset + coneAttributes.get('centerA')!.offset;
  const centerBOffset = offset + coneAttributes.get('centerB')!.offset;
  const radiusAOffset = offset + coneAttributes.get('radiusA')!.offset;
  const radiusBOffset = offset + coneAttributes.get('radiusB')!.offset;
  const angleOffset = offset + coneAttributes.get('angle')!.offset;
  const arcAngleOffset = offset + coneAttributes.get('arcAngle')!.offset;
  const localXAxisOffset = offset + coneAttributes.get('localXAxis')!.offset;

  writeFloat(treeIndex, outView, treeIndexOffset);
  writeColor(color, outView, colorOffset);
  writeVector3(centerA, outView, centerAOffset);
  writeVector3(centerB, outView, centerBOffset);
  writeFloat(radiusA, outView, radiusAOffset);
  writeFloat(radiusB, outView, radiusBOffset);
  writeFloat(rotationAngle, outView, angleOffset);
  writeFloat(arcAngle, outView, arcAngleOffset);
  writeVector3(localXAxis, outView, localXAxisOffset);
}

function outputEccentricCone(
  treeIndex: number,
  color: THREE.Vector4,
  centerA: THREE.Vector3,
  centerB: THREE.Vector3,
  radiusA: number,
  radiusB: number,
  normal: THREE.Vector3,
  outView: DataView,
  offset: number,
  eccentricConeAttributes: Map<string, ParsePrimitiveAttribute>
) {
  const treeIndexOffset = offset + eccentricConeAttributes.get('treeIndex')!.offset;
  const colorOffset = offset + eccentricConeAttributes.get('color')!.offset;
  const centerAOffset = offset + eccentricConeAttributes.get('centerA')!.offset;
  const centerBOffset = offset + eccentricConeAttributes.get('centerB')!.offset;
  const radiusAOffset = offset + eccentricConeAttributes.get('radiusA')!.offset;
  const radiusBOffset = offset + eccentricConeAttributes.get('radiusB')!.offset;
  const normalOffset = offset + eccentricConeAttributes.get('normal')!.offset;

  writeFloat(treeIndex, outView, treeIndexOffset);
  writeColor(color, outView, colorOffset);
  writeVector3(centerA, outView, centerAOffset);
  writeVector3(centerB, outView, centerBOffset);
  writeFloat(radiusA, outView, radiusAOffset);
  writeFloat(radiusB, outView, radiusBOffset);
  writeVector3(normal, outView, normalOffset);
}

function outputGeneralCylinder(
  treeIndex: number,
  color: THREE.Vector4,
  centerA: THREE.Vector3,
  centerB: THREE.Vector3,
  radius: number,
  angle: number,
  planeA: THREE.Vector4,
  planeB: THREE.Vector4,
  arcAngle: number,
  localXAxis: THREE.Vector3,
  outView: DataView,
  offset: number,
  generalCylinderAttributes: Map<string, ParsePrimitiveAttribute>
) {
  const treeIndexOffset = offset + generalCylinderAttributes.get('treeIndex')!.offset;
  const colorOffset = offset + generalCylinderAttributes.get('color')!.offset;
  const centerAOffset = offset + generalCylinderAttributes.get('centerA')!.offset;
  const centerBOffset = offset + generalCylinderAttributes.get('centerB')!.offset;
  const radiusOffset = offset + generalCylinderAttributes.get('radius')!.offset;
  const angleOffset = offset + generalCylinderAttributes.get('angle')!.offset;
  const planeAOffset = offset + generalCylinderAttributes.get('planeA')!.offset;
  const planeBOffset = offset + generalCylinderAttributes.get('planeB')!.offset;
  const arcAngleOffset = offset + generalCylinderAttributes.get('arcAngle')!.offset;
  const localXAxisOffset = offset + generalCylinderAttributes.get('localXAxis')!.offset;

  writeFloat(treeIndex, outView, treeIndexOffset);
  writeColor(color, outView, colorOffset);
  writeVector3(centerA, outView, centerAOffset);
  writeVector3(centerB, outView, centerBOffset);
  writeFloat(radius, outView, radiusOffset);
  writeFloat(angle, outView, angleOffset);
  writeVector4(planeA, outView, planeAOffset);
  writeVector4(planeB, outView, planeBOffset);
  writeFloat(arcAngle, outView, arcAngleOffset);
  writeVector3(localXAxis, outView, localXAxisOffset);
}

function outputEllipsoidSegment(
  treeIndex: number,
  color: THREE.Vector4,
  center: THREE.Vector3,
  normal: THREE.Vector3,
  horizontalRadius: number,
  verticalRadius: number,
  height: number,
  outView: DataView,
  offset: number,
  ellipsoidSegmentAttributes: Map<string, ParsePrimitiveAttribute>
) {
  const treeIndexOffset = offset + ellipsoidSegmentAttributes.get('treeIndex')!.offset;
  const colorOffset = offset + ellipsoidSegmentAttributes.get('color')!.offset;
  const centerOffset = offset + ellipsoidSegmentAttributes.get('center')!.offset;
  const normalOffset = offset + ellipsoidSegmentAttributes.get('normal')!.offset;
  const horizontalRadiusOffset = offset + ellipsoidSegmentAttributes.get('horizontalRadius')!.offset;
  const verticalRadiusOffset = offset + ellipsoidSegmentAttributes.get('verticalRadius')!.offset;
  const heightOffset = offset + ellipsoidSegmentAttributes.get('height')!.offset;

  writeFloat(treeIndex, outView, treeIndexOffset);
  writeColor(color, outView, colorOffset);
  writeVector3(center, outView, centerOffset);
  writeVector3(normal, outView, normalOffset);
  writeFloat(horizontalRadius, outView, horizontalRadiusOffset);
  writeFloat(verticalRadius, outView, verticalRadiusOffset);
  writeFloat(height, outView, heightOffset);
}

function outputNut(
  treeIndex: number,
  color: THREE.Vector4,
  center: THREE.Vector3,
  centerAxis: THREE.Vector3,
  height: number,
  radius: number,
  rotationAngle: number,
  outView: DataView,
  offset: number,
  nutAttributes: Map<string, ParsePrimitiveAttribute>
) {
  const treeIndexOffset = offset + nutAttributes.get('treeIndex')!.offset;
  const colorOffset = offset + nutAttributes.get('color')!.offset;
  const instanceMatrixOffset = offset + nutAttributes.get('instanceMatrix')!.offset;

  const diameter = 2 * radius;
  const translationMatrix = createTranslation(center);
  const firstRotation = createRotationAxisAngle(new THREE.Vector3(0, 0, 1), rotationAngle);
  const secondRotation = createRotationBetweenZ(centerAxis);
  const scaleMatrix = createScale(new THREE.Vector3(diameter, diameter, height));
  const instanceMatrix = translationMatrix
    .clone()
    .multiply(secondRotation)
    .multiply(firstRotation)
    .multiply(scaleMatrix);

  writeFloat(treeIndex, outView, treeIndexOffset);
  writeColor(color, outView, colorOffset);
  writeMatrix4(instanceMatrix, outView, instanceMatrixOffset);
}

function outputSphericalSegment(
  treeIndex: number,
  color: THREE.Vector4,
  center: THREE.Vector3,
  normal: THREE.Vector3,
  radius: number,
  height: number,
  outView: DataView,
  offset: number,
  sphericalSegmentAttributes: Map<string, ParsePrimitiveAttribute>
) {
  const treeIndexOffset = offset + sphericalSegmentAttributes.get('treeIndex')!.offset;
  const colorOffset = offset + sphericalSegmentAttributes.get('color')!.offset;
  const centerOffset = offset + sphericalSegmentAttributes.get('center')!.offset;
  const normalOffset = offset + sphericalSegmentAttributes.get('normal')!.offset;
  const radiusOffset = offset + sphericalSegmentAttributes.get('radius')!.offset;
  const heightOffset = offset + sphericalSegmentAttributes.get('height')!.offset;

  writeFloat(treeIndex, outView, treeIndexOffset);
  writeColor(color, outView, colorOffset);
  writeVector3(center, outView, centerOffset);
  writeVector3(normal, outView, normalOffset);
  writeFloat(radius, outView, radiusOffset);
  writeFloat(height, outView, heightOffset);
}

function outputTorusSegment(
  treeIndex: number,
  color: THREE.Vector4,
  diagonal: number,
  center: THREE.Vector3,
  normal: THREE.Vector3,
  radius: number,
  tubeRadius: number,
  rotationAngle: number,
  arcAngle: number,
  outView: DataView,
  offset: number,
  torusSegmentAttributes: Map<string, ParsePrimitiveAttribute>
) {
  const treeIndexOffset = offset + torusSegmentAttributes.get('treeIndex')!.offset;
  const colorOffset = offset + torusSegmentAttributes.get('color')!.offset;
  const sizeOffset = offset + torusSegmentAttributes.get('size')!.offset;
  const radiusOffset = offset + torusSegmentAttributes.get('radius')!.offset;
  const tubeRadiusOffset = offset + torusSegmentAttributes.get('tubeRadius')!.offset;
  const arcAngleOffset = offset + torusSegmentAttributes.get('arcAngle')!.offset;
  const instanceMatrixOffset = offset + torusSegmentAttributes.get('instanceMatrix')!.offset;

  const translationMatrix = createTranslation(center);
  const firstRotation = createRotationAxisAngle(new THREE.Vector3(0, 0, 1), rotationAngle);
  const secondRotation = createRotationBetweenZ(normal);

  const instanceMatrix = translationMatrix.clone().multiply(secondRotation).multiply(firstRotation);

  writeFloat(treeIndex, outView, treeIndexOffset);
  writeColor(color, outView, colorOffset);
  writeFloat(diagonal, outView, sizeOffset);
  writeFloat(radius, outView, radiusOffset);
  writeFloat(tubeRadius, outView, tubeRadiusOffset);
  writeFloat(arcAngle, outView, arcAngleOffset);
  writeMatrix4(instanceMatrix, outView, instanceMatrixOffset);
}

function outputQuad(
  treeIndex: number,
  color: THREE.Vector4,
  vertices: THREE.Vector3[],
  outView: DataView,
  offset: number,
  quadAttributes: Map<string, ParsePrimitiveAttribute>
) {
  const treeIndexOffset = offset + quadAttributes.get('treeIndex')!.offset;
  const colorOffset = offset + quadAttributes.get('color')!.offset;
  const instanceMatrixOffset = offset + quadAttributes.get('instanceMatrix')!.offset;

  let side1 = vertices[3].clone().sub(vertices[1]);
  let side2 = vertices[3].clone().sub(vertices[2]);

  const scale = createScale(new THREE.Vector3(side2.length(), side1.length(), 1.0));
  const normal = side2.clone().cross(side1).normalize();
  side1 = side1.normalize();
  side2 = side2.normalize();

  const basis = new THREE.Matrix4().set(
    side2.x,
    side1.x,
    normal.x,
    0.0,
    side2.y,
    side1.y,
    normal.y,
    0.0,
    side2.z,
    side1.z,
    normal.z,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0
  );

  const center = vertices[1].clone().add(vertices[2]).multiplyScalar(0.5);
  const translation = createTranslation(center);
  const instanceMatrix = translation.clone().multiply(basis).multiply(scale);

  writeFloat(treeIndex, outView, treeIndexOffset);
  writeColor(color, outView, colorOffset);

  writeMatrix4(instanceMatrix, outView, instanceMatrixOffset);
}

function outputTrapezium(
  treeIndex: number,
  color: THREE.Vector4,
  vertices: THREE.Vector3[],
  outView: DataView,
  offset: number,
  trapeziumAttributes: Map<string, ParsePrimitiveAttribute>
) {
  const treeIndexOffset = offset + trapeziumAttributes.get('treeIndex')!.offset;
  const colorOffset = offset + trapeziumAttributes.get('color')!.offset;
  const vertexOffsets = [
    offset + trapeziumAttributes.get('vertex1')!.offset,
    offset + trapeziumAttributes.get('vertex2')!.offset,
    offset + trapeziumAttributes.get('vertex3')!.offset,
    offset + trapeziumAttributes.get('vertex4')!.offset
  ];

  writeFloat(treeIndex, outView, treeIndexOffset);
  writeColor(color, outView, colorOffset);

  for (const i of [0, 1, 2, 3]) {
    writeVector3(vertices[i], outView, vertexOffsets[i]);
  }
}

/*
 * Math utilities
 */

function intersect(
  rayDir: THREE.Vector3,
  rayPoint: THREE.Vector3,
  planeNormal: THREE.Vector3,
  planePoint: THREE.Vector3
): THREE.Vector3 {
  const diff = rayPoint.clone().sub(planePoint);
  const prod1 = diff.dot(planeNormal);
  const prod2 = rayDir.dot(planeNormal);
  const prod3 = prod1 / prod2;
  return rayPoint.clone().sub(rayDir.clone().multiplyScalar(prod3));
}

function normalizeRadians(angle: number): number {
  while (angle < -Math.PI) {
    angle += 2 * Math.PI;
  }

  while (angle > Math.PI) {
    angle -= 2 * Math.PI;
  }

  return angle;
}

function angleBetweenVectors(v1: THREE.Vector3, v2: THREE.Vector3, up: THREE.Vector3) {
  const angle = v1.angleTo(v2);
  const right = v1.cross(up);
  const moreThanPi = right.dot(v2) < 0;

  if (moreThanPi) {
    return 2 * Math.PI - angle;
  } else {
    return angle;
  }
}

/**
 * Functions for transforming incoming primitive buffers into GPU-usable buffers
 * Returns number of bytes written + original offset = the offset for next write to the buffer
 */

export function transformBoxes(
  inputBuffer: Uint8Array,
  outArray: Uint8Array,
  originalOutputOffset: number,
  boxAttributes: Map<string, ParsePrimitiveAttribute>
): number {
  const inputStructSize = boxInputStructSize;
  const outputStructSize = boxOutputStructSize;

  let currentInputOffset = 0;
  let currentOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, inputStructSize);
    const outView = new DataView(outArray.buffer, originalOutputOffset + currentOutputOffset, outputStructSize);

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const normal = getVector3(inView, 24);
    const delta = getVector3(inView, 36);
    const rotationAngle = inView.getFloat32(48, true);

    const translationMatrix = createTranslation(center);
    const firstRotation = createRotationAroundZ(rotationAngle);
    const secondRotation = createRotationBetweenZ(normal);
    const scaleMatrix = createScale(delta);

    const instanceMatrix = translationMatrix
      .clone()
      .multiply(firstRotation)
      .multiply(secondRotation)
      .multiply(scaleMatrix);

    outputBox3(treeIndex, color, instanceMatrix, outView, 0, boxAttributes);

    currentInputOffset += inputStructSize;
    currentOutputOffset += outputStructSize;
  }

  return currentOutputOffset;
}

export function transformCircles(
  inputBuffer: Uint8Array,
  outArray: Uint8Array,
  originalOutputOffset: number,
  circleAttributes: Map<string, ParsePrimitiveAttribute>
): number {
  let currentInputOffset = 0;
  let currentOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, circleInputStructSize);
    const outView = new DataView(outArray.buffer, originalOutputOffset + currentOutputOffset, circleOutputStructSize);

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const normal = getVector3(inView, 24);
    const radius = inView.getFloat32(36, true);

    outputCircle(treeIndex, color, center, normal, radius, outView, 0, circleAttributes);

    currentInputOffset += circleInputStructSize;
    currentOutputOffset += circleOutputStructSize;
  }

  return currentOutputOffset;
}

export function transformClosedCones(
  inputBuffer: Uint8Array,
  outConesArray: Uint8Array,
  outCirclesArray: Uint8Array,
  originalConesOutputOffset: number,
  originalCirclesOutputOffset: number,
  coneAttributes: Map<string, ParsePrimitiveAttribute>,
  circleAttributes: Map<string, ParsePrimitiveAttribute>
): [number, number] {
  let currentInputOffset = 0;
  let currentConesOutputOffset = 0;
  let currentCirclesOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, closedConeInputStructSize);
    const outConesView = new DataView(
      outConesArray.buffer,
      originalConesOutputOffset + currentConesOutputOffset,
      coneOutputStructSize
    );
    const outCirclesView = new DataView(
      outCirclesArray.buffer,
      originalCirclesOutputOffset + currentCirclesOutputOffset,
      2 * circleOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const axis = getVector3(inView, 24);
    const height = inView.getFloat32(36, true);
    const radiusA = inView.getFloat32(40, true);
    const radiusB = inView.getFloat32(44, true);

    const centerA = center.clone().addScaledVector(axis, height / 2);
    const centerB = center.clone().addScaledVector(axis, -height / 2);

    const normal = centerA.clone().sub(centerB).normalize();

    const rotation = createRotationBetweenZ(normal);
    const localXAxis = new THREE.Vector3(1, 0, 0).applyMatrix4(rotation);

    outputCone(
      treeIndex,
      color,
      centerA,
      centerB,
      radiusA,
      radiusB,
      0,
      2 * Math.PI,
      localXAxis,
      outConesView,
      0,
      coneAttributes
    );

    outputCircle(treeIndex, color, centerA, axis, radiusA, outCirclesView, 0, circleAttributes);
    outputCircle(
      treeIndex,
      color,
      centerB,
      axis.clone().negate(),
      radiusB,
      outCirclesView,
      circleOutputStructSize,
      circleAttributes
    );

    currentInputOffset += closedConeInputStructSize;
    currentConesOutputOffset += coneOutputStructSize;
    currentCirclesOutputOffset += 2 * circleOutputStructSize;
  }

  return [currentConesOutputOffset, currentCirclesOutputOffset];
}

export function transformOpenCones(
  inputBuffer: Uint8Array,
  outConesArray: Uint8Array,
  originalConesOutputOffset: number,
  coneAttributes: Map<string, ParsePrimitiveAttribute>
): number {
  let currentInputOffset = 0;
  let currentConesOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, openConeInputStructSize);
    const outConesView = new DataView(
      outConesArray.buffer,
      originalConesOutputOffset + currentConesOutputOffset,
      coneOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);

    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const axis = getVector3(inView, 24);

    const height = inView.getFloat32(36, true);
    const radiusA = inView.getFloat32(40, true);
    const radiusB = inView.getFloat32(44, true);

    const centerA = center.clone().addScaledVector(axis, height / 2);
    const centerB = center.clone().addScaledVector(axis, -height / 2);

    const normal = centerA.clone().sub(centerB).normalize();

    const rotation = createRotationBetweenZ(normal);
    const localXAxis = new THREE.Vector3(1, 0, 0).applyMatrix4(rotation);

    outputCone(
      treeIndex,
      color,
      centerA,
      centerB,
      radiusA,
      radiusB,
      0,
      2 * Math.PI,
      localXAxis,
      outConesView,
      0,
      coneAttributes
    );

    currentInputOffset += openConeInputStructSize;
    currentConesOutputOffset += coneOutputStructSize;
  }

  return currentConesOutputOffset;
}

export function transformClosedEccentricCones(
  inputBuffer: Uint8Array,
  outEccentricConesArray: Uint8Array,
  outCirclesArray: Uint8Array,
  originalEccentricConesOutputOffset: number,
  originalCirclesOutputOffset: number,
  eccentricConeAttributes: Map<string, ParsePrimitiveAttribute>,
  circleAttributes: Map<string, ParsePrimitiveAttribute>
): [number, number] {
  let currentInputOffset = 0;
  let currentEccentricConesOutputOffset = 0;
  let currentCirclesOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, closedEccentricConeInputStructSize);
    const outEccentricConesView = new DataView(
      outEccentricConesArray.buffer,
      originalEccentricConesOutputOffset + currentEccentricConesOutputOffset,
      eccentricConeOutputStructSize
    );
    const outCirclesView = new DataView(
      outCirclesArray.buffer,
      originalCirclesOutputOffset + currentCirclesOutputOffset,
      2 * circleOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const axis = getVector3(inView, 24);
    const height = inView.getFloat32(36, true);
    const radiusA = inView.getFloat32(40, true);
    const radiusB = inView.getFloat32(44, true);
    const capNormal = getVector3(inView, 48);

    const centerA = center.clone().addScaledVector(axis, height / 2);
    const centerB = center.clone().addScaledVector(axis, -height / 2);

    const dotProduct = capNormal.dot(centerA.clone().sub(centerB));

    if (dotProduct < 0) {
      capNormal.negate();
    }

    outputEccentricCone(
      treeIndex,
      color,
      centerA,
      centerB,
      radiusA,
      radiusB,
      capNormal,
      outEccentricConesView,
      0,
      eccentricConeAttributes
    );

    outputCircle(treeIndex, color, centerA, capNormal, radiusA, outCirclesView, 0, circleAttributes);
    outputCircle(
      treeIndex,
      color,
      centerB,
      capNormal,
      radiusB,
      outCirclesView,
      circleOutputStructSize,
      circleAttributes
    );

    currentInputOffset += closedEccentricConeInputStructSize;
    currentEccentricConesOutputOffset += eccentricConeOutputStructSize;
    currentCirclesOutputOffset += 2 * circleOutputStructSize;
  }

  return [currentEccentricConesOutputOffset, currentCirclesOutputOffset];
}

export function transformOpenEccentricCones(
  inputBuffer: Uint8Array,
  outEccentricConesArray: Uint8Array,
  originalEccentricConesOutputOffset: number,
  eccentricConeAttributes: Map<string, ParsePrimitiveAttribute>
): number {
  let currentInputOffset = 0;
  let currentEccentricConesOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, openEccentricConeInputStructSize);
    const outEccentricConesView = new DataView(
      outEccentricConesArray.buffer,
      originalEccentricConesOutputOffset + currentEccentricConesOutputOffset,
      eccentricConeOutputStructSize
    );
    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const axis = getVector3(inView, 24);
    const height = inView.getFloat32(36, true);
    const radiusA = inView.getFloat32(40, true);
    const radiusB = inView.getFloat32(44, true);
    const capNormal = getVector3(inView, 48);

    const centerA = center.clone().addScaledVector(axis, height / 2);
    const centerB = center.clone().addScaledVector(axis, -height / 2);

    const dotProduct = capNormal.dot(centerA.clone().sub(centerB));

    if (dotProduct < 0) {
      capNormal.negate();
    }

    outputEccentricCone(
      treeIndex,
      color,
      centerA,
      centerB,
      radiusA,
      radiusB,
      capNormal,
      outEccentricConesView,
      0,
      eccentricConeAttributes
    );

    currentInputOffset += openEccentricConeInputStructSize;
    currentEccentricConesOutputOffset += eccentricConeOutputStructSize;
  }

  return currentEccentricConesOutputOffset;
}

export function transformOpenGeneralCones(
  inputBuffer: Uint8Array,
  outConesArray: Uint8Array,
  originalConesOutputOffset: number,
  coneAttributes: Map<string, ParsePrimitiveAttribute>
): number {
  let currentInputOffset = 0;
  let currentConesOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, openGeneralConeInputStructSize);
    const outConesView = new DataView(
      outConesArray.buffer,
      originalConesOutputOffset + currentConesOutputOffset,
      coneOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const axis = getVector3(inView, 24);
    const height = inView.getFloat32(36, true);
    const radiusA = inView.getFloat32(40, true);
    const radiusB = inView.getFloat32(44, true);
    const rotationAngle = inView.getFloat32(48, true);
    const arcAngle = inView.getFloat32(52, true);
    // const slopeA = inView.getFloat32(56, true);
    // const slopeB = inView.getFloat32(60, true);
    // const zAngleA = inView.getFloat32(64, true);
    // const zAngleB = inView.getFloat32(68, true);

    const centerA = center.clone().addScaledVector(axis, height / 2);
    const centerB = center.clone().addScaledVector(axis, -height / 2);

    const normal = centerA.clone().sub(centerB).normalize();

    const rotation = createRotationBetweenZ(normal);
    const localXAxis = new THREE.Vector3(1, 0, 0).applyMatrix4(rotation);

    outputCone(
      treeIndex,
      color,
      centerA,
      centerB,
      radiusA,
      radiusB,
      rotationAngle,
      arcAngle,
      localXAxis,
      outConesView,
      0,
      coneAttributes
    );

    currentInputOffset += openGeneralConeInputStructSize;
    currentConesOutputOffset += coneOutputStructSize;
  }

  return currentConesOutputOffset;
}

export function transformClosedGeneralCones(
  inputBuffer: Uint8Array,
  outConesArray: Uint8Array,
  outRingsArray: Uint8Array,
  originalConesOutputOffset: number,
  originalRingsOutputOffset: number,
  coneAttributes: Map<string, ParsePrimitiveAttribute>,
  ringAttributes: Map<string, ParsePrimitiveAttribute>
): [number, number] {
  let currentInputOffset = 0;
  let currentConesOutputOffset = 0;
  let currentRingsOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, closedGeneralConeInputStructSize);
    const outConesView = new DataView(
      outConesArray.buffer,
      originalConesOutputOffset + currentConesOutputOffset,
      coneOutputStructSize
    );
    const outRingsView = new DataView(
      outRingsArray.buffer,
      originalRingsOutputOffset + currentRingsOutputOffset,
      2 * generalRingOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const axis = getVector3(inView, 24);
    const height = inView.getFloat32(36, true);
    const radiusA = inView.getFloat32(40, true);
    const radiusB = inView.getFloat32(44, true);
    const rotationAngle = inView.getFloat32(48, true);
    const arcAngle = inView.getFloat32(52, true);
    // const slopeA = inView.getFloat32(56, true);
    // const slopeB = inView.getFloat32(60, true);
    // const zAngleA = inView.getFloat32(64, true);
    // const zAngleB = inView.getFloat32(68, true);

    const centerA = center.clone().addScaledVector(axis, height / 2);
    const centerB = center.clone().addScaledVector(axis, -height / 2);

    const normal = centerA.clone().sub(centerB).normalize();

    const rotation = createRotationBetweenZ(normal);
    const localXAxis = new THREE.Vector3(1, 0, 0).applyMatrix4(rotation);

    const ringTransformMatrixA = createGeneralRingMatrix(centerA, normal, localXAxis, radiusA, radiusA);
    const ringTransformMatrixB = createGeneralRingMatrix(centerB, normal, localXAxis, radiusB, radiusB);

    outputCone(
      treeIndex,
      color,
      centerA,
      centerB,
      radiusA,
      radiusB,
      rotationAngle,
      arcAngle,
      localXAxis,
      outConesView,
      0,
      coneAttributes
    );

    outputRing(
      treeIndex,
      color,
      normal,
      1.0,
      rotationAngle,
      arcAngle,
      ringTransformMatrixA,
      outRingsView,
      0,
      ringAttributes
    );
    outputRing(
      treeIndex,
      color,
      normal,
      1.0,
      rotationAngle,
      arcAngle,
      ringTransformMatrixB,
      outRingsView,
      generalRingOutputStructSize,
      ringAttributes
    );

    currentInputOffset += closedGeneralConeInputStructSize;
    currentConesOutputOffset += coneOutputStructSize;
    currentRingsOutputOffset += 2 * generalRingOutputStructSize;
  }

  return [currentConesOutputOffset, currentRingsOutputOffset];
}

export function transformSolidOpenGeneralCones(
  inputBuffer: Uint8Array,
  outConesArray: Uint8Array,
  outRingsArray: Uint8Array,
  originalConesOutputOffset: number,
  originalRingsOutputOffset: number,
  coneAttributes: Map<string, ParsePrimitiveAttribute>,
  ringAttributes: Map<string, ParsePrimitiveAttribute>
): [number, number] {
  let currentInputOffset = 0;
  let currentConesOutputOffset = 0;
  let currentRingsOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, solidOpenGeneralConeInputStructSize);
    const outConesView = new DataView(
      outConesArray.buffer,
      originalConesOutputOffset + currentConesOutputOffset,
      2 * coneOutputStructSize
    );
    const outRingsView = new DataView(
      outRingsArray.buffer,
      originalRingsOutputOffset + currentRingsOutputOffset,
      2 * generalRingOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const axis = getVector3(inView, 24);
    const height = inView.getFloat32(36, true);
    const radiusA = inView.getFloat32(40, true);
    const radiusB = inView.getFloat32(44, true);
    const thickness = inView.getFloat32(48, true);
    const rotationAngle = inView.getFloat32(52, true);
    const arcAngle = inView.getFloat32(56, true);
    // const slopeA = inView.getFloat32(60, true);
    // const slopeB = inView.getFloat32(64, true);
    // const zAngleA = inView.getFloat32(68, true);
    // const zAngleB = inView.getFloat32(72, true);

    const centerA = center.clone().addScaledVector(axis, height / 2);
    const centerB = center.clone().addScaledVector(axis, -height / 2);

    const normal = centerA.clone().sub(centerB).normalize();

    const rotation = createRotationBetweenZ(normal);
    const localXAxis = new THREE.Vector3(1, 0, 0).applyMatrix4(rotation);

    outputCone(
      treeIndex,
      color,
      centerA,
      centerB,
      radiusA,
      radiusB,
      rotationAngle,
      arcAngle,
      localXAxis,
      outConesView,
      0,
      coneAttributes
    );

    outputCone(
      treeIndex,
      color,
      centerA,
      centerB,
      radiusA - thickness,
      radiusB - thickness,
      rotationAngle,
      arcAngle,
      localXAxis,
      outConesView,
      coneOutputStructSize,
      coneAttributes
    );

    const ringTransformMatrixA = createGeneralRingMatrix(centerA, normal, localXAxis, radiusA, radiusA);
    const ringTransformMatrixB = createGeneralRingMatrix(centerB, normal, localXAxis, radiusB, radiusB);

    outputRing(
      treeIndex,
      color,
      normal,
      thickness / radiusA,
      rotationAngle,
      arcAngle,
      ringTransformMatrixA,
      outRingsView,
      0,
      ringAttributes
    );
    outputRing(
      treeIndex,
      color,
      normal,
      thickness / radiusB,
      rotationAngle,
      arcAngle,
      ringTransformMatrixB,
      outRingsView,
      generalRingOutputStructSize,
      ringAttributes
    );

    currentInputOffset += solidOpenGeneralConeInputStructSize;
    currentConesOutputOffset += 2 * coneOutputStructSize;
    currentRingsOutputOffset += 2 * generalRingOutputStructSize;
  }

  return [currentConesOutputOffset, currentRingsOutputOffset];
}

export function transformSolidClosedGeneralCones(
  inputBuffer: Uint8Array,
  outConesArray: Uint8Array,
  outRingsArray: Uint8Array,
  outTrapeziumsArray: Uint8Array,
  originalConesOutputOffset: number,
  originalRingsOutputOffset: number,
  originalTrapeziumsOutputOffset: number,
  coneAttributes: Map<string, ParsePrimitiveAttribute>,
  ringAttributes: Map<string, ParsePrimitiveAttribute>,
  trapeziumAttributes: Map<string, ParsePrimitiveAttribute>
): [number, number, number] {
  let currentInputOffset = 0;
  let currentConesOutputOffset = 0;
  let currentRingsOutputOffset = 0;
  let currentTrapeziumsOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, solidClosedGeneralConeInputStructSize);
    const outConesView = new DataView(
      outConesArray.buffer,
      originalConesOutputOffset + currentConesOutputOffset,
      2 * coneOutputStructSize
    );
    const outRingsView = new DataView(
      outRingsArray.buffer,
      originalRingsOutputOffset + currentRingsOutputOffset,
      2 * generalRingOutputStructSize
    );
    const outTrapeziumsView = new DataView(
      outTrapeziumsArray.buffer,
      originalTrapeziumsOutputOffset + currentTrapeziumsOutputOffset,
      2 * trapeziumOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const axis = getVector3(inView, 24);
    const height = inView.getFloat32(36, true);
    const radiusA = inView.getFloat32(40, true);
    const radiusB = inView.getFloat32(44, true);
    const thickness = inView.getFloat32(48, true);
    const rotationAngle = inView.getFloat32(52, true);
    const arcAngle = inView.getFloat32(56, true);
    // const slopeA = inView.getFloat32(60, true);
    // const slopeB = inView.getFloat32(64, true);
    // const zAngleA = inView.getFloat32(68, true);
    // const zAngleB = inView.getFloat32(72, true);

    const centerA = center.clone().addScaledVector(axis, height / 2);
    const centerB = center.clone().addScaledVector(axis, -height / 2);

    const normal = centerA.clone().sub(centerB).normalize();

    const rotation = createRotationBetweenZ(normal);
    const localXAxis = new THREE.Vector3(1, 0, 0).applyMatrix4(rotation);

    outputCone(
      treeIndex,
      color,
      centerA,
      centerB,
      radiusA,
      radiusB,
      rotationAngle,
      arcAngle,
      localXAxis,
      outConesView,
      0,
      coneAttributes
    );

    outputCone(
      treeIndex,
      color,
      centerA,
      centerB,
      radiusA - thickness,
      radiusB - thickness,
      rotationAngle,
      arcAngle,
      localXAxis,
      outConesView,
      coneOutputStructSize,
      coneAttributes
    );

    const ringTransformMatrixA = createGeneralRingMatrix(centerA, normal, localXAxis, radiusA, radiusA);
    const ringTransformMatrixB = createGeneralRingMatrix(centerB, normal, localXAxis, radiusB, radiusB);

    outputRing(
      treeIndex,
      color,
      normal,
      thickness / radiusA,
      rotationAngle,
      arcAngle,
      ringTransformMatrixA,
      outRingsView,
      0,
      ringAttributes
    );
    outputRing(
      treeIndex,
      color,
      normal.clone().negate(),
      thickness / radiusB,
      rotationAngle,
      arcAngle,
      ringTransformMatrixB,
      outRingsView,
      generalRingOutputStructSize,
      ringAttributes
    );

    let trapeziumViewOffset = 0;

    for (const second of [false, true]) {
      const finalAngle = rotationAngle + (second ? arcAngle : 0);
      const rotation = createRotationBetweenZ(normal);
      let point = new THREE.Vector3(Math.cos(finalAngle), Math.sin(finalAngle), 0);
      point = point.applyMatrix4(rotation).normalize();

      const vertices = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
      let vertexIndex = 0;

      for (const isA of [false, true]) {
        const aForReal = second ? isA : !isA;
        const radius = aForReal ? radiusA : radiusB;
        const center = aForReal ? centerA : centerB;
        for (const offset of [0.0, -thickness]) {
          vertices[vertexIndex] = center.clone().addScaledVector(point, radius + offset);
          vertexIndex += 1;
        }
      }

      outputTrapezium(treeIndex, color, vertices, outTrapeziumsView, trapeziumViewOffset, trapeziumAttributes);

      trapeziumViewOffset += 4 + 4 + 4 * 3 * 4;
    }

    currentInputOffset += solidClosedGeneralConeInputStructSize;
    currentConesOutputOffset += 2 * coneOutputStructSize;
    currentRingsOutputOffset += 2 * generalRingOutputStructSize;
    currentTrapeziumsOutputOffset += 2 * trapeziumOutputStructSize;
  }

  return [currentConesOutputOffset, currentRingsOutputOffset, currentTrapeziumsOutputOffset];
}

export function transformClosedCylinders(
  inputBuffer: Uint8Array,
  outConesArray: Uint8Array,
  outCirclesArray: Uint8Array,
  originalConesOutputOffset: number,
  originalCirclesOutputOffset: number,
  coneAttributes: Map<string, ParsePrimitiveAttribute>,
  circleAttributes: Map<string, ParsePrimitiveAttribute>
): [number, number] {
  let currentInputOffset = 0;
  let currentConesOutputOffset = 0;
  let currentCirclesOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, closedCylinderInputStructSize);
    const outConesView = new DataView(
      outConesArray.buffer,
      originalConesOutputOffset + currentConesOutputOffset,
      coneOutputStructSize
    );
    const outCirclesView = new DataView(
      outCirclesArray.buffer,
      originalCirclesOutputOffset + currentCirclesOutputOffset,
      2 * circleOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const axis = getVector3(inView, 24);
    const height = inView.getFloat32(36, true);
    const radius = inView.getFloat32(40, true);

    const centerA = center.clone().addScaledVector(axis, height / 2);
    const centerB = center.clone().addScaledVector(axis, -height / 2);

    const normal = centerA.clone().sub(centerB).normalize();

    const rotation = createRotationBetweenZ(normal);
    const localXAxis = new THREE.Vector3(1, 0, 0).applyMatrix4(rotation);

    outputCone(
      treeIndex,
      color,
      centerA,
      centerB,
      radius,
      radius,
      0,
      2 * Math.PI,
      localXAxis,
      outConesView,
      0,
      coneAttributes
    );

    outputCircle(treeIndex, color, centerA, axis, radius, outCirclesView, 0, circleAttributes);
    outputCircle(
      treeIndex,
      color,
      centerB,
      axis.clone().negate(),
      radius,
      outCirclesView,
      circleOutputStructSize,
      circleAttributes
    );

    currentInputOffset += closedCylinderInputStructSize;
    currentConesOutputOffset += coneOutputStructSize;
    currentCirclesOutputOffset += 2 * circleOutputStructSize;
  }

  return [currentConesOutputOffset, currentCirclesOutputOffset];
}

export function transformOpenCylinders(
  inputBuffer: Uint8Array,
  outConesArray: Uint8Array,
  originalConesOutputOffset: number,
  coneAttributes: Map<string, ParsePrimitiveAttribute>
): number {
  let currentInputOffset = 0;
  let currentConesOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, openCylinderInputStructSize);
    const outConesView = new DataView(
      outConesArray.buffer,
      originalConesOutputOffset + currentConesOutputOffset,
      coneOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const axis = getVector3(inView, 24);
    const height = inView.getFloat32(36, true);
    const radius = inView.getFloat32(40, true);

    const centerA = center.clone().addScaledVector(axis, height / 2);
    const centerB = center.clone().addScaledVector(axis, -height / 2);

    const normal = centerA.clone().sub(centerB).normalize();

    const rotation = createRotationBetweenZ(normal);
    const localXAxis = new THREE.Vector3(1, 0, 0).applyMatrix4(rotation);

    outputCone(
      treeIndex,
      color,
      centerA,
      centerB,
      radius,
      radius,
      0,
      2 * Math.PI,
      localXAxis,
      outConesView,
      0,
      coneAttributes
    );

    currentInputOffset += openCylinderInputStructSize;
    currentConesOutputOffset += coneOutputStructSize;
  }

  return currentConesOutputOffset;
}

export function transformOpenGeneralCylinders(
  inputBuffer: Uint8Array,
  outCylindersArray: Uint8Array,
  originalCylindersOutputOffset: number,
  generalCylinderAttributes: Map<string, ParsePrimitiveAttribute>
): number {
  let currentInputOffset = 0;
  let currentCylindersOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, openGeneralCylinderInputStructSize);
    const outCylindersView = new DataView(
      outCylindersArray.buffer,
      originalCylindersOutputOffset + currentCylindersOutputOffset,
      generalCylinderOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const axis = getVector3(inView, 24);
    const height = inView.getFloat32(36, true);
    const radius = inView.getFloat32(40, true);
    const rotationAngle = inView.getFloat32(44, true);
    const arcAngle = inView.getFloat32(48, true);
    const slopeA = inView.getFloat32(52, true);
    const slopeB = inView.getFloat32(56, true);
    const zAngleA = inView.getFloat32(60, true);
    const zAngleB = inView.getFloat32(64, true);

    const cylinder = getGeneralCylinder(
      treeIndex,
      color,
      center,
      axis,
      height,
      radius,
      radius,
      rotationAngle,
      arcAngle,
      slopeA,
      slopeB,
      zAngleA,
      zAngleB
    );

    outputGeneralCylinder(
      cylinder.treeIndex,
      cylinder.color,
      cylinder.centerA,
      cylinder.centerB,
      cylinder.radius,
      cylinder.angle,
      cylinder.planeA,
      cylinder.planeB,
      cylinder.arcAngle,
      cylinder.localXAxis,
      outCylindersView,
      0,
      generalCylinderAttributes
    );

    currentInputOffset += openGeneralCylinderInputStructSize;
    currentCylindersOutputOffset += generalCylinderOutputStructSize;
  }

  return currentCylindersOutputOffset;
}

export function transformClosedGeneralCylinders(
  inputBuffer: Uint8Array,
  outCylindersArray: Uint8Array,
  outRingsArray: Uint8Array,
  originalCylindersOutputOffset: number,
  originalRingsOutputOffset: number,
  generalCylinderAttributes: Map<string, ParsePrimitiveAttribute>,
  generalRingAttributes: Map<string, ParsePrimitiveAttribute>
): [number, number] {
  let currentInputOffset = 0;
  let currentCylindersOutputOffset = 0;
  let currentRingsOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, closedGeneralCylinderInputStructSize);
    const outCylindersView = new DataView(
      outCylindersArray.buffer,
      originalCylindersOutputOffset + currentCylindersOutputOffset,
      generalCylinderOutputStructSize
    );
    const outRingsView = new DataView(
      outRingsArray.buffer,
      originalRingsOutputOffset + currentRingsOutputOffset,
      2 * generalRingOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const axis = getVector3(inView, 24);
    const height = inView.getFloat32(36, true);
    const radius = inView.getFloat32(40, true);
    const rotationAngle = inView.getFloat32(44, true);
    const arcAngle = inView.getFloat32(48, true);
    const slopeA = inView.getFloat32(52, true);
    const slopeB = inView.getFloat32(56, true);
    const zAngleA = inView.getFloat32(60, true);
    const zAngleB = inView.getFloat32(64, true);

    const cylinder = getGeneralCylinder(
      treeIndex,
      color,
      center,
      axis,
      height,
      radius,
      radius,
      rotationAngle,
      arcAngle,
      slopeA,
      slopeB,
      zAngleA,
      zAngleB
    );

    outputGeneralCylinder(
      cylinder.treeIndex,
      cylinder.color,
      cylinder.centerA,
      cylinder.centerB,
      cylinder.radius,
      cylinder.angle,
      cylinder.planeA,
      cylinder.planeB,
      cylinder.arcAngle,
      cylinder.localXAxis,
      outCylindersView,
      0,
      generalCylinderAttributes
    );

    outputRing(
      cylinder.capA.treeIndex,
      cylinder.capA.color,
      cylinder.capA.normal,
      cylinder.capA.thickness,
      cylinder.capA.angle,
      cylinder.capA.arcAngle,
      cylinder.capA.instanceMatrix,
      outRingsView,
      0,
      generalRingAttributes
    );

    outputRing(
      cylinder.capB.treeIndex,
      cylinder.capB.color,
      cylinder.capB.normal,
      cylinder.capB.thickness,
      cylinder.capB.angle,
      cylinder.capB.arcAngle,
      cylinder.capB.instanceMatrix,
      outRingsView,
      generalRingOutputStructSize,
      generalRingAttributes
    );

    currentInputOffset += closedGeneralCylinderInputStructSize;
    currentCylindersOutputOffset += generalCylinderOutputStructSize;
    currentRingsOutputOffset += 2 * generalRingOutputStructSize;
  }

  return [currentCylindersOutputOffset, currentRingsOutputOffset];
}

export function transformSolidOpenGeneralCylinders(
  inputBuffer: Uint8Array,
  outCylindersArray: Uint8Array,
  outRingsArray: Uint8Array,
  originalCylindersOutputOffset: number,
  originalRingsOutputOffset: number,
  generalCylinderAttributes: Map<string, ParsePrimitiveAttribute>,
  generalRingAttributes: Map<string, ParsePrimitiveAttribute>
): [number, number] {
  let currentInputOffset = 0;
  let currentCylindersOutputOffset = 0;
  let currentRingsOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, solidOpenGeneralCylinderInputStructSize);
    const outCylindersView = new DataView(
      outCylindersArray.buffer,
      originalCylindersOutputOffset + currentCylindersOutputOffset,
      2 * generalCylinderOutputStructSize
    );
    const outRingsView = new DataView(
      outRingsArray.buffer,
      originalRingsOutputOffset + currentRingsOutputOffset,
      2 * generalRingOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const axis = getVector3(inView, 24);
    const height = inView.getFloat32(36, true);
    const radius = inView.getFloat32(40, true);
    const thickness = inView.getFloat32(44, true);
    const rotationAngle = inView.getFloat32(48, true);
    const arcAngle = inView.getFloat32(52, true);
    const slopeA = inView.getFloat32(56, true);
    const slopeB = inView.getFloat32(60, true);
    const zAngleA = inView.getFloat32(64, true);
    const zAngleB = inView.getFloat32(68, true);

    const cylinder = getGeneralCylinder(
      treeIndex,
      color,
      center,
      axis,
      height,
      radius,
      thickness,
      rotationAngle,
      arcAngle,
      slopeA,
      slopeB,
      zAngleA,
      zAngleB
    );

    const innerRadius = cylinder.radius - thickness;

    outputGeneralCylinder(
      cylinder.treeIndex,
      cylinder.color,
      cylinder.centerA,
      cylinder.centerB,
      cylinder.radius,
      cylinder.angle,
      cylinder.planeA,
      cylinder.planeB,
      cylinder.arcAngle,
      cylinder.localXAxis,
      outCylindersView,
      0,
      generalCylinderAttributes
    );

    outputGeneralCylinder(
      cylinder.treeIndex,
      cylinder.color,
      cylinder.centerA,
      cylinder.centerB,
      innerRadius,
      cylinder.angle,
      cylinder.planeA,
      cylinder.planeB,
      cylinder.arcAngle,
      cylinder.localXAxis,
      outCylindersView,
      generalCylinderOutputStructSize,
      generalCylinderAttributes
    );

    outputRing(
      cylinder.capA.treeIndex,
      cylinder.capA.color,
      cylinder.capA.normal,
      cylinder.capA.thickness,
      cylinder.capA.angle,
      cylinder.capA.arcAngle,
      cylinder.capA.instanceMatrix,
      outRingsView,
      0,
      generalRingAttributes
    );

    outputRing(
      cylinder.capB.treeIndex,
      cylinder.capB.color,
      cylinder.capB.normal,
      cylinder.capB.thickness,
      cylinder.capB.angle,
      cylinder.capB.arcAngle,
      cylinder.capB.instanceMatrix,
      outRingsView,
      generalRingOutputStructSize,
      generalRingAttributes
    );

    currentInputOffset += solidOpenGeneralCylinderInputStructSize;
    currentCylindersOutputOffset += 2 * generalCylinderOutputStructSize;
    currentRingsOutputOffset += 2 * generalRingOutputStructSize;
  }

  return [currentCylindersOutputOffset, currentRingsOutputOffset];
}

export function transformSolidClosedGeneralCylinders(
  inputBuffer: Uint8Array,
  outCylindersArray: Uint8Array,
  outRingsArray: Uint8Array,
  outTrapeziumsArray: Uint8Array,
  originalCylindersOutputOffset: number,
  originalRingsOutputOffset: number,
  originalTrapeziumsOutputOffset: number,
  generalCylinderAttributes: Map<string, ParsePrimitiveAttribute>,
  generalRingAttributes: Map<string, ParsePrimitiveAttribute>,
  trapeziumAttributes: Map<string, ParsePrimitiveAttribute>
): [number, number, number] {
  let currentInputOffset = 0;
  let currentCylindersOutputOffset = 0;
  let currentRingsOutputOffset = 0;
  let currentTrapeziumsOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, solidClosedGeneralCylinderInputStructSize);
    const outCylindersView = new DataView(
      outCylindersArray.buffer,
      originalCylindersOutputOffset + currentCylindersOutputOffset,
      2 * generalCylinderOutputStructSize
    );
    const outRingsView = new DataView(
      outRingsArray.buffer,
      originalRingsOutputOffset + currentRingsOutputOffset,
      2 * generalRingOutputStructSize
    );
    const outTrapeziumsView = new DataView(
      outTrapeziumsArray.buffer,
      originalTrapeziumsOutputOffset + currentTrapeziumsOutputOffset,
      2 * trapeziumOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const axis = getVector3(inView, 24);
    const height = inView.getFloat32(36, true);
    const radius = inView.getFloat32(40, true);
    const thickness = inView.getFloat32(44, true);
    const rotationAngle = inView.getFloat32(48, true);
    const arcAngle = inView.getFloat32(52, true);
    const slopeA = inView.getFloat32(56, true);
    const slopeB = inView.getFloat32(60, true);
    const zAngleA = inView.getFloat32(64, true);
    const zAngleB = inView.getFloat32(68, true);

    const cylinder = getGeneralCylinder(
      treeIndex,
      color,
      center,
      axis,
      height,
      radius,
      thickness,
      rotationAngle,
      arcAngle,
      slopeA,
      slopeB,
      zAngleA,
      zAngleB
    );

    const innerRadius = cylinder.radius - thickness;

    outputGeneralCylinder(
      cylinder.treeIndex,
      cylinder.color,
      cylinder.centerA,
      cylinder.centerB,
      cylinder.radius,
      cylinder.angle,
      cylinder.planeA,
      cylinder.planeB,
      cylinder.arcAngle,
      cylinder.localXAxis,
      outCylindersView,
      0,
      generalCylinderAttributes
    );

    outputGeneralCylinder(
      cylinder.treeIndex,
      cylinder.color,
      cylinder.centerA,
      cylinder.centerB,
      innerRadius,
      cylinder.angle,
      cylinder.planeA,
      cylinder.planeB,
      cylinder.arcAngle,
      cylinder.localXAxis,
      outCylindersView,
      generalCylinderOutputStructSize,
      generalCylinderAttributes
    );

    outputRing(
      cylinder.capA.treeIndex,
      cylinder.capA.color,
      cylinder.capA.normal,
      cylinder.capA.thickness,
      cylinder.capA.angle,
      cylinder.capA.arcAngle,
      cylinder.capA.instanceMatrix,
      outRingsView,
      0,
      generalRingAttributes
    );

    outputRing(
      cylinder.capB.treeIndex,
      cylinder.capB.color,
      cylinder.capB.normal,
      cylinder.capB.thickness,
      cylinder.capB.angle,
      cylinder.capB.arcAngle,
      cylinder.capB.instanceMatrix,
      outRingsView,
      generalRingOutputStructSize,
      generalRingAttributes
    );

    let trapeziumViewOffset = 0;

    const capA = cylinder.capA;
    const capB = cylinder.capB;
    const extA = cylinder.extA;
    const extB = cylinder.extB;

    for (const second of [false, true]) {
      const finalAngle = rotationAngle + (second ? arcAngle : 0);
      const radii = second ? [radius - thickness, radius] : [radius, radius - thickness];
      const rotation = createRotationBetweenZ(axis);
      let point = new THREE.Vector3(Math.cos(finalAngle), Math.sin(finalAngle), 0);
      point = point.applyMatrix4(rotation).normalize();

      const vertices = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
      let vertexIndex = 0;

      for (const radius of radii) {
        const lineStart = extB.clone().sub(axis).addScaledVector(point, radius);
        const lineEnd = extA.clone().add(axis).addScaledVector(point, radius);
        const lineVector = lineEnd.clone().sub(lineStart);
        vertices[vertexIndex] = intersect(lineVector, lineStart, capB.normal, capB.center);
        vertices[vertexIndex + 1] = intersect(lineVector, lineStart, capA.normal, capA.center);
        vertexIndex += 2;
      }

      outputTrapezium(treeIndex, color, vertices, outTrapeziumsView, trapeziumViewOffset, trapeziumAttributes);

      trapeziumViewOffset += 4 + 4 + 4 * 3 * 4;
    }

    currentInputOffset += solidClosedGeneralCylinderInputStructSize;
    currentCylindersOutputOffset += 2 * generalCylinderOutputStructSize;
    currentRingsOutputOffset += 2 * generalRingOutputStructSize;
    currentTrapeziumsOutputOffset += 2 * trapeziumOutputStructSize;
  }

  return [currentCylindersOutputOffset, currentRingsOutputOffset, currentTrapeziumsOutputOffset];
}

export function transformClosedEllipsoidSegments(
  inputBuffer: Uint8Array,
  outEllipsoidSegmentsArray: Uint8Array,
  outCirclesArray: Uint8Array,
  originalEllipsoidSegmentsOutputOffset: number,
  originalCircleOutputOffset: number,
  ellipsoidSegmentAttributes: Map<string, ParsePrimitiveAttribute>,
  circleAttributes: Map<string, ParsePrimitiveAttribute>
): [number, number] {
  let currentInputOffset = 0;
  let currentEllipsoidSegmentsOutputOffset = 0;
  let currentCirclesOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, closedEllipsoidSegmentInputStructSize);
    const outEllipsoidSegmentsView = new DataView(
      outEllipsoidSegmentsArray.buffer,
      originalEllipsoidSegmentsOutputOffset + currentEllipsoidSegmentsOutputOffset,
      ellipsoidSegmentOutputStructSize
    );
    const outCirclesView = new DataView(
      outCirclesArray.buffer,
      originalCircleOutputOffset + currentCirclesOutputOffset,
      circleOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const normal = getVector3(inView, 24);
    const height = inView.getFloat32(36, true);
    const horizontalRadius = inView.getFloat32(40, true);
    const verticalRadius = inView.getFloat32(44, true);

    outputEllipsoidSegment(
      treeIndex,
      color,
      center,
      normal,
      horizontalRadius,
      verticalRadius,
      height,
      outEllipsoidSegmentsView,
      0,
      ellipsoidSegmentAttributes
    );

    const length = verticalRadius - height;
    const circleRadius =
      (Math.sqrt(verticalRadius * verticalRadius - length * length) * horizontalRadius) / verticalRadius;
    const circleCenter = center.addScaledVector(normal.normalize(), length);

    outputCircle(treeIndex, color, circleCenter, normal, circleRadius, outCirclesView, 0, circleAttributes);

    currentInputOffset += closedEllipsoidSegmentInputStructSize;
    currentEllipsoidSegmentsOutputOffset += ellipsoidSegmentOutputStructSize;
    currentCirclesOutputOffset += circleOutputStructSize;
  }

  return [currentEllipsoidSegmentsOutputOffset, currentCirclesOutputOffset];
}

export function transformEllipsoids(
  inputBuffer: Uint8Array,
  outEllipsoidSegmentsArray: Uint8Array,
  originalEllipsoidSegmentsOutputOffset: number,
  ellipsoidSegmentAttributes: Map<string, ParsePrimitiveAttribute>
): number {
  let currentInputOffset = 0;
  let currentEllipsoidSegmentsOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, ellipsoidInputStructSize);
    const outEllipsoidSegmentsView = new DataView(
      outEllipsoidSegmentsArray.buffer,
      originalEllipsoidSegmentsOutputOffset + currentEllipsoidSegmentsOutputOffset,
      ellipsoidSegmentOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const normal = getVector3(inView, 24);
    const horizontalRadius = inView.getFloat32(36, true);
    const verticalRadius = inView.getFloat32(40, true);

    outputEllipsoidSegment(
      treeIndex,
      color,
      center,
      normal,
      horizontalRadius,
      verticalRadius,
      verticalRadius * 2,
      outEllipsoidSegmentsView,
      0,
      ellipsoidSegmentAttributes
    );

    currentInputOffset += ellipsoidInputStructSize;
    currentEllipsoidSegmentsOutputOffset += ellipsoidSegmentOutputStructSize;
  }

  return currentEllipsoidSegmentsOutputOffset;
}

export function transformOpenEllipsoidSegments(
  inputBuffer: Uint8Array,
  outEllipsoidSegmentsArray: Uint8Array,
  originalEllipsoidSegmentsOutputOffset: number,
  ellipsoidSegmentAttributes: Map<string, ParsePrimitiveAttribute>
): number {
  let currentInputOffset = 0;
  let currentEllipsoidSegmentsOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, openEllipsoidSegmentInputStructSize);
    const outEllipsoidSegmentsView = new DataView(
      outEllipsoidSegmentsArray.buffer,
      originalEllipsoidSegmentsOutputOffset + currentEllipsoidSegmentsOutputOffset,
      ellipsoidSegmentOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const normal = getVector3(inView, 24);
    const height = inView.getFloat32(36, true);
    const horizontalRadius = inView.getFloat32(40, true);
    const verticalRadius = inView.getFloat32(44, true);

    outputEllipsoidSegment(
      treeIndex,
      color,
      center,
      normal,
      horizontalRadius,
      verticalRadius,
      height,
      outEllipsoidSegmentsView,
      0,
      ellipsoidSegmentAttributes
    );

    currentInputOffset += openEllipsoidSegmentInputStructSize;
    currentEllipsoidSegmentsOutputOffset += ellipsoidSegmentOutputStructSize;
  }

  return currentEllipsoidSegmentsOutputOffset;
}

export function transformNuts(
  inputBuffer: Uint8Array,
  outNutsArray: Uint8Array,
  originalNutsOutputOffset: number,
  nutAttributes: Map<string, ParsePrimitiveAttribute>
): number {
  let currentInputOffset = 0;
  let currentNutsOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, nutInputStructSize);
    const outNutsView = new DataView(
      outNutsArray.buffer,
      originalNutsOutputOffset + currentNutsOutputOffset,
      nutOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const centerAxis = getVector3(inView, 24);
    const height = inView.getFloat32(36, true);
    const radius = inView.getFloat32(40, true);
    const rotationAngle = inView.getFloat32(44, true);

    outputNut(treeIndex, color, center, centerAxis, height, radius, rotationAngle, outNutsView, 0, nutAttributes);

    currentInputOffset += nutInputStructSize;
    currentNutsOutputOffset += nutOutputStructSize;
  }

  return currentNutsOutputOffset;
}

export function transformClosedExtrudedRingSegments(
  inputBuffer: Uint8Array,
  outGeneralRingsArray: Uint8Array,
  outConesArray: Uint8Array,
  outQuadsArray: Uint8Array,
  originalGeneralRingsOutputOffset: number,
  originalConesOutputOffset: number,
  originalQuadsOutputOffset: number,
  generalRingAttributes: Map<string, ParsePrimitiveAttribute>,
  coneAttributes: Map<string, ParsePrimitiveAttribute>,
  quadAttributes: Map<string, ParsePrimitiveAttribute>
): [number, number, number] {
  let currentInputOffset = 0;
  let currentRingsOutputOffset = 0;
  let currentConesOutputOffset = 0;
  let currentQuadsOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, closedExtrudedRingSegmentInputStructSize);
    const outGeneralRingsView = new DataView(
      outGeneralRingsArray.buffer,
      originalGeneralRingsOutputOffset + currentRingsOutputOffset,
      2 * generalRingOutputStructSize
    );
    const outConesView = new DataView(
      outConesArray.buffer,
      originalConesOutputOffset + currentConesOutputOffset,
      2 * coneOutputStructSize
    );
    const outQuadsView = new DataView(
      outQuadsArray.buffer,
      originalQuadsOutputOffset + currentQuadsOutputOffset,
      2 * quadOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const centerAxis = getVector3(inView, 24);
    const height = inView.getFloat32(36, true);
    const innerRadius = inView.getFloat32(40, true);
    const outerRadius = inView.getFloat32(44, true);
    const rotationAngle = inView.getFloat32(48, true);
    const arcAngle = inView.getFloat32(52, true);

    const centerA = center.clone().addScaledVector(centerAxis, height / 2);
    const centerB = center.clone().addScaledVector(centerAxis, - height / 2);

    const rotation = createRotationBetweenZ(centerAxis);
    const localXAxis = new THREE.Vector3(1, 0, 0).applyMatrix4(rotation);
    const thickness = (outerRadius - innerRadius) / outerRadius;

    const instanceMatrixA = createGeneralRingMatrix(centerA, centerAxis, localXAxis, outerRadius, outerRadius);
    const instanceMatrixB = createGeneralRingMatrix(centerB, centerAxis, localXAxis, outerRadius, outerRadius);

    outputRing(
      treeIndex,
      color,
      centerAxis,
      thickness,
      rotationAngle,
      arcAngle,
      instanceMatrixA,
      outGeneralRingsView,
      0,
      generalRingAttributes
    );
    outputRing(
      treeIndex,
      color,
      centerAxis.clone().negate(),
      thickness,
      rotationAngle,
      arcAngle,
      instanceMatrixB,
      outGeneralRingsView,
      generalRingOutputStructSize,
      generalRingAttributes
    );

    outputCone(
      treeIndex,
      color,
      centerA,
      centerB,
      outerRadius,
      outerRadius,
      rotationAngle,
      arcAngle,
      localXAxis,
      outConesView,
      0,
      coneAttributes
    );
    outputCone(
      treeIndex,
      color,
      centerA,
      centerB,
      innerRadius,
      innerRadius,
      rotationAngle,
      arcAngle,
      localXAxis,
      outConesView,
      coneOutputStructSize,
      coneAttributes
    );

    const c0 = Math.cos(rotationAngle);
    const s0 = Math.sin(rotationAngle);

    const vertexA = new THREE.Vector3(c0, s0, 0);
    const vertexA0 = vertexA.clone().applyMatrix4(rotation);
    const vertexA1 = centerB.clone().addScaledVector(vertexA0, innerRadius);
    const vertexA2 = centerA.clone().addScaledVector(vertexA0, outerRadius);
    const vertexA3 = centerB.clone().addScaledVector(vertexA0, outerRadius);

    outputQuad(treeIndex, color, [vertexA0, vertexA1, vertexA2, vertexA3], outQuadsView, 0, quadAttributes);

    const c1 = Math.cos(rotationAngle + arcAngle);
    const s1 = Math.sin(rotationAngle + arcAngle);

    const vertexB = new THREE.Vector3(c1, s1, 0);
    const vertexB0 = vertexB.clone().applyMatrix4(rotation);
    const vertexB1 = centerA.clone().addScaledVector(vertexB0, outerRadius);
    const vertexB2 = centerB.clone().addScaledVector(vertexB0, innerRadius);
    const vertexB3 = centerB.clone().addScaledVector(vertexB0, outerRadius);

    outputQuad(
      treeIndex,
      color,
      [vertexB0, vertexB1, vertexB2, vertexB3],
      outQuadsView,
      quadOutputStructSize,
      quadAttributes
    );

    currentInputOffset += closedExtrudedRingSegmentInputStructSize;
    currentRingsOutputOffset += 2 * generalRingOutputStructSize;
    currentConesOutputOffset += 2 * coneOutputStructSize;
    currentQuadsOutputOffset += 2 * quadOutputStructSize;
  }

  return [currentRingsOutputOffset, currentConesOutputOffset, currentQuadsOutputOffset];
}

export function transformExtrudedRings(
  inputBuffer: Uint8Array,
  outGeneralRingsArray: Uint8Array,
  outConesArray: Uint8Array,
  originalGeneralRingsOutputOffset: number,
  originalConesOutputOffset: number,
  generalRingAttributes: Map<string, ParsePrimitiveAttribute>,
  coneAttributes: Map<string, ParsePrimitiveAttribute>
): [number, number] {
  let currentInputOffset = 0;
  let currentRingsOutputOffset = 0;
  let currentConesOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, extrudedRingInputStructSize);
    const outGeneralRingsView = new DataView(
      outGeneralRingsArray.buffer,
      originalGeneralRingsOutputOffset + currentRingsOutputOffset,
      2 * generalRingOutputStructSize
    );
    const outConesView = new DataView(
      outConesArray.buffer,
      originalConesOutputOffset + currentConesOutputOffset,
      2 * coneOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const centerAxis = getVector3(inView, 24);
    const height = inView.getFloat32(36, true);
    const innerRadius = inView.getFloat32(40, true);
    const outerRadius = inView.getFloat32(44, true);

    const centerA = center.clone().addScaledVector(centerAxis, height / 2);
    const centerB = center.clone().addScaledVector(centerAxis, - height / 2);

    const rotation = createRotationBetweenZ(centerAxis);
    const localXAxis = new THREE.Vector3(1, 0, 0).applyMatrix4(rotation);
    const thickness = (outerRadius - innerRadius) / outerRadius;

    const instanceMatrixA = createGeneralRingMatrix(centerA, centerAxis, localXAxis, outerRadius, outerRadius);
    const instanceMatrixB = createGeneralRingMatrix(centerB, centerAxis, localXAxis, outerRadius, outerRadius);

    outputRing(
      treeIndex,
      color,
      centerAxis,
      thickness,
      0,
      2 * Math.PI,
      instanceMatrixA,
      outGeneralRingsView,
      0,
      generalRingAttributes
    );
    outputRing(
      treeIndex,
      color,
      centerAxis.clone().negate(),
      thickness,
      0,
      2 * Math.PI,
      instanceMatrixB,
      outGeneralRingsView,
      generalRingOutputStructSize,
      generalRingAttributes
    );

    outputCone(
      treeIndex,
      color,
      centerA,
      centerB,
      outerRadius,
      outerRadius,
      0,
      2 * Math.PI,
      localXAxis,
      outConesView,
      0,
      coneAttributes
    );

    outputCone(
      treeIndex,
      color,
      centerA,
      centerB,
      innerRadius,
      innerRadius,
      0,
      2 * Math.PI,
      localXAxis,
      outConesView,
      coneOutputStructSize,
      coneAttributes
    );

    currentInputOffset += extrudedRingInputStructSize;
    currentRingsOutputOffset += 2 * generalRingOutputStructSize;
    currentConesOutputOffset += 2 * coneOutputStructSize;
  }

  return [currentRingsOutputOffset, currentConesOutputOffset];
}

export function transformOpenExtrudedRingSegments(
  inputBuffer: Uint8Array,
  outGeneralRingsArray: Uint8Array,
  outConesArray: Uint8Array,
  originalGeneralRingsOutputOffset: number,
  originalConesOutputOffset: number,
  generalRingAttributes: Map<string, ParsePrimitiveAttribute>,
  coneAttributes: Map<string, ParsePrimitiveAttribute>
): [number, number] {
  let currentInputOffset = 0;
  let currentRingsOutputOffset = 0;
  let currentConesOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, openExtrudedRingSegmentInputStructSize);
    const outGeneralRingsView = new DataView(
      outGeneralRingsArray.buffer,
      originalGeneralRingsOutputOffset + currentRingsOutputOffset,
      generalRingOutputStructSize
    );
    const outConesView = new DataView(
      outConesArray.buffer,
      originalConesOutputOffset + currentConesOutputOffset,
      coneOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const centerAxis = getVector3(inView, 24);
    const height = inView.getFloat32(36, true);
    const innerRadius = inView.getFloat32(40, true);
    const outerRadius = inView.getFloat32(44, true);
    const rotationAngle = inView.getFloat32(48, true);
    const arcAngle = inView.getFloat32(52, true);

    const centerA = center.clone().addScaledVector(centerAxis, height / 2);
    const centerB = center.clone().addScaledVector(centerAxis, - height / 2);

    const rotation = createRotationBetweenZ(centerAxis);
    const localXAxis = new THREE.Vector3(1, 0, 0).applyMatrix4(rotation);
    const thickness = (outerRadius - innerRadius) / outerRadius;

    const instanceMatrixA = createGeneralRingMatrix(centerA, centerAxis, localXAxis, outerRadius, outerRadius);
    const instanceMatrixB = createGeneralRingMatrix(centerB, centerAxis, localXAxis, outerRadius, outerRadius);

    outputRing(
      treeIndex,
      color,
      centerAxis,
      thickness,
      rotationAngle,
      arcAngle,
      instanceMatrixA,
      outGeneralRingsView,
      0,
      generalRingAttributes
    );
    outputRing(
      treeIndex,
      color,
      centerAxis.clone().negate(),
      thickness,
      rotationAngle,
      arcAngle,
      instanceMatrixB,
      outGeneralRingsView,
      generalRingOutputStructSize,
      generalRingAttributes
    );

    outputCone(
      treeIndex,
      color,
      centerA,
      centerB,
      outerRadius,
      outerRadius,
      rotationAngle,
      arcAngle,
      localXAxis,
      outConesView,
      0,
      coneAttributes
    );
    
    
    outputCone(
      treeIndex,
      color,
      centerA,
      centerB,
      innerRadius,
      innerRadius,
      rotationAngle,
      arcAngle,
      localXAxis,
      outConesView,
      coneOutputStructSize,
      coneAttributes
    );

    currentInputOffset += openExtrudedRingSegmentInputStructSize;
    currentRingsOutputOffset += 2 * generalRingOutputStructSize;
    currentConesOutputOffset += 2 * coneOutputStructSize;
  }

  return [currentRingsOutputOffset, currentConesOutputOffset];
}

export function transformRings(
  inputBuffer: Uint8Array,
  outGeneralRingsArray: Uint8Array,
  originalGeneralRingsOutputOffset: number,
  generalRingAttributes: Map<string, ParsePrimitiveAttribute>
): number {
  let currentInputOffset = 0;
  let currentGeneralRingsOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, ringInputStructSize);
    const outGeneralRingsView = new DataView(
      outGeneralRingsArray.buffer,
      originalGeneralRingsOutputOffset + currentGeneralRingsOutputOffset,
      generalRingOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const normal = getVector3(inView, 24);
    const innerRadius = inView.getFloat32(36, true);
    const outerRadius = inView.getFloat32(40, true);

    const thickness = (outerRadius - innerRadius) / outerRadius;
    const rotation = createRotationBetweenZ(normal);
    const localXAxis = new THREE.Vector3(1, 0, 0).applyMatrix4(rotation);

    const instanceMatrix = createGeneralRingMatrix(center, normal, localXAxis, outerRadius, outerRadius);

    outputRing(
      treeIndex,
      color,
      normal,
      thickness,
      0,
      2 * Math.PI,
      instanceMatrix,
      outGeneralRingsView,
      0,
      generalRingAttributes
    );

    currentInputOffset += ringInputStructSize;
    currentGeneralRingsOutputOffset += generalRingOutputStructSize;
  }

  return currentGeneralRingsOutputOffset;
}

export function transformOpenSphericalSegments(
  inputBuffer: Uint8Array,
  outSphericalSegmentsArray: Uint8Array,
  originalSphericalSegmentsOutputOffset: number,
  sphericalSegmentAttributes: Map<string, ParsePrimitiveAttribute>
): number {
  let currentInputOffset = 0;
  let currentSphericalSegmentsOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, openSphericalSegmentInputStructSize);
    const outSphericalSegmentsView = new DataView(
      outSphericalSegmentsArray.buffer,
      originalSphericalSegmentsOutputOffset + currentSphericalSegmentsOutputOffset,
      sphericalSegmentOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const normal = getVector3(inView, 24);
    const height = inView.getFloat32(36, true);
    const radius = inView.getFloat32(40, true);

    outputSphericalSegment(
      treeIndex,
      color,
      center,
      normal,
      radius,
      height,
      outSphericalSegmentsView,
      0,
      sphericalSegmentAttributes
    );

    currentInputOffset += openSphericalSegmentInputStructSize;
    currentSphericalSegmentsOutputOffset += sphericalSegmentOutputStructSize;
  }

  return currentSphericalSegmentsOutputOffset;
}

export function transformSpheres(
  inputBuffer: Uint8Array,
  outSphericalSegmentsArray: Uint8Array,
  originalSphericalSegmentsOutputOffset: number,
  sphericalSegmentAttributes: Map<string, ParsePrimitiveAttribute>
): number {
  let currentInputOffset = 0;
  let currentSphericalSegmentsOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, sphereInputStructSize);
    const outSphericalSegmentsView = new DataView(
      outSphericalSegmentsArray.buffer,
      originalSphericalSegmentsOutputOffset + currentSphericalSegmentsOutputOffset,
      sphericalSegmentOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const radius = inView.getFloat32(24, true);

    outputSphericalSegment(
      treeIndex,
      color,
      center,
      new THREE.Vector3(0, 0, 1),
      radius,
      2 * radius,
      outSphericalSegmentsView,
      0,
      sphericalSegmentAttributes
    );

    currentInputOffset += sphereInputStructSize;
    currentSphericalSegmentsOutputOffset += sphericalSegmentOutputStructSize;
  }

  return currentSphericalSegmentsOutputOffset;
}

export function transformClosedSphericalSegments(
  inputBuffer: Uint8Array,
  outSphericalSegmentsArray: Uint8Array,
  outCirclesArray: Uint8Array,
  originalSphericalSegmentsOutputOffset: number,
  originalCirclesOutputOffset: number,
  sphericalSegmentAttributes: Map<string, ParsePrimitiveAttribute>,
  circleAttributes: Map<string, ParsePrimitiveAttribute>
): [number, number] {
  let currentInputOffset = 0;
  let currentSphericalSegmentsOutputOffset = 0;
  let currentCircleOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, closedSphericalSegmentInputStructSize);
    const outSphericalSegmentsView = new DataView(
      outSphericalSegmentsArray.buffer,
      originalSphericalSegmentsOutputOffset + currentSphericalSegmentsOutputOffset,
      sphericalSegmentOutputStructSize
    );
    const outCirclesView = new DataView(
      outCirclesArray.buffer,
      originalCirclesOutputOffset + currentCircleOutputOffset,
      circleOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    // const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const normal = getVector3(inView, 24);
    const height = inView.getFloat32(36, true);
    const radius = inView.getFloat32(40, true);

    const length = radius - height;
    const circleRadius = Math.sqrt(radius * radius - length * length);
    const circleCenter = center.clone().addScaledVector(normal.normalize(), length);

    outputSphericalSegment(
      treeIndex,
      color,
      center,
      normal,
      radius,
      height,
      outSphericalSegmentsView,
      0,
      sphericalSegmentAttributes
    );
    outputCircle(treeIndex, color, circleCenter, normal, circleRadius, outCirclesView, 0, circleAttributes);

    currentInputOffset += closedSphericalSegmentInputStructSize;
    currentSphericalSegmentsOutputOffset += sphericalSegmentOutputStructSize;
    currentCircleOutputOffset += circleOutputStructSize;
  }

  return [currentSphericalSegmentsOutputOffset, currentCircleOutputOffset];
}

export function transformToruses(
  inputBuffer: Uint8Array,
  outTorusSegmentsArray: Uint8Array,
  originalTorusSegmentsOutputOffset: number,
  torusSegmentAttributes: Map<string, ParsePrimitiveAttribute>
): number {
  let currentInputOffset = 0;
  let currentTorusOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, torusInputStructSize);
    const outTorusSegmentsView = new DataView(
      outTorusSegmentsArray.buffer,
      originalTorusSegmentsOutputOffset + currentTorusOutputOffset,
      torusSegmentOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    const diagonal = inView.getFloat32(8, true); // Only use for diagonal, as far as I can see
    const center = getVector3(inView, 12);
    const normal = getVector3(inView, 24);
    const radius = inView.getFloat32(36, true);
    const tubeRadius = inView.getFloat32(40, true);

    outputTorusSegment(
      treeIndex,
      color,
      diagonal,
      center,
      normal,
      radius,
      tubeRadius,
      0,
      2 * Math.PI,
      outTorusSegmentsView,
      0,
      torusSegmentAttributes
    );

    currentInputOffset += torusInputStructSize;
    currentTorusOutputOffset += torusSegmentOutputStructSize;
  }

  return currentTorusOutputOffset;
}

export function transformClosedTorusSegments(
  inputBuffer: Uint8Array,
  outTorusSegmentsArray: Uint8Array,
  originalTorusSegmentsOutputOffset: number,
  torusSegmentAttributes: Map<string, ParsePrimitiveAttribute>
): number {
  let currentInputOffset = 0;
  let currentTorusOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, closedTorusSegmentInputStructSize);
    const outTorusSegmentsView = new DataView(
      outTorusSegmentsArray.buffer,
      originalTorusSegmentsOutputOffset + currentTorusOutputOffset,
      torusSegmentOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const normal = getVector3(inView, 24);
    const radius = inView.getFloat32(36, true);
    const tubeRadius = inView.getFloat32(40, true);
    const rotationAngle = inView.getFloat32(44, true);
    const arcAngle = inView.getFloat32(48, true);

    outputTorusSegment(
      treeIndex,
      color,
      diagonal,
      center,
      normal,
      radius,
      tubeRadius,
      rotationAngle,
      arcAngle,
      outTorusSegmentsView,
      0,
      torusSegmentAttributes
    );

    currentInputOffset += closedTorusSegmentInputStructSize;
    currentTorusOutputOffset += torusSegmentOutputStructSize;
  }

  return currentTorusOutputOffset;
}

export function transformOpenTorusSegments(
  inputBuffer: Uint8Array,
  outTorusSegmentsArray: Uint8Array,
  originalTorusSegmentsOutputOffset: number,
  torusSegmentAttributes: Map<string, ParsePrimitiveAttribute>
): number {
  let currentInputOffset = 0;
  let currentTorusOutputOffset = 0;

  while (currentInputOffset < inputBuffer.byteLength) {
    const inView = new DataView(inputBuffer, currentInputOffset, openTorusSegmentInputStructSize);
    const outTorusSegmentsView = new DataView(
      outTorusSegmentsArray.buffer,
      originalTorusSegmentsOutputOffset + currentTorusOutputOffset,
      torusSegmentOutputStructSize
    );

    const treeIndex = inView.getFloat32(0, true);
    const color = getColor(inView, 4);
    const diagonal = inView.getFloat32(8, true);
    const center = getVector3(inView, 12);
    const normal = getVector3(inView, 24);
    const radius = inView.getFloat32(36, true);
    const tubeRadius = inView.getFloat32(40, true);
    const rotationAngle = inView.getFloat32(44, true);
    const arcAngle = inView.getFloat32(48, true);

    outputTorusSegment(
      treeIndex,
      color,
      diagonal,
      center,
      normal,
      radius,
      tubeRadius,
      rotationAngle,
      arcAngle,
      outTorusSegmentsView,
      0,
      torusSegmentAttributes
    );

    currentInputOffset += openTorusSegmentInputStructSize;
    currentTorusOutputOffset += torusSegmentOutputStructSize;
  }

  return currentTorusOutputOffset;
}
