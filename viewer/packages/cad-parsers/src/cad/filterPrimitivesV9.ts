/*!
 * Copyright 2021 Cognite AS
 */

import { assertNever, TypedArray, TypedArrayConstructor } from '@reveal/utilities';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import {
  computeBoundingBoxFromCenterAndRadiusAttributes,
  computeBoundingBoxFromEllipseValues,
  computeBoundingBoxFromInstanceMatrixAttributes,
  computeBoundingBoxFromVertexAttributes
} from '../utilities/computeBoundingBoxFromAttributes';
import { filterPrimitivesOutsideClipBox } from './filterPrimitivesCommon';
import * as THREE from 'three';

export function filterGeometryOutsideClipBox(
  geometryBuffer: THREE.BufferGeometry,
  type: RevealGeometryCollectionType,
  clipBox?: THREE.Box3
): THREE.BufferGeometry | undefined {
  if (!clipBox) return geometryBuffer;

  if (
    type === RevealGeometryCollectionType.InstanceMesh ||
    type === RevealGeometryCollectionType.TriangleMesh ||
    type === RevealGeometryCollectionType.TexturedTriangleMesh
  ) {
    const boundingBox = geometryBuffer.boundingBox;
    if (!boundingBox || boundingBox.intersectsBox(clipBox)) {
      return geometryBuffer;
    }
    return undefined;
  }

  const interleavedAttributes = getAttributes(geometryBuffer, THREE.InterleavedBufferAttribute);
  let newArray: Uint8Array<ArrayBuffer> | undefined;

  switch (type) {
    case RevealGeometryCollectionType.BoxCollection:
      newArray = filterBoxCollection(interleavedAttributes, clipBox);
      break;
    case RevealGeometryCollectionType.CircleCollection:
      newArray = filterCircleCollection(interleavedAttributes, clipBox);
      break;
    case RevealGeometryCollectionType.ConeCollection:
      newArray = filterConeCollection(interleavedAttributes, clipBox);
      break;
    case RevealGeometryCollectionType.EccentricConeCollection:
      newArray = filterEccentricConeCollection(interleavedAttributes, clipBox);
      break;
    case RevealGeometryCollectionType.EllipsoidSegmentCollection:
      newArray = filterEllipsoidCollection(interleavedAttributes, clipBox);
      break;
    case RevealGeometryCollectionType.GeneralCylinderCollection:
      newArray = filterGeneralCylinderCollection(interleavedAttributes, clipBox);
      break;
    case RevealGeometryCollectionType.GeneralRingCollection:
      newArray = filterGeneralRingCollection(interleavedAttributes, clipBox);
      break;
    case RevealGeometryCollectionType.QuadCollection:
      newArray = filterQuadCollection(interleavedAttributes, clipBox);
      break;
    case RevealGeometryCollectionType.TorusSegmentCollection:
      newArray = filterTorusCollection(interleavedAttributes, clipBox);
      break;
    case RevealGeometryCollectionType.TrapeziumCollection:
      newArray = filterTrapeziumCollection(interleavedAttributes, clipBox);
      break;
    case RevealGeometryCollectionType.NutCollection:
      newArray = filterNutCollection(interleavedAttributes, clipBox);
      break;
    default:
      assertNever(type);
  }

  if (newArray.length === 0) {
    return undefined;
  }

  return createNewBufferGeometry(newArray, geometryBuffer, interleavedAttributes);
}

const _views = new Map<number, TypedArrayConstructor>([
  [1, Uint8Array<ArrayBuffer>],
  [4, Float32Array<ArrayBuffer>]
]);

const epsilon = 1e-4;
const quadBoundingBox = new THREE.Box3(new THREE.Vector3(-0.5, -0.5, -epsilon), new THREE.Vector3(0.5, 0.5, epsilon));

const unitBoundingBox = new THREE.Box3(new THREE.Vector3(-0.5, -0.5, -0.5), new THREE.Vector3(0.5, 0.5, 0.5));

function getAttributes<T extends THREE.BufferAttribute | THREE.InterleavedBufferAttribute>(
  geometry: THREE.BufferGeometry,
  filterType: new (...args: any[]) => T
): Map<string, T> {
  return new Map(
    Object.entries(geometry.attributes)
      .filter(namedAttribute => namedAttribute[1] instanceof filterType)
      .map(nameAttributePair => [nameAttributePair[0], nameAttributePair[1] as T])
  );
}

function createNewBufferGeometry(
  array: Uint8Array<ArrayBuffer>,
  oldGeometryBuffer: THREE.BufferGeometry,
  interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>
) {
  const newGeometry = new THREE.BufferGeometry();

  const bufferAttributeMap = getAttributes(oldGeometryBuffer, THREE.BufferAttribute);
  bufferAttributeMap.forEach((attribute, name) => {
    newGeometry.setAttribute(name, attribute);
  });

  newGeometry.setIndex(oldGeometryBuffer.getIndex());

  interleavedAttributeMap.forEach((attribute, name) => {
    const stride = attribute.data.stride;
    const componentSize = (attribute.array as TypedArray).BYTES_PER_ELEMENT;

    const ComponentType = _views.get(componentSize)!;
    const interleavedAttributesBuffer = new THREE.InstancedInterleavedBuffer(new ComponentType(array.buffer), stride);

    newGeometry.setAttribute(
      name,
      new THREE.InterleavedBufferAttribute(
        interleavedAttributesBuffer,
        attribute.itemSize,
        attribute.offset,
        attribute.normalized
      )
    );
  });

  return newGeometry;
}

