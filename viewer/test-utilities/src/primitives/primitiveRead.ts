/*
 * Copyright 2021 Cognite AS
 */

import { assertNever, TypedArray } from '../../../packages/utilities';
import { AttributeDesc, createAttributeDescriptionsForPrimitive } from './primitiveAttributes';
import { PrimitiveType } from './primitiveTypes';

import * as THREE from 'three';

function readBufferValues(array: TypedArray, count: number): number[] {
  const resultArray: number[] = [];
  for (let i = 0; i < count; i++) {
    resultArray.push(array[i]);
  }
  return resultArray;
}

function readAttributeValue(
  geometryBuffer: THREE.BufferGeometry,
  attributeDescription: AttributeDesc,
  byteOffset: number
): number | number[] {
  const threeAttribute = geometryBuffer.getAttribute(attributeDescription.name) as THREE.InterleavedBufferAttribute;
  const underlyingTypedArray = threeAttribute.data.array as TypedArray;
  const rawBuffer = underlyingTypedArray.buffer;

  const totalByteOffset = byteOffset + threeAttribute.offset * underlyingTypedArray.BYTES_PER_ELEMENT;

  let typedArray: TypedArray;
  switch (attributeDescription.format.componentType) {
    case 'float':
      typedArray = new Float32Array(rawBuffer, totalByteOffset);
      break;
    case 'byte':
      typedArray = new Uint8Array(rawBuffer, totalByteOffset);
      break;
    default:
      assertNever(attributeDescription.format.componentType);
  }

  const resultArray = readBufferValues(typedArray, attributeDescription.format.numComponents);

  if (attributeDescription.format.numComponents === 1) {
    return resultArray[0];
  } else {
    return resultArray;
  }
}

export function readPrimitiveFromBuffer(
  primitiveName: PrimitiveType,
  geometryBuffer: THREE.BufferGeometry,
  byteOffset: number
): Record<string, unknown> {
  const attributeDescriptions = createAttributeDescriptionsForPrimitive(primitiveName);

  const obj: Record<string, unknown> = {};
  for (const attributeDescription of attributeDescriptions) {
    const value = readAttributeValue(geometryBuffer, attributeDescription, byteOffset);
    obj[attributeDescription.name.slice(1)] = value;
  }

  return obj;
}
