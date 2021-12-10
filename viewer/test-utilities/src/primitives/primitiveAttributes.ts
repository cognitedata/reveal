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
  ['a_treeIndex', floatDesc],
  ['a_color', byte4Desc],
  ['a_center', vec3Desc],
  ['a_centerA', vec3Desc],
  ['a_centerB', vec3Desc],
  ['a_normal', vec3Desc],
  ['a_instanceMatrix', mat4Desc],
  ['a_radius', floatDesc],
  ['a_radiusA', floatDesc],
  ['a_radiusB', floatDesc],
  ['a_angle', floatDesc],
  ['a_arcAngle', floatDesc],
  ['a_localXAxis', vec3Desc],
  ['a_thickness', floatDesc],
  ['a_tubeRadius', floatDesc],
  ['a_horizontalRadius', floatDesc],
  ['a_verticalRadius', floatDesc],
  ['a_planeA', vec4Desc],
  ['a_planeB', vec4Desc],
  ['a_height', floatDesc],
  ['a_vertex1', vec3Desc],
  ['a_vertex2', vec3Desc],
  ['a_vertex3', vec3Desc],
  ['a_vertex4', vec3Desc]
]);

export type AttributeDesc = {
  name: string;
  format: AttributeFormat;
  byteOffset: number;
};

const primitiveAttributeNameMap: Map<PrimitiveType, string[]> = new Map([
  [PrimitiveType.Box, ['a_treeIndex', 'a_color', 'a_instanceMatrix']],
  [PrimitiveType.Circle, ['a_treeIndex', 'a_color', 'a_instanceMatrix', 'a_normal']],
  [
    PrimitiveType.Cone,
    [
      'a_treeIndex',
      'a_color',
      'a_angle',
      'a_arcAngle',
      'a_centerA',
      'a_centerB',
      'a_localXAxis',
      'a_radiusA',
      'a_radiusB'
    ]
  ],
  [
    PrimitiveType.EccentricCone,
    ['a_treeIndex', 'a_color', 'a_centerA', 'a_centerB', 'a_normal', 'a_radiusA', 'a_radiusB']
  ],
  [
    PrimitiveType.Ellipsoid,
    ['a_treeIndex', 'a_color', 'a_center', 'a_normal', 'a_horizontalRadius', 'a_verticalRadius', 'a_height']
  ],
  [
    PrimitiveType.GeneralCylinder,
    [
      'a_treeIndex',
      'a_color',
      'a_angle',
      'a_arcAngle',
      'a_centerA',
      'a_centerB',
      'a_localXAxis',
      'a_planeA',
      'a_planeB',
      'a_radius'
    ]
  ],
  [
    PrimitiveType.GeneralRing,
    ['a_treeIndex', 'a_color', 'a_angle', 'a_arcAngle', 'a_instanceMatrix', 'a_normal', 'a_thickness']
  ],
  [PrimitiveType.Quad, ['a_treeIndex', 'a_color', 'a_instanceMatrix']],
  [PrimitiveType.Torus, ['a_treeIndex', 'a_color', 'a_arcAngle', 'a_instanceMatrix', 'a_radius', 'a_tubeRadius']],
  [PrimitiveType.Trapezium, ['a_treeIndex', 'a_color', 'a_vertex1', 'a_vertex2', 'a_vertex3', 'a_vertex4']],
  [PrimitiveType.Nut, ['a_instanceMatrix']]
]);

export function getAttributeList(primitiveType: PrimitiveType): string[] {
  const attributeList = primitiveAttributeNameMap.get(primitiveType);
  if (!attributeList) {
    throw Error('Primitive type not found in primitiveAttributeNampMap');
  }

  return attributeList;
}

export function computeTotalAttributeByteSize(name: PrimitiveType): number {
  const attributeNames = primitiveAttributeNameMap.get(name)!;

  let sum = 0;
  for (const s of attributeNames) {
    const attributeFormat = commonAttributeTypeMap.get(s)!;
    sum += getComponentByteSize(attributeFormat.componentType) * attributeFormat.numComponents;
  }
  return sum;
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
