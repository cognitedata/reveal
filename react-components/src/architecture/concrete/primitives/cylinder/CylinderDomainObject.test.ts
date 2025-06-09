import { assert, describe, expect, test } from 'vitest';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { isEmpty } from '../../../base/utilities/TranslateInput';
import { SolidPrimitiveRenderStyle } from '../common/SolidPrimitiveRenderStyle';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { type CylinderDomainObject } from './CylinderDomainObject';
import { Cylinder } from '../../../base/utilities/primitives/Cylinder';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { MeasureCylinderDomainObject } from '../../measurements/MeasureCylinderDomainObject';

describe('CylinderDomainObject', () => {
  test('should initialize with correct default values', () => {
    for (const primitiveType of [
      PrimitiveType.Cylinder,
      PrimitiveType.HorizontalCylinder,
      PrimitiveType.VerticalCylinder,
      PrimitiveType.HorizontalCircle
    ]) {
      const domainObject = createCylinderDomainObject(primitiveType);
      expect(domainObject.primitiveType).toBe(primitiveType);
      expect(domainObject.cylinder).toBeDefined();
      expect(domainObject.icon?.length).greaterThan(0);
      expect(isEmpty(domainObject.typeName)).toBe(false);
      expect(domainObject.renderStyle).toBeInstanceOf(SolidPrimitiveRenderStyle);
      expect(domainObject.createTransaction(Changes.geometry)).toBeDefined();
    }
  });

  test('Should be cloned', () => {
    const domainObject = createCylinderDomainObject(PrimitiveType.Cylinder);
    const clone = domainObject.clone();

    expect(clone).not.toBe(domainObject);
    expect(clone).toBeInstanceOf(MeasureCylinderDomainObject);
    if (!(clone instanceof MeasureCylinderDomainObject)) {
      return;
    }
    expect(clone.cylinder).toStrictEqual(domainObject.cylinder);
    expect(clone.color).toStrictEqual(domainObject.color);
    expect(clone.uniqueId).toBe(domainObject.uniqueId);
    expect(clone.name).toBe(domainObject.name);
    expect(clone.renderStyle).toStrictEqual(domainObject.renderStyle);
  });

  test('Should create info', () => {
    testMe(PrimitiveType.Cylinder, Quantity.Length, 3);
    testMe(PrimitiveType.Cylinder, Quantity.Area, 1);
    testMe(PrimitiveType.Cylinder, Quantity.Volume, 1);

    testMe(PrimitiveType.HorizontalCircle, Quantity.Length, 2);
    testMe(PrimitiveType.HorizontalCircle, Quantity.Area, 1);

    function testMe(primitiveType: PrimitiveType, quantity: Quantity, expectedItems: number): void {
      const domainObject = createCylinderDomainObject(primitiveType);
      expect(domainObject.hasPanelInfo).toBe(true);
      const info = domainObject.getPanelInfo();
      expect(info).toBeDefined();
      assert(info !== undefined);
      expect(info.getItemsByQuantity(quantity)).toHaveLength(expectedItems);
    }
  });
});

function createCylinderDomainObject(primitiveType: PrimitiveType): CylinderDomainObject {
  const domainObject = new MeasureCylinderDomainObject(primitiveType);
  switch (primitiveType) {
    case PrimitiveType.HorizontalCircle:
      domainObject.cylinder.copy(createHorizontalCircle());
      break;
    case PrimitiveType.HorizontalCylinder:
      domainObject.cylinder.copy(createHorizontalCylinder());
      break;
    case PrimitiveType.VerticalCylinder:
      domainObject.cylinder.copy(createVerticalCylinder());
      break;
    default:
      domainObject.cylinder.copy(createCylinder());
  }
  return domainObject;
}

function createHorizontalCircle(): Cylinder {
  const primitive = new Cylinder();
  primitive.radius = 1;
  primitive.centerA.set(1, 2, 3 + Cylinder.HalfMinSize);
  primitive.centerB.set(1, 2, 3 - Cylinder.HalfMinSize);
  return primitive;
}

function createCylinder(): Cylinder {
  const primitive = new Cylinder();
  primitive.radius = 1;
  primitive.centerA.set(1, 2, 3);
  primitive.centerB.set(4, 5, 6);
  return primitive;
}

function createHorizontalCylinder(): Cylinder {
  const primitive = new Cylinder();
  primitive.radius = 1;
  primitive.centerA.set(0, 0, 3);
  primitive.centerB.set(2, 0, 3);
  return primitive;
}

function createVerticalCylinder(): Cylinder {
  const primitive = new Cylinder();
  primitive.radius = 1;
  primitive.centerA.set(3, 0, 0);
  primitive.centerB.set(3, 0, 2);
  return primitive;
}
