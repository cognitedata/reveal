/*!
 * Copyright 2021 Cognite AS
 */

import {
  createAttributeDescriptionsForPrimitive,
  getComponentByteSize,
  computeTotalAttributeByteSize,
  getShouldNormalize
} from './primitiveAttributes';
import { writePrimitiveToBuffer } from './primitiveWrite';
import { readPrimitiveFromBuffer } from './primitiveRead';
import { PrimitiveType } from './primitiveTypes';

import * as THREE from 'three';
import { TypedArray } from '../../../packages/utilities';

export function createPrimitiveInterleavedGeometry(name: PrimitiveType, primitiveDescs: any[]): THREE.BufferGeometry {
  const singleElementSize = getTotalAttributeSize(name);
  const totalSize = singleElementSize * primitiveDescs.length;
  const buffer = new ArrayBuffer(totalSize);

  let currentOffset = 0;
  for (const primitiveDesc of primitiveDescs) {
    currentOffset = writePrimitiveToBuffer(name, buffer, primitiveDesc, currentOffset);
  }

  const floatView = new Float32Array(buffer);

  const interleavedBuffer = new THREE.InstancedInterleavedBuffer(
    floatView,
    singleElementSize / floatView.BYTES_PER_ELEMENT
  );

  const attributeDescriptions = createAttributeDescriptionsForPrimitive(name);

  const geometry = new THREE.BufferGeometry();

  for (const attributeDescription of attributeDescriptions) {
    const itemSize =
      (attributeDescription.format.numComponents * getComponentByteSize(attributeDescription.format.componentType)) /
      floatView.BYTES_PER_ELEMENT;

    if (!Number.isInteger(itemSize)) {
      throw Error('Attribute does not have size divisible by float size');
    }

    const shouldNormalize = getShouldNormalize(attributeDescription.format.componentType);

    const bufferAttribute = new THREE.InterleavedBufferAttribute(
      interleavedBuffer,
      itemSize,
      attributeDescription.byteOffset / floatView.BYTES_PER_ELEMENT,
      shouldNormalize
    );

    geometry.setAttribute(attributeDescription.name, bufferAttribute);
  }

  return geometry;
}

/* NB: Assumes BufferGeometry only uses one underlying buffer for interleaved attributes */
function getBufferByteSize(geometryBuffer: THREE.BufferGeometry) {
  let underlyingBuffer: ArrayBuffer | undefined = undefined;
  for (const attr of Object.entries(geometryBuffer.attributes)) {
    if (attr[1] instanceof THREE.InterleavedBufferAttribute) {
      underlyingBuffer = ((attr[1] as THREE.InterleavedBufferAttribute).array as TypedArray).buffer;
    }
  }

  if (!underlyingBuffer) {
    throw Error('Could not find interleaved attribute buffer for BufferGeometry');
  }

  return underlyingBuffer.byteLength;
}

export function parseInterleavedGeometry(
  name: PrimitiveType,
  geometryBuffer: THREE.BufferGeometry
): Record<string, unknown>[] {
  const singleElementSize = computeTotalAttributeByteSize(name);

  const byteLength = getBufferByteSize(geometryBuffer);

  const numElements = byteLength / singleElementSize;

  if (!Number.isInteger(numElements)) {
    throw Error('Array size not multiple of primitive size');
  }

  const result: Record<string, unknown>[] = [];
  let currentOffset = 0;
  for (let i = 0; i < numElements; i++) {
    const thisPrimitive: Record<string, unknown> = readPrimitiveFromBuffer(geometryBuffer, currentOffset);
    result.push(thisPrimitive);
    currentOffset += singleElementSize;
  }

  return result;
}
