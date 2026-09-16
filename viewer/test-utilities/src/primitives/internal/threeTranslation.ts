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
import type { PrimitiveName, Primitive } from './types';

import { BufferGeometry, InstancedInterleavedBuffer, InterleavedBufferAttribute } from 'three';
import type { TypedArray } from '../../../../packages/utilities';
import { assert } from '../../../../packages/utilities/src/assert';

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
): InstancedInterleavedBuffer[] {
  let currentByteOffset = 0;
  let lastByteOffset = 0;

  const interleavedBuffers: InstancedInterleavedBuffer[] = [];

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

    interleavedBuffers.push(new InstancedInterleavedBuffer(floatView, elementSizes[i] / floatView.BYTES_PER_ELEMENT));
  }

  return interleavedBuffers;
}

function createBufferGeometries(
  types: PrimitiveName[],
  interleavedBuffers: InstancedInterleavedBuffer[]
): BufferGeometry[] {
  const geometries: BufferGeometry[] = [];

  for (let i = 0; i < types.length; i++) {
    const attributeDescriptions = createAttributeDescriptionsForPrimitive(types[i]);

    const geometry = new BufferGeometry();

    for (const attributeDescription of attributeDescriptions) {
      const itemSize =
        (attributeDescription.format.numComponents * getComponentByteSize(attributeDescription.format.componentType)) /
        Float32Array.BYTES_PER_ELEMENT;

      if (!Number.isInteger(itemSize)) {
        throw Error('Attribute does not have size divisible by float size');
      }

      const shouldNormalize = getShouldNormalize(attributeDescription.format.componentType);

      const bufferAttribute = new InterleavedBufferAttribute(
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
 * Returns a list of BufferGeometry objects describing the primitives
 * written to a single shared underlying buffer.
 */
export function createPrimitiveInterleavedGeometriesSharingBuffer(
  types: PrimitiveName[],
  primitiveDescs: Primitive[][]
): BufferGeometry[] {
  assert(types.length == primitiveDescs.length);

  const elementSizes = types.map(computeTotalAttributeByteSize);
  const buffer = createCommonBuffer(elementSizes, primitiveDescs);

  const interleavedBuffers = createInstancedInterleavedBuffers(buffer, types, primitiveDescs, elementSizes);

  return createBufferGeometries(types, interleavedBuffers);
}

/**
 * Takes a primitive name and a list of primitive instances of that type
 * Returns a BufferGeometry containing the primitives
 */
export function createPrimitiveInterleavedGeometry(name: PrimitiveName, primitiveDescs: Primitive[]): BufferGeometry {
  return createPrimitiveInterleavedGeometriesSharingBuffer([name], [primitiveDescs])[0];
}

/* NB: Assumes BufferGeometry only uses one underlying buffer for interleaved attributes */
function getBufferByteSize(geometryBuffer: BufferGeometry): [number, number] {
  let underlyingByteBufferLength: number | undefined = undefined;
  let underlyingByteBufferOffset: number | undefined = undefined;
  for (const attr of Object.entries(geometryBuffer.attributes)) {
    if (attr[1] instanceof InterleavedBufferAttribute) {
      underlyingByteBufferLength = ((attr[1] as InterleavedBufferAttribute).array as TypedArray).byteLength;
      underlyingByteBufferOffset = ((attr[1] as InterleavedBufferAttribute).array as TypedArray).byteOffset;
    }
  }

  if (underlyingByteBufferLength === undefined) {
    throw Error('Could not find interleaved attribute buffer for BufferGeometry');
  }

  return [underlyingByteBufferLength, underlyingByteBufferOffset!];
}

/**
 * Reads primitives of the specified type out of the provided BufferGeometry object
 * Returns list of records containing the resulting primitives
 */
export function parseInterleavedGeometry(name: PrimitiveName, geometryBuffer: BufferGeometry): Primitive[] {
  const singleElementSize = computeTotalAttributeByteSize(name);

  const [byteLength, byteOffset] = getBufferByteSize(geometryBuffer);

  const numElements = byteLength / singleElementSize;

  if (!Number.isInteger(numElements)) {
    throw Error('Array size not multiple of primitive size');
  }

  const result: Primitive[] = [];
  let currentOffset = byteOffset;
  for (let i = 0; i < numElements; i++) {
    const thisPrimitive: Primitive = readPrimitiveFromBuffer(geometryBuffer, currentOffset);
    result.push(thisPrimitive);
    currentOffset += singleElementSize;
  }

  return result;
}
