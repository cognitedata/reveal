/*!
 * Copyright 2021 Cognite AS
 */

import { assertNever } from '../../../../packages/utilities';
import { AttributeDesc, computeTotalAttributeByteSize, createAttributeDescriptionsMap } from './attributes';
import { PrimitiveName } from './types';

function writeFloatsToBuffer(array: Float32Array, values: number[]) {
  array.set(values);
}

function writeBytesToBuffer(array: Uint8Array, values: number[]) {
  array.set(values);
}

function writeAttributeToBuffer(
  buffer: ArrayBuffer,
  value: number | number[],
  byteOffset: number,
  attributeDescription: AttributeDesc
) {
  const totalByteOffset = attributeDescription.byteOffset + byteOffset;
  const valueArray = typeof value === 'number' ? [value] : value;

  if (attributeDescription.format.componentType == 'float') {
    writeFloatsToBuffer(new Float32Array(buffer, totalByteOffset), valueArray);
  } else if (attributeDescription.format.componentType == 'byte') {
    writeBytesToBuffer(new Uint8Array(buffer, totalByteOffset), valueArray);
  } else {
    assertNever(attributeDescription.format.componentType);
  }
}

function isNumberOrNumberArray(value: any): value is number | number[] {
  return typeof value === 'number' || (Array.isArray(value) && value.length > 0 && typeof value[0] === 'number');
}

// Returns new offset after insertion
export function writePrimitiveToBuffer(
  primitiveName: PrimitiveName,
  buffer: ArrayBuffer,
  obj: any,
  byteOffset: number
): number {
  const byteView = new Uint8Array(buffer, byteOffset);
  const totalAttributeSize = computeTotalAttributeByteSize(primitiveName);

  byteView.fill(0, totalAttributeSize);

  const attributeDescriptionMap = createAttributeDescriptionsMap(primitiveName);

  for (const rawAttributeName in obj) {
    const value = obj[rawAttributeName];
    const prefixedAttributeName = 'a_' + rawAttributeName;
    const attributeDescription = attributeDescriptionMap.get(prefixedAttributeName);

    if (!attributeDescription || !isNumberOrNumberArray(value)) {
      throw Error('Unknown attribute name ' + prefixedAttributeName);
    }

    writeAttributeToBuffer(buffer, value as number | number[], byteOffset, attributeDescription);
  }

  return byteOffset + totalAttributeSize;
}
