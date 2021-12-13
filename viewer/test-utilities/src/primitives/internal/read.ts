/*
 * Copyright 2021 Cognite AS
 */

import { assertNever, TypedArray } from '../../../../packages/utilities';
import { AttributeDesc, commonAttributeTypeMap } from './attributes';
import { Primitive, PrimitiveComponent } from './types';

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
): PrimitiveComponent {
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

function getInterleavedAttributeDescriptionsFromBufferGeometry(geometryBuffer: THREE.BufferGeometry): AttributeDesc[] {
  const descs: AttributeDesc[] = [];
  for (const attributeName in geometryBuffer.attributes) {
    const attribute = geometryBuffer.attributes[attributeName];
    if (!(attribute instanceof THREE.InterleavedBufferAttribute)) continue;

    const format = commonAttributeTypeMap.get(attributeName);

    if (!format) continue;

    const attributeDesc = {
      name: attributeName,
      format,
      byteOffset: attribute.offset * (attribute.array as TypedArray).BYTES_PER_ELEMENT
    };

    descs.push(attributeDesc);
  }

  return descs;
}

/**
 * Reads and returns a single primitive from the provided geometry buffer, at the given byte offset
 */
export function readPrimitiveFromBuffer(geometryBuffer: THREE.BufferGeometry, byteOffset: number): Primitive {
  const attributeDescriptions = getInterleavedAttributeDescriptionsFromBufferGeometry(geometryBuffer);

  const obj: Record<string, PrimitiveComponent> = {};
  for (const attributeDescription of attributeDescriptions) {
    const value = readAttributeValue(geometryBuffer, attributeDescription, byteOffset);
    obj[attributeDescription.name.slice(2)] = value;
  }

  return obj as Primitive;
}
