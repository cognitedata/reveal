/*!
 * Copyright 2021 Cognite AS
 */

import {
  createAttributeDescriptionsForPrimitive,
  getComponentByteSize,
  computeTotalAttributeByteSize,
  getShouldNormalize
} from './attributes';
import { writePrimitiveToBuffer } from './write';
import { readPrimitiveFromBuffer } from './read';
import { PrimitiveName, Primitive } from './types';

import * as THREE from 'three';
import { TypedArray } from '../../../../packages/utilities';
import { assert } from 'console';

function createCommonBuffer(elementSizes: number[], primitiveDescs: Primitive[][]) {
  let totalSize = 0;
  for (let i = 0; i < primitiveDescs.length; i++) {
    totalSize += elementSizes[i] * primitiveDescs[i].length;
  }

  return new ArrayBuffer(totalSize);
}

function createInstancedInterleavedBuffers(
  buffer: ArrayBuffer,
  types: PrimitiveName[],
  primitiveDescs: Primitive[][],
  elementSizes: number[]
): THREE.InstancedInterleavedBuffer[] {
  let currentByteOffset = 0;
  let lastByteOffset = 0;

  const interleavedBuffers: THREE.InstancedInterleavedBuffer[] = [];

  for (let i = 0; i < types.length; i++) {
    for (const primitiveDesc of primitiveDescs[i]) {
      currentByteOffset = writePrimitiveToBuffer(types[i], buffer, primitiveDesc, currentByteOffset);
    }

    const floatView = new Float32Array(
      buffer,
      lastByteOffset,
      (currentByteOffset - lastByteOffset) / Float32Array.BYTES_PER_ELEMENT
    );
    lastByteOffset = currentByteOffset;

    interleavedBuffers.push(
      new THREE.InstancedInterleavedBuffer(floatView, elementSizes[i] / floatView.BYTES_PER_ELEMENT)
    );
  }

  return interleavedBuffers;
}

function createBufferGeometries(
  types: PrimitiveName[],
  interleavedBuffers: THREE.InstancedInterleavedBuffer[]
): THREE.BufferGeometry[] {
  const geometries: THREE.BufferGeometry[] = [];

  for (let i = 0; i < types.length; i++) {
    const attributeDescriptions = createAttributeDescriptionsForPrimitive(types[i]);

    const geometry = new THREE.BufferGeometry();

    for (const attributeDescription of attributeDescriptions) {
      const itemSize =
        (attributeDescription.format.numComponents * getComponentByteSize(attributeDescription.format.componentType)) /
        Float32Array.BYTES_PER_ELEMENT;

      if (!Number.isInteger(itemSize)) {
        throw Error('Attribute does not have size divisible by float size');
      }

      const shouldNormalize = getShouldNormalize(attributeDescription.format.componentType);

      const bufferAttribute = new THREE.InterleavedBufferAttribute(
        interleavedBuffers[i],
        itemSize,
        attributeDescription.byteOffset / Float32Array.BYTES_PER_ELEMENT,
        shouldNormalize
      );

      geometry.setAttribute(attributeDescription.name, bufferAttribute);
    }
    geometries.push(geometry);
  }

  return geometries;
}

/**
 * Takes a list of primitive names and a list of lists containing
 * instances of the corresponding primitives.
 * Returns a list of THREE.BufferGeometry objects describing the primitives
 * written to a single shared underlying buffer.
 */
export function createPrimitiveInterleavedGeometriesSharingBuffer(
  types: PrimitiveName[],
  primitiveDescs: Primitive[][]
): THREE.BufferGeometry[] {
  assert(types.length == primitiveDescs.length);

  const elementSizes = types.map(computeTotalAttributeByteSize);
  const buffer = createCommonBuffer(elementSizes, primitiveDescs);

  const interleavedBuffers = createInstancedInterleavedBuffers(buffer, types, primitiveDescs, elementSizes);

  return createBufferGeometries(types, interleavedBuffers);
}

/**
 * Takes a primitive name and a list of primitive instances of that type
 * Returns a THREE.BufferGeometry containing the primitives
 */
export function createPrimitiveInterleavedGeometry(
  name: PrimitiveName,
  primitiveDescs: Primitive[]
): THREE.BufferGeometry {
  return createPrimitiveInterleavedGeometriesSharingBuffer([name], [primitiveDescs])[0];
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

/**
 * Reads primitives of the specified type out of the provided THREE.BufferGeometry object
 * Returns list of records containing the resulting primitives
 */
export function parseInterleavedGeometry(name: PrimitiveName, geometryBuffer: THREE.BufferGeometry): Primitive[] {
  const singleElementSize = computeTotalAttributeByteSize(name);

  const byteLength = getBufferByteSize(geometryBuffer);

  const numElements = byteLength / singleElementSize;

  if (!Number.isInteger(numElements)) {
    throw Error('Array size not multiple of primitive size');
  }

  const result: Primitive[] = [];
  let currentOffset = 0;
  for (let i = 0; i < numElements; i++) {
    const thisPrimitive: Primitive = readPrimitiveFromBuffer(geometryBuffer, currentOffset);
    result.push(thisPrimitive);
    currentOffset += singleElementSize;
  }

  return result;
}