function filterWithCallback(
  interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
  computeBoundingBoxCallback: (
    index: number,
    elementSize: number,
    attributeFloatValues: Float32Array,
    out: THREE.Box3
  ) => THREE.Box3,
  clipBox: THREE.Box3
): Uint8Array<ArrayBuffer> {
  const firstInterleavedAttribute = interleavedAttributeMap.values().next().value as THREE.InterleavedBufferAttribute;
  const typedArray = firstInterleavedAttribute.array as TypedArray;
  const sharedArray = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);

  const newRawBuffer = filterPrimitivesOutsideClipBox(
    sharedArray,
    firstInterleavedAttribute.data.stride * typedArray.BYTES_PER_ELEMENT,
    clipBox,
    computeBoundingBoxCallback
  );

  return newRawBuffer;
}

function filterOnInstanceMatrixAndBoundingBox(
  interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
  untransformedBoundingBox: THREE.Box3,
  clipBox: THREE.Box3
): Uint8Array<ArrayBuffer> {
  const computeBoundingBoxCallback = (
    index: number,
    elementSize: number,
    attributeFloatValues: Float32Array,
    out: THREE.Box3
  ) => {
    const matrixAttribute = interleavedAttributeMap.get('a_instanceMatrix')!;
    const matrixByteOffset = matrixAttribute.offset * (matrixAttribute.array as TypedArray).BYTES_PER_ELEMENT;

    return computeBoundingBoxFromInstanceMatrixAttributes(
      attributeFloatValues,
      matrixByteOffset,
      elementSize,
      index,
      untransformedBoundingBox,
      out
    );
  };

  return filterWithCallback(interleavedAttributeMap, computeBoundingBoxCallback, clipBox);
}

function filterOnCenterAndRadius(
  interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
  clipBox: THREE.Box3,
  radiusAAttributeName: string,
  radiusBAttributeName: string
): Uint8Array<ArrayBuffer> {
  const computeBoundingBoxCallback = (
    index: number,
    elementSize: number,
    attributeFloatValues: Float32Array,
    out: THREE.Box3
  ): THREE.Box3 => {
    const centerAAttribute = interleavedAttributeMap.get('a_centerA')!;
    const centerBAttribute = interleavedAttributeMap.get('a_centerB')!;
    const radiusAAttribute = interleavedAttributeMap.get(radiusAAttributeName)!;
    const radiusBAttribute = interleavedAttributeMap.get(radiusBAttributeName)!;

    const byteSizeMultiplier = (centerAAttribute.array as TypedArray).BYTES_PER_ELEMENT;

    return computeBoundingBoxFromCenterAndRadiusAttributes(
      attributeFloatValues,
      centerAAttribute.offset * byteSizeMultiplier,
      centerBAttribute.offset * byteSizeMultiplier,
      radiusAAttribute.offset * byteSizeMultiplier,
      radiusBAttribute.offset * byteSizeMultiplier,
      elementSize,
      index,
      out
    );
  };
  return filterWithCallback(interleavedAttributeMap, computeBoundingBoxCallback, clipBox);
}

function filterOnVertexAttributes(
  interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
  clipBox: THREE.Box3
): Uint8Array<ArrayBuffer> {
  const computeBoundingBoxCallback = (
    index: number,
    elementSize: number,
    attributeFloatValues: Float32Array,
    out: THREE.Box3
  ): THREE.Box3 => {
    const vertex1Attribute = interleavedAttributeMap.get('a_vertex1')!;
    const vertex2Attribute = interleavedAttributeMap.get('a_vertex2')!;
    const vertex3Attribute = interleavedAttributeMap.get('a_vertex3')!;
    const vertex4Attribute = interleavedAttributeMap.get('a_vertex4')!;

    const elementByteSize = (vertex1Attribute.array as TypedArray).BYTES_PER_ELEMENT;

    const vertex1AttributeByteOffset = vertex1Attribute.offset * elementByteSize;
    const vertex2AttributeByteOffset = vertex2Attribute.offset * elementByteSize;
    const vertex3AttributeByteOffset = vertex3Attribute.offset * elementByteSize;
    const vertex4AttributeByteOffset = vertex4Attribute.offset * elementByteSize;

    return computeBoundingBoxFromVertexAttributes(
      vertex1AttributeByteOffset,
      vertex2AttributeByteOffset,
      vertex3AttributeByteOffset,
      vertex4AttributeByteOffset,
      attributeFloatValues,
      elementSize,
      index,
      out
    );
  };

  return filterWithCallback(interleavedAttributeMap, computeBoundingBoxCallback, clipBox);
}

const filterOnTorusAttributesVars = {
  boundingBox: new THREE.Box3()
};

