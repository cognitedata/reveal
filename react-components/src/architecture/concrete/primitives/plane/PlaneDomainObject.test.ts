import { assert, describe, expect, test } from 'vitest';
import {
  PlanePrimitiveTypes,
  PrimitiveType
} from '../../../base/utilities/primitives/PrimitiveType';
import { isEmpty, type TranslationKey } from '../../../base/utilities/translation/TranslateInput';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { PlaneDomainObject } from './PlaneDomainObject';
import { Vector3 } from 'three';
import { SolidPrimitiveRenderStyle } from '../common/SolidPrimitiveRenderStyle';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { isGreyScale } from '../../../base/utilities/colors/colorUtils';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';

describe(PlaneDomainObject.name, () => {
  test('should initialize with correct default values', () => {
    for (const primitiveType of PlanePrimitiveTypes) {
      const domainObject = createPlaneDomainObjectMock(primitiveType);
      expect(domainObject.primitiveType).toBe(primitiveType);
      expect(isGreyScale(domainObject.color)).toBe(false);
      expect(isGreyScale(domainObject.backSideColor)).toBe(false);
      expect(domainObject.icon?.length).greaterThan(0);
      expect(isEmpty(domainObject.typeName)).toBe(false);
      expect(domainObject.renderStyle).instanceOf(SolidPrimitiveRenderStyle);
      expect(domainObject.createTransaction(Changes.geometry)).toBeDefined();
      expect(domainObject.getEditToolCursor(createFullRenderTargetMock(), new Vector3())).toBe(
        'move'
      );
    }
  });

  test('should be cloned', () => {
    const domainObject = createPlaneDomainObjectMock(PrimitiveType.PlaneZ);

    const clone = domainObject.clone();
    expect(clone).toBeInstanceOf(PlaneDomainObjectMock);
    expect(clone).not.toBe(domainObject);
    if (!(clone instanceof PlaneDomainObjectMock)) {
      return;
    }
    expect(clone.primitiveType).toStrictEqual(domainObject.primitiveType);
    expect(clone.icon).toBe(domainObject.icon);
    expect(clone.name).toBe(domainObject.name);
    expect(clone.uniqueId).toBe(domainObject.uniqueId);
    expect(clone.plane).toStrictEqual(domainObject.plane);
    expect(clone.color).toStrictEqual(domainObject.color);
    expect(clone.backSideColor).toStrictEqual(domainObject.backSideColor);
    expect(clone.renderStyle).toStrictEqual(domainObject.renderStyle);
  });

  test('should create info', () => {
    testMe(PrimitiveType.PlaneX, Quantity.Length, 1);
    testMe(PrimitiveType.PlaneY, Quantity.Length, 1);
    testMe(PrimitiveType.PlaneZ, Quantity.Length, 1);
    testMe(PrimitiveType.PlaneXY, Quantity.Length, 1);
    testMe(PrimitiveType.PlaneXY, Quantity.Angle, 1);

    function testMe(primitiveType: PrimitiveType, quantity: Quantity, expectedItems: number): void {
      const domainObject = createPlaneDomainObjectMock(primitiveType);
      expect(domainObject.hasPanelInfo).toBe(true);
      const info = domainObject.getPanelInfo();
      expect(info).toBeDefined();
      if (info === undefined) {
        return;
      }
      expect(info.items.filter((a) => a.quantity === quantity)).toHaveLength(expectedItems);
    }
  });

  test('should set and get angle in degrees', () => {
    const domainObject = createPlaneDomainObjectMock(PrimitiveType.PlaneXY);
    for (let expectedAngle = 0; expectedAngle < 360; expectedAngle += 30) {
      // Also Check that the coordinate should not change when setting angle
      const coordinate = domainObject.coordinate;
      domainObject.horizontalAngleInDegrees = expectedAngle;

      expect(domainObject.horizontalAngleInDegrees).toBeCloseTo(expectedAngle);
      expect(domainObject.coordinate).toBeCloseTo(coordinate);
    }
  });

  test('should set and get coordinate', () => {
    for (const primitiveType of PlanePrimitiveTypes) {
      const domainObject = createPlaneDomainObjectMock(primitiveType);
      for (const expectedCoordinate of [-10, 0, 10]) {
        domainObject.coordinate = expectedCoordinate;
        expect(domainObject.coordinate).toBeCloseTo(expectedCoordinate);
      }
    }
  });

  test('should be cloned', () => {
    testMe(PrimitiveType.PlaneX, Quantity.Length, 1);
    testMe(PrimitiveType.PlaneY, Quantity.Length, 1);
    testMe(PrimitiveType.PlaneZ, Quantity.Length, 1);
    testMe(PrimitiveType.PlaneXY, Quantity.Length, 1);
    testMe(PrimitiveType.PlaneXY, Quantity.Angle, 1);

    function testMe(primitiveType: PrimitiveType, quantity: Quantity, expectedItems: number): void {
      const domainObject = createPlaneDomainObjectMock(primitiveType);
      expect(domainObject.hasPanelInfo).toBe(true);
      const info = domainObject.getPanelInfo();
      expect(info).toBeDefined();
      if (info === undefined) {
        return;
      }
      expect(info.items.filter((a) => a.quantity === quantity)).toHaveLength(expectedItems);
    }
  });

  test('should set and get angle in degrees', () => {
    const domainObject = createPlaneDomainObjectMock(PrimitiveType.PlaneXY);
    for (let expectedAngle = 0; expectedAngle < 360; expectedAngle += 30) {
      // Also Check that the coordinate should not change when setting angle
      const coordinate = domainObject.coordinate;
      domainObject.horizontalAngleInDegrees = expectedAngle;

      expect(domainObject.horizontalAngleInDegrees).toBeCloseTo(expectedAngle);
      expect(domainObject.coordinate).toBeCloseTo(coordinate);
    }
  });

  test('should be flip', () => {
    const domainObject = createPlaneDomainObjectMock(PrimitiveType.PlaneZ);
    const expectedPlane = domainObject.plane.clone().negate();
    domainObject.flip();
    expect(domainObject.plane).toStrictEqual(expectedPlane);
  });

  test('should be make flipping consistent', () => {
    const root = createFullRenderTargetMock().root;
    // Add some not related planes
    root.addChild(createPlaneDomainObjectMock(PrimitiveType.PlaneX));
    root.addChild(createPlaneDomainObjectMock(PrimitiveType.PlaneY));

    // Add planes to test
    const domainObject1 = createPlaneDomainObjectMock(PrimitiveType.PlaneZ);
    const domainObject2 = createPlaneDomainObjectMock(PrimitiveType.PlaneZ);
    root.addChild(domainObject1);
    root.addChild(domainObject2);

    // When sign = 1, the planes are ok
    // When sign = -1, both planes has to be flipped.
    for (const sign of [1, -1]) {
      domainObject1.plane.setFromNormalAndCoplanarPoint(
        new Vector3(0, 0, -1),
        new Vector3(0, 0, sign)
      );
      domainObject2.plane.setFromNormalAndCoplanarPoint(
        new Vector3(0, 0, +1),
        new Vector3(0, 0, -sign)
      );
      const expectedPlane1 = domainObject1.plane.clone();
      const expectedPlane2 = domainObject2.plane.clone();
      if (sign < 0) {
        expectedPlane1.negate();
        expectedPlane2.negate();
      }

      domainObject1.makeFlippingConsistent();
      expect(domainObject1.plane).toStrictEqual(expectedPlane1);
      expect(domainObject2.plane).toStrictEqual(expectedPlane2);
    }
  });

  test('should be make flipping consistent when added new planes', () => {
    const root = createFullRenderTargetMock().root;
    const domainObject1 = createPlaneDomainObjectMock(PrimitiveType.PlaneZ);
    const domainObject2 = createPlaneDomainObjectMock(PrimitiveType.PlaneZ);

    // When sign = 1, the planes are ok
    // When sign = -1, both planes has to be flipped.
    domainObject1.plane.setFromNormalAndCoplanarPoint(new Vector3(0, 0, -1), new Vector3(0, 0, -1));
    domainObject2.plane.setFromNormalAndCoplanarPoint(new Vector3(0, 0, +1), new Vector3(0, 0, 1));

    const expectedPlane1 = domainObject1.plane.clone();
    const expectedPlane2 = domainObject2.plane.clone();
    expectedPlane1.negate();
    expectedPlane2.negate();

    root.addChildInteractive(domainObject1);
    root.addChildInteractive(domainObject2);

    expect(domainObject1.plane).toStrictEqual(expectedPlane1);
    expect(domainObject2.plane).toStrictEqual(expectedPlane2);
  });

  test('Should set value by panel-info.item for coordinate', () => {
    const keys: TranslationKey[] = [
      'X:COORDINATE',
      'Y_COORDINATE',
      'Z_COORDINATE',
      'DISTANCE_TO_ORIGIN'
    ];

    for (let index = 0; index < PlanePrimitiveTypes.length; index++) {
      const domainObject = createPlaneDomainObjectMock(PlanePrimitiveTypes[index]);
      const info = domainObject.getPanelInfo();
      const item = info?.getItemTranslationKey(keys[index]);

      expect(item).toBeDefined();
      assert(item !== undefined);

      expect(item.setValue).toBeDefined();
      expect(item.verifyValue).toBeUndefined();
      assert(item.setValue !== undefined);

      const expectedValue = 1 + index;
      item.setValue(expectedValue);
      expect(domainObject.coordinate).toBeCloseTo(expectedValue);
    }
  });

  test('Should set value by panel-info.item for horizontal angle', () => {
    const domainObject = createPlaneDomainObjectMock(PrimitiveType.PlaneXY);
    const info = domainObject.getPanelInfo();
    const item = info?.getItemTranslationKey('HORIZONTAL_ANGLE');

    expect(item).toBeDefined();
    assert(item !== undefined);
    expect(item.setValue).toBeDefined();
    expect(item.verifyValue).toBeUndefined();
    assert(item.setValue !== undefined);

    const expectedValue = 10;
    item.setValue(expectedValue);
    expect(domainObject.horizontalAngleInDegrees).toBeCloseTo(expectedValue);
  });
});

export function createPlaneDomainObjectMock(primitiveType: PrimitiveType): PlaneDomainObject {
  const domainObject = new PlaneDomainObjectMock(primitiveType);
  const point = new Vector3(2, 3, 4);
  switch (primitiveType) {
    case PrimitiveType.PlaneX:
      domainObject.plane.setFromNormalAndCoplanarPoint(new Vector3(1, 0, 0), point);
      break;

    case PrimitiveType.PlaneY:
      domainObject.plane.setFromNormalAndCoplanarPoint(new Vector3(0, 1, 0), point);
      break;

    case PrimitiveType.PlaneZ:
      domainObject.plane.setFromNormalAndCoplanarPoint(new Vector3(0, 0, 1), point);
      break;

    case PrimitiveType.PlaneXY:
      domainObject.plane.setFromNormalAndCoplanarPoint(new Vector3(1, 1, 0).normalize(), point);
      break;
  }
  return domainObject;
}

export class PlaneDomainObjectMock extends PlaneDomainObject {
  public override clone(what?: symbol): DomainObject {
    const clone = new PlaneDomainObjectMock(this.primitiveType);
    clone.copyFrom(this, what);
    return clone;
  }
}
