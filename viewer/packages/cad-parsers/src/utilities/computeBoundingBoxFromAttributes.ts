/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { ParsePrimitiveAttribute } from '@cognite/reveal-parser-worker';

const computeBoundingBoxFromCenterAndRadiusAttributesVars = {
  centerA: new THREE.Vector3(),
  centerB: new THREE.Vector3(),
  sphere: new THREE.Sphere(),
  box: new THREE.Box3()
};

export function computeBoundingBoxFromCenterAndRadiusAttributes(
  attributeFloatValues: Float32Array,
  centerAByteOffset: number,
  centerBByteOffset: number,
  radiusAByteOffset: number,
  radiusBByteOffset: number,
  elementSize: number,
  elementIndex: number,
  out: THREE.Box3
): THREE.Box3 {
  const { centerA, centerB, sphere, box } = computeBoundingBoxFromCenterAndRadiusAttributesVars;

  function readAttribute(byteOffset: number, idx: number = 0): number {
    const offset = (elementIndex * elementSize + byteOffset) / attributeFloatValues.BYTES_PER_ELEMENT;
    return attributeFloatValues[offset + idx];
  }

  centerA.set(
    readAttribute(centerAByteOffset, 0),
    readAttribute(centerAByteOffset, 1),
    readAttribute(centerAByteOffset, 2)
  );
  centerB.set(
    readAttribute(centerBByteOffset, 0),
    readAttribute(centerBByteOffset, 1),
    readAttribute(centerBByteOffset, 2)
  );
  const radiusA = readAttribute(radiusAByteOffset);
  const radiusB = readAttribute(radiusBByteOffset);

  // Note! Not the tighest fit we could make, works ok for now but could be improved by
  // using normal of each cap to determine exact end points of the top/bottom
  sphere.set(centerA, radiusA);
  sphere.getBoundingBox(out);
  sphere.set(centerB, radiusB);
  sphere.getBoundingBox(box);
  out.expandByPoint(box.min);
  out.expandByPoint(box.max);
  return out;
}

const computeBoundingBoxFromVertexAttributesVars = {
  vertex1: new THREE.Vector3(),
  vertex2: new THREE.Vector3(),
  vertex3: new THREE.Vector3(),
  vertex4: new THREE.Vector3()
};

export function computeBoundingBoxFromVertexAttributes(
  vertex1AttributeByteOffset: number,
  vertex2AttributeByteOffset: number,
  vertex3AttributeByteOffset: number,
  vertex4AttributeByteOffset: number,
  attributeFloatValues: Float32Array,
  elementSize: number,
  elementIndex: number,
  out: THREE.Box3
): THREE.Box3 {
  const { vertex1, vertex2, vertex3, vertex4 } = computeBoundingBoxFromVertexAttributesVars;

  function readAttribute(attributeByteOffset: number, idx: number = 0): number {
    const offset = (elementIndex * elementSize + attributeByteOffset) / attributeFloatValues.BYTES_PER_ELEMENT;
    return attributeFloatValues[offset + idx];
  }

  vertex1.set(
    readAttribute(vertex1AttributeByteOffset, 0),
    readAttribute(vertex1AttributeByteOffset, 1),
    readAttribute(vertex1AttributeByteOffset, 2)
  );
  vertex2.set(
    readAttribute(vertex2AttributeByteOffset, 0),
    readAttribute(vertex2AttributeByteOffset, 1),
    readAttribute(vertex2AttributeByteOffset, 2)
  );
  vertex3.set(
    readAttribute(vertex3AttributeByteOffset, 0),
    readAttribute(vertex3AttributeByteOffset, 1),
    readAttribute(vertex3AttributeByteOffset, 2)
  );
  vertex4.set(
    readAttribute(vertex4AttributeByteOffset, 0),
    readAttribute(vertex4AttributeByteOffset, 1),
    readAttribute(vertex4AttributeByteOffset, 2)
  );

  out.setFromPoints([vertex1, vertex2, vertex3, vertex4]);
  return out;
}

const computeBoundingBoxFromInstanceMatrixAttributesVars = {
  instanceMatrix: new THREE.Matrix4()
};

export function computeBoundingBoxFromInstanceMatrixAttributes(
  attributeFloatValues: Float32Array,
  byteOffset: number,
  elementSize: number,
  elementIndex: number,
  baseBoundingBox: THREE.Box3,
  out: THREE.Box3
): THREE.Box3 {
  const { instanceMatrix } = computeBoundingBoxFromInstanceMatrixAttributesVars;

  const offset = (elementIndex * elementSize + byteOffset) / attributeFloatValues.BYTES_PER_ELEMENT;
  // Note! set() accepts row-major, stored column-major
  instanceMatrix.set(
    attributeFloatValues[offset + 0],
    attributeFloatValues[offset + 4],
    attributeFloatValues[offset + 8],
    attributeFloatValues[offset + 12],

    attributeFloatValues[offset + 1],
    attributeFloatValues[offset + 5],
    attributeFloatValues[offset + 9],
    attributeFloatValues[offset + 13],

    attributeFloatValues[offset + 2],
    attributeFloatValues[offset + 6],
    attributeFloatValues[offset + 10],
    attributeFloatValues[offset + 14],

    attributeFloatValues[offset + 3],
    attributeFloatValues[offset + 7],
    attributeFloatValues[offset + 11],
    attributeFloatValues[offset + 15]
  );
  out.copy(baseBoundingBox).applyMatrix4(instanceMatrix);
  return out;
}

const computeBoundingBoxFromEllipseAttributesVars = {
  center: new THREE.Vector3(),
  size: new THREE.Vector3()
};

export function computeBoundingBoxFromEllipseValues(
  radius1: number,
  radius2: number,
  height: number,
  center: THREE.Vector3,
  out: THREE.Box3
): THREE.Box3 {
  const { size } = computeBoundingBoxFromEllipseAttributesVars;

  const extent = 2 * Math.max(radius1, radius2, height);
  size.set(extent, extent, extent);
  out.setFromCenterAndSize(center, size);
  return out;
}

export function computeBoundingBoxFromEllipseAttributes(
  centerAttribute: ParsePrimitiveAttribute,
  radius1Attribute: ParsePrimitiveAttribute,
  radius2Attribute: ParsePrimitiveAttribute,
  heightAttribute: ParsePrimitiveAttribute,
  attributeFloatValues: Float32Array,
  elementSize: number,
  elementIndex: number,
  out: THREE.Box3
): THREE.Box3 {
  const { center } = computeBoundingBoxFromEllipseAttributesVars;

  function readAttribute(attribute: ParsePrimitiveAttribute, idx: number = 0): number {
    const offset = (elementIndex * elementSize + attribute.offset) / attributeFloatValues.BYTES_PER_ELEMENT;
    return attributeFloatValues[offset + idx];
  }

  const radius1 = readAttribute(radius1Attribute);
  const radius2 = readAttribute(radius2Attribute);
  const height = readAttribute(heightAttribute);

  center.set(readAttribute(centerAttribute, 0), readAttribute(centerAttribute, 1), readAttribute(centerAttribute, 2));

  return computeBoundingBoxFromEllipseValues(radius1, radius2, height, center, out);
}
