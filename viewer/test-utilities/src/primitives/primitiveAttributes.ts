/*!
 * Copyright 2021 Cognite AS
 */

import { assertNever } from '../../../packages/utilities';

import { PrimitiveType } from './primitiveTypes';

type AttributeDescriptionName = 'byte4' | 'float' | 'vec3' | 'vec4' | 'mat4';
type AttributeComponentType = 'float' | 'byte';

export function getComponentByteSize(type: AttributeComponentType): number {
  switch (type) {
    case 'float':
      return 4;
    case 'byte':
      return 1;
    default:
      assertNever(type);
  }
}

export function getShouldNormalize(type: AttributeComponentType): boolean {
  switch (type) {
    case 'byte':
      return true;
    default:
      return false;
  }
}

export type AttributeFormat = {
  name: AttributeDescriptionName;
  numComponents: number;
  componentType: AttributeComponentType;
};

const attributeDescList: AttributeFormat[] = [
  { name: 'byte4', numComponents: 4, componentType: 'byte' },
  { name: 'float', numComponents: 1, componentType: 'float' },
  { name: 'vec3', numComponents: 3, componentType: 'float' },
  { name: 'vec4', numComponents: 4, componentType: 'float' },
  { name: 'mat4', numComponents: 16, componentType: 'float' }
];

export const attributeFormatMap: Map<AttributeDescriptionName, AttributeFormat> = new Map(
  attributeDescList.map(desc => [desc.name, desc])
);

const byte4Desc = attributeFormatMap.get('byte4')!;
const floatDesc = attributeFormatMap.get('float')!;
const vec3Desc = attributeFormatMap.get('vec3')!;
const vec4Desc = attributeFormatMap.get('vec4')!;
const mat4Desc = attributeFormatMap.get('mat4')!;

export const commonAttributeTypeMap: Map<string, AttributeFormat> = new Map([
  ['_treeIndex', floatDesc],
  ['_color', byte4Desc],
  ['_center', vec3Desc],
  ['_centerA', vec3Desc],
  ['_centerB', vec3Desc],
  ['_normal', vec3Desc],
  ['_instanceMatrix', mat4Desc],
  ['_radius', floatDesc],
  ['_radiusA', floatDesc],
  ['_radiusB', floatDesc],
  ['_angle', floatDesc],
  ['_arcAngle', floatDesc],
  ['_localXAxis', vec3Desc],
  ['_thickness', floatDesc],
  ['_tubeRadius', floatDesc],
  ['_horizontalRadius', floatDesc],
  ['_verticalRadius', floatDesc],
  ['_planeA', vec4Desc],
  ['_planeB', vec4Desc],
  ['_height', floatDesc]
]);

export type AttributeDesc = {
  name: string;
  format: AttributeFormat;
  byteOffset: number;
};

const primitiveAttributeNameMap: Map<PrimitiveType, string[]> = new Map([
  [
    PrimitiveType.Ellipsoid,
    ['_treeIndex', '_color', '_center', '_normal', '_horizontalRadius', '_verticalRadius', '_height']
  ],
  [PrimitiveType.Box, ['_treeIndex', '_color', '_instanceMatrix']]
]);

export function getAttributeList(primitiveType: PrimitiveType): string[] {
  const attributeList = primitiveAttributeNameMap.get(primitiveType);
  if (!attributeList) {
    throw Error('Primitive type not found in primitiveAttributeNampMap');
  }

  return attributeList;
}

function getTotalAttributeByteSizeByAttributes(attributeNames: string[]): number {
  let sum = 0;
  for (const s of attributeNames) {
    const attributeFormat = commonAttributeTypeMap.get(s)!;
    sum += getComponentByteSize(attributeFormat.componentType) * attributeFormat.numComponents;
  }
  return sum;
}

export function getTotalAttributeSize(name: PrimitiveType): number {
  return getTotalAttributeByteSizeByAttributes(primitiveAttributeNameMap.get(name)!);
}

function createAttributeDescriptions(attributeNames: string[]): AttributeDesc[] {
  let sumByteOffset = 0;
  const resultDescriptions: AttributeDesc[] = [];

  for (const name of attributeNames) {
    const format = commonAttributeTypeMap.get(name)!;
    resultDescriptions.push({
      name,
      format,
      byteOffset: sumByteOffset
    });

    sumByteOffset += getComponentByteSize(format.componentType) * format.numComponents;
  }

  return resultDescriptions;
}

export function createAttributeDescriptionsMap(name: PrimitiveType): Map<string, AttributeDesc> {
  const descList = createAttributeDescriptionsForPrimitive(name);
  return new Map(descList.map(desc => [desc.name, desc]));
}

export function createAttributeDescriptionsForPrimitive(name: PrimitiveType): AttributeDesc[] {
  const attributeList = primitiveAttributeNameMap.get(name)!;
  return createAttributeDescriptions(attributeList);
}
