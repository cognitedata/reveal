import { assert, describe, expect, test } from 'vitest';
import { MeasurePointDomainObject } from './MeasurePointDomainObject';
import { Vector3 } from 'three';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { SolidPrimitiveRenderStyle } from '../../primitives/common/SolidPrimitiveRenderStyle';
import { isEmpty, type TranslationKey } from '../../../base/utilities/translation/TranslateInput';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';

describe(MeasurePointDomainObject.name, () => {
  test('should initialize with correct default values', () => {
    const domainObject = createMeasurePointDomainObject();
    expect(domainObject.primitiveType).toBe(PrimitiveType.Point);
    expect(domainObject.color.getHex()).toBe(0x00bfff);
    expect(domainObject.icon).toBe('Waypoint');
    expect(domainObject.label).toBeDefined();
    expect(isEmpty(domainObject.typeName)).toBe(false);
    expect(domainObject.renderStyle).toBeInstanceOf(SolidPrimitiveRenderStyle);
  });

  test('Should set and get the point', () => {
    const domainObject = createMeasurePointDomainObject();
    const expectedPoint = new Vector3(2, 3, 4);
    domainObject.point = expectedPoint;
    expect(domainObject.point).toStrictEqual(expectedPoint);
  });

  test('Should set and get the point size', () => {
    const domainObject = createMeasurePointDomainObject();
    const expectedSize = 3.14;
    domainObject.size = expectedSize;
    expect(domainObject.size).toBe(expectedSize);
  });

  test('Should check edit constrains', () => {
    const domainObject = createMeasurePointDomainObject();
    expect(domainObject.canRotateComponent(0)).toBe(false);
    expect(domainObject.canRotateComponent(1)).toBe(false);
    expect(domainObject.canRotateComponent(2)).toBe(false);
    expect(domainObject.canMoveCorners()).toBe(false);
  });

  test('Should clone point', () => {
    const domainObject = createMeasurePointDomainObject();
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
    const domainObject = createMeasurePointDomainObject();
    expect(domainObject.hasPanelInfo).toBe(true);
    const info = domainObject.getPanelInfo();
    expect(info).toBeDefined();
    assert(info !== undefined);

    expect(info.getItemsByQuantity(Quantity.Length)).toHaveLength(4);
    expect(info.getItemsByQuantity(Quantity.Area)).toHaveLength(0);
    expect(info.getItemsByQuantity(Quantity.Volume)).toHaveLength(0);
    expect(info.getItemsByQuantity(Quantity.Angle)).toHaveLength(0);
  });

  test('Should set value by panel-info.item for center', () => {
    const domainObject = createMeasurePointDomainObject();
    const info = domainObject.getPanelInfo();

    const keys: TranslationKey[] = ['X:COORDINATE', 'Y_COORDINATE', 'Z_COORDINATE'];
    let component = 0;

    let expectedValue = 10;
    for (const key of keys) {
      const item = info?.getItemTranslationKey(key);
      expect(item).toBeDefined();
      assert(item !== undefined);

      expect(item.setValue).toBeDefined();
      expect(item.verifyValue).toBeDefined();
      assert(item.setValue !== undefined);
      assert(item.verifyValue !== undefined);

      for (const value of [-expectedValue, 0, expectedValue]) {
        expect(item.verifyValue(value)).toBe(true);
      }
      item.setValue(expectedValue);
      expect(domainObject.box.center.getComponent(component)).toBeCloseTo(expectedValue);
      component++;
      expectedValue *= 2;
    }
  });

  test('Should set value by panel-info.item for point size', () => {
    const domainObject = createMeasurePointDomainObject();
    const info = domainObject.getPanelInfo();

    const item = info?.getItemTranslationKey('POINT_SIZE');
    expect(item).toBeDefined();
    assert(item !== undefined);

    expect(item.setValue).toBeDefined();
    expect(item.verifyValue).toBeDefined();
    assert(item.setValue !== undefined);
    assert(item.verifyValue !== undefined);

    const expectedValue = 10;

    for (const value of [-expectedValue, 0, expectedValue]) {
      expect(item.verifyValue(value)).toBe(value > 0);
    }
    item.setValue(expectedValue);
    expect(domainObject.size).toBeCloseTo(expectedValue);
  });
});

function createMeasurePointDomainObject(): MeasurePointDomainObject {
  const domainObject = new MeasurePointDomainObject();
  domainObject.point = new Vector3(4, 5, 6);
  return domainObject;
}
