import { assert, describe, expect, test } from 'vitest';
import { MeasureBoxDomainObject } from '../../measurements/MeasureBoxDomainObject';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { isEmpty } from '../../../base/utilities/TranslateInput';
import { Box } from '../../../base/utilities/primitives/Box';
import { SolidPrimitiveRenderStyle } from '../common/SolidPrimitiveRenderStyle';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { BoxDomainObject } from './BoxDomainObject';
import { MeasurePointDomainObject } from '../../measurements/MeasurePointDomainObject';

describe(BoxDomainObject.name, () => {
  test('should initialize with correct default values', () => {
    for (const primitiveType of [
      PrimitiveType.Box,
      PrimitiveType.HorizontalArea,
      PrimitiveType.VerticalArea,
      PrimitiveType.Point
    ]) {
      const isPoint = primitiveType === PrimitiveType.Point;
      const domainObject = createDomainObject(primitiveType);
      expect(domainObject.primitiveType).toBe(primitiveType);
      expect(domainObject.color.getHex()).toBe(isPoint ? 0x00bfff : 0xff00ff);
      expect(domainObject.box).toBeDefined();
      expect(domainObject.icon?.length).greaterThan(0);
      expect(domainObject.label).toBeDefined();
      expect(isEmpty(domainObject.typeName)).toBe(false);
      expect(domainObject.renderStyle).toBeInstanceOf(SolidPrimitiveRenderStyle);
      expect(domainObject.createTransaction(Changes.geometry)).toBeDefined();
    }
  });

  test('Should check edit constrains for box', () => {
    const domainObject = createDomainObject(PrimitiveType.Box);
    expect(domainObject.canRotateComponent(0)).toBe(false);
    expect(domainObject.canRotateComponent(1)).toBe(false);
    expect(domainObject.canRotateComponent(2)).toBe(true);
    expect(domainObject.canMoveCorners()).toBe(true);
  });

  test('Should check edit constrains for point', () => {
    const domainObject = createDomainObject(PrimitiveType.Point);
    expect(domainObject.canRotateComponent(0)).toBe(false);
    expect(domainObject.canRotateComponent(1)).toBe(false);
    expect(domainObject.canRotateComponent(2)).toBe(false);
    expect(domainObject.canMoveCorners()).toBe(false);
  });

  test('Should clone box', () => {
    const domainObject = createDomainObject(PrimitiveType.Box);
    const clone = domainObject.clone();

    expect(clone).toBeInstanceOf(MeasureBoxDomainObject);
    expect(clone).not.toBe(domainObject);
    assert(clone instanceof MeasureBoxDomainObject);

    expect(clone.box).toStrictEqual(domainObject.box);
    expect(clone.color).toStrictEqual(domainObject.color);
    expect(clone.uniqueId).toBe(domainObject.uniqueId);
    expect(clone.name).toBe(domainObject.name);
    expect(clone.renderStyle).toStrictEqual(domainObject.renderStyle);
  });

  test('Should clone point', () => {
    const domainObject = createDomainObject(PrimitiveType.Point);
    const clone = domainObject.clone();

    expect(clone).toBeInstanceOf(MeasurePointDomainObject);
    expect(clone).not.toBe(domainObject);
    assert(clone instanceof MeasurePointDomainObject);

    expect(clone.box).toStrictEqual(domainObject.box);
    expect(clone.color).toStrictEqual(domainObject.color);
    expect(clone.uniqueId).toBe(domainObject.uniqueId);
    expect(clone.name).toBe(domainObject.name);
    expect(clone.renderStyle).toStrictEqual(domainObject.renderStyle);
  });

  test('Should create info', () => {
    testMe(PrimitiveType.Box, Quantity.Length, 3);
    testMe(PrimitiveType.Box, Quantity.Area, 1);
    testMe(PrimitiveType.Box, Quantity.Volume, 1);
    testMe(PrimitiveType.Box, Quantity.Angle, 1);

    testMe(PrimitiveType.HorizontalArea, Quantity.Length, 2);
    testMe(PrimitiveType.HorizontalArea, Quantity.Area, 1);
    testMe(PrimitiveType.HorizontalArea, Quantity.Volume, 0);
    testMe(PrimitiveType.HorizontalArea, Quantity.Angle, 1);

    testMe(PrimitiveType.VerticalArea, Quantity.Length, 2);
    testMe(PrimitiveType.VerticalArea, Quantity.Area, 1);
    testMe(PrimitiveType.VerticalArea, Quantity.Volume, 0);
    testMe(PrimitiveType.VerticalArea, Quantity.Angle, 1);

    testMe(PrimitiveType.Point, Quantity.Length, 3);
    testMe(PrimitiveType.Point, Quantity.Area, 0);
    testMe(PrimitiveType.Point, Quantity.Volume, 0);
    testMe(PrimitiveType.Point, Quantity.Angle, 0);

    function testMe(primitiveType: PrimitiveType, quantity: Quantity, expectedItems: number): void {
      const domainObject = createDomainObject(primitiveType);
      expect(domainObject.hasPanelInfo).toBe(true);
      const info = domainObject.getPanelInfo();
      expect(info).toBeDefined();
      assert(info !== undefined);
      expect(info.getItemsByQuantity(quantity)).toHaveLength(expectedItems);
    }
  });
});

function createDomainObject(primitiveType: PrimitiveType): BoxDomainObject {
  if (primitiveType === PrimitiveType.Point) {
    const domainObject = new MeasurePointDomainObject();
    domainObject.point = createBox().center;
    return domainObject;
  }
  const domainObject = new MeasureBoxDomainObject(primitiveType);
  switch (primitiveType) {
    case PrimitiveType.HorizontalArea:
      domainObject.box.copy(createHorizontalArea());
      break;
    case PrimitiveType.VerticalArea:
      domainObject.box.copy(createVerticalArea());
      break;
    default:
      domainObject.box.copy(createBox());
  }
  return domainObject;
}

function createBox(): Box {
  const primitive = new Box();
  primitive.size.set(1, 2, 3);
  primitive.center.set(4, 5, 6);
  primitive.rotation.set(0.0, 0.0, 0.3);
  return primitive;
}

function createHorizontalArea(): Box {
  const primitive = new Box();
  primitive.size.set(1, 2, Box.MinSize);
  primitive.center.set(4, 5, 6);
  primitive.rotation.set(0, 0, 0.3);
  return primitive;
}

function createVerticalArea(): Box {
  const primitive = new Box();
  primitive.size.set(1, Box.MinSize, 2);
  primitive.center.set(4, 5, 6);
  primitive.rotation.set(0, 0, 0.3);
  return primitive;
}
