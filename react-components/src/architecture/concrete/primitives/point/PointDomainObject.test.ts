import { assert, describe, expect, test } from 'vitest';
import { PointDomainObject } from './PointDomainObject';
import { Quantity } from '../../../base/domainObjectsHelpers/Quantity';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { PointRenderStyle } from './PointRenderStyle';
import { isEmpty } from '../../../base/utilities/TranslateInput';
import { PopupStyle } from '../../../base/domainObjectsHelpers/PopupStyle';
import { createFullRenderTargetMock } from '../../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { Vector3 } from 'three';
import { MeasurePointDomainObject } from '../../measurements/MeasurePointDomainObject';

describe(PointDomainObject.name, () => {
  test('should initialize with correct default values', () => {
    const domainObject = createPointDomainObject();
    expect(domainObject.point).toStrictEqual(new Vector3(1, 2, 3));
    expect(domainObject.icon?.length).greaterThan(0);
    expect(isEmpty(domainObject.typeName)).toBe(false);
    expect(domainObject.getRenderStyle()).toBeInstanceOf(PointRenderStyle);
    expect(domainObject.createTransaction(Changes.geometry)).toBeDefined();
  });

  test('Should be cloned', () => {
    const domainObject = createPointDomainObject();
    const clone = domainObject.clone();
    expect(clone).toStrictEqual(domainObject);
  });

  test('should return correct edit tool cursor', () => {
    const domainObject = createPointDomainObject();
    const cursor = domainObject.getEditToolCursor(createFullRenderTargetMock(), new Vector3());
    expect(cursor).toBe('move');
  });

  test('Should create info with 3 length quantities', () => {
    const domainObject = createPointDomainObject();
    expect(domainObject.hasPanelInfo).toBe(true);
    expect(domainObject.getPanelInfoStyle()).instanceOf(PopupStyle);

    const info = domainObject.getPanelInfo();
    expect(info).toBeDefined();
    assert(info !== undefined);
    expect(info.getItemsByQuantity(Quantity.Length)).toHaveLength(3);
  });
});

function createPointDomainObject(): PointDomainObject {
  const domainObject = new MeasurePointDomainObject();
  domainObject.point.set(1, 2, 3);
  return domainObject;
}