function filterOnTorusAttributes(
  interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
  clipBox: THREE.Box3
): Uint8Array<ArrayBuffer> {
  const { boundingBox } = filterOnTorusAttributesVars;

  const computeBoundingBoxCallback = (
    index: number,
    elementSize: number,
    attributeFloatValues: Float32Array,
    out: THREE.Box3
  ): THREE.Box3 => {
    const radius = interleavedAttributeMap.get('a_radius')!.getX(index);
    const tubeRadius = interleavedAttributeMap.get('a_tubeRadius')!.getX(index);

    boundingBox.min.set(-radius - tubeRadius, -radius - tubeRadius, -tubeRadius);
    boundingBox.max.set(radius + tubeRadius, radius + tubeRadius, tubeRadius);

    const matrixAttribute = interleavedAttributeMap.get('a_instanceMatrix')!;
    const matrixByteOffset = matrixAttribute.offset * (matrixAttribute.array as TypedArray).BYTES_PER_ELEMENT;

    return computeBoundingBoxFromInstanceMatrixAttributes(
      attributeFloatValues,
      matrixByteOffset,
      elementSize,
      index,
      boundingBox,
      out
    );
  };

  return filterWithCallback(interleavedAttributeMap, computeBoundingBoxCallback, clipBox);
}

const filterOnEllipsoidAttributesVars = {
  center: new THREE.Vector3()
};

function filterOnEllipsoidAttributes(
  interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
  clipBox: THREE.Box3
): Uint8Array<ArrayBuffer> {
  const { center } = filterOnEllipsoidAttributesVars;

  const computeBoundingBoxCallback = (
    index: number,
    _elementSize: number,
    _attributeFloatValues: Float32Array,
    out: THREE.Box3
  ): THREE.Box3 => {
    const r1 = interleavedAttributeMap.get('a_horizontalRadius')!.getX(index);
    const r2 = interleavedAttributeMap.get('a_verticalRadius')!.getX(index);
    const height = interleavedAttributeMap.get('a_height')!.getX(index);

    const centerAttribute = interleavedAttributeMap.get('a_center')!;
    center.set(centerAttribute.getX(index), centerAttribute.getY(index), centerAttribute.getZ(index));

    return computeBoundingBoxFromEllipseValues(r1, r2, height, center, out);
  };

  return filterWithCallback(interleavedAttributeMap, computeBoundingBoxCallback, clipBox);
}

function filterBoxCollection(
  interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
  clipBox: THREE.Box3
): Uint8Array<ArrayBuffer> {
  return filterOnInstanceMatrixAndBoundingBox(interleavedAttributeMap, unitBoundingBox, clipBox);
}

function filterCircleCollection(
  interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
  clipBox: THREE.Box3
): Uint8Array<ArrayBuffer> {
  return filterOnInstanceMatrixAndBoundingBox(interleavedAttributeMap, quadBoundingBox, clipBox);
}

function filterConeCollection(
  interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
  clipBox: THREE.Box3
): Uint8Array<ArrayBuffer> {
  return filterOnCenterAndRadius(interleavedAttributeMap, clipBox, 'a_radiusA', 'a_radiusB');
}

function filterEccentricConeCollection(
  interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
  clipBox: THREE.Box3
): Uint8Array<ArrayBuffer> {
  return filterOnCenterAndRadius(interleavedAttributeMap, clipBox, 'a_radiusA', 'a_radiusB');
}

function filterEllipsoidCollection(
  interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
  clipBox: THREE.Box3
): Uint8Array<ArrayBuffer> {
  return filterOnEllipsoidAttributes(interleavedAttributeMap, clipBox);
}

function filterGeneralCylinderCollection(
  interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
  clipBox: THREE.Box3
): Uint8Array<ArrayBuffer> {
  return filterOnCenterAndRadius(interleavedAttributeMap, clipBox, 'a_radius', 'a_radius');
}

function filterGeneralRingCollection(
  interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
  clipBox: THREE.Box3
): Uint8Array<ArrayBuffer> {
  return filterOnInstanceMatrixAndBoundingBox(interleavedAttributeMap, quadBoundingBox, clipBox);
}

function filterQuadCollection(
  interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
  clipBox: THREE.Box3
): Uint8Array<ArrayBuffer> {
  return filterOnInstanceMatrixAndBoundingBox(interleavedAttributeMap, quadBoundingBox, clipBox);
}

function filterTorusCollection(
  interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
  clipBox: THREE.Box3
): Uint8Array<ArrayBuffer> {
  return filterOnTorusAttributes(interleavedAttributeMap, clipBox);
}

function filterTrapeziumCollection(
  interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
  clipBox: THREE.Box3
): Uint8Array<ArrayBuffer> {
  return filterOnVertexAttributes(interleavedAttributeMap, clipBox);
}

function filterNutCollection(
  interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
  clipBox: THREE.Box3
): Uint8Array<ArrayBuffer> {
  return filterOnInstanceMatrixAndBoundingBox(interleavedAttributeMap, unitBoundingBox, clipBox);
}
