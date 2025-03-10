/*!
 * Copyright 2025 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { isEmpty } from '../../../base/utilities/TranslateInput';
import { SolidPrimitiveRenderStyle } from '../common/SolidPrimitiveRenderStyle';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { CylinderDomainObject } from './CylinderDomainObject';
import { Cylinder } from '../../../base/utilities/primitives/Cylinder';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';

describe('CylinderDomainObject', () => {
  test('Should be empty', () => {
    for (const primitiveType of [
      PrimitiveType.Cylinder,
      PrimitiveType.HorizontalCylinder,
      PrimitiveType.VerticalCylinder
    ]) {
      const domainObject = createCylinderDomainObject(primitiveType);
      expect(domainObject.primitiveType).toBe(PrimitiveType.Cylinder);
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
    expect(clone).toBeInstanceOf(MockCylinderDomainObject);
    if (!(clone instanceof MockCylinderDomainObject)) {
      return;
    }
    expect(clone.cylinder).toStrictEqual(domainObject.cylinder);
    expect(clone.color).toBe(domainObject.color);
    expect(clone.uniqueId).toBe(domainObject.uniqueId);
    expect(clone.name).toBe(domainObject.name);
    expect(clone.renderStyle).toStrictEqual(domainObject.renderStyle);
  });

  test('Should create info', () => {
    testMe(PrimitiveType.Cylinder, Quantity.Length, 2);
    testMe(PrimitiveType.Cylinder, Quantity.Area, 1);
    testMe(PrimitiveType.Cylinder, Quantity.Volume, 1);

    function testMe(primitiveType: PrimitiveType, quantity: Quantity, expectedItems: number): void {
      const domainObject = createCylinderDomainObject(primitiveType);
      const info = domainObject.getPanelInfo();
      expect(info).toBeDefined();
      if (info === undefined) {
        return;
      }
      expect(info.items.filter((a) => a.quantity === quantity)).toHaveLength(expectedItems);
    }
  });
});

function createCylinderDomainObject(primitiveType: PrimitiveType): CylinderDomainObject {
  const domainObject = new MockCylinderDomainObject();
  switch (primitiveType) {
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

class MockCylinderDomainObject extends CylinderDomainObject {
  public constructor() {
    super();
  }

  public override clone(what?: symbol): DomainObject {
    const clone = new MockCylinderDomainObject();
    clone.copyFrom(this, what);
    return clone;
  }
}
