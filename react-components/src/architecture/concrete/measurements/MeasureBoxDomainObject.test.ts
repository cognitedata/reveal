/*!
 * Copyright 2025 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { MeasureBoxDomainObject } from './MeasureBoxDomainObject';
import { PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
import { isEmpty } from '../../base/utilities/TranslateInput';
import { Box } from '../../base/utilities/primitives/Box';
import { SolidPrimitiveRenderStyle } from '../primitives/common/SolidPrimitiveRenderStyle';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { DomainObjectTransaction } from '../../base/undo/DomainObjectTransaction';

describe('MeasureBoxDomainObject', () => {
  test('Should be empty', () => {
    const domainObject = new MeasureBoxDomainObject(PrimitiveType.Box);
    expect(domainObject.primitiveType).toBe(PrimitiveType.Box);
    expect(domainObject.color.getHex()).toBe(0xff00ff);
    expect(domainObject.box).toBeDefined();
    expect(domainObject.icon?.length).greaterThan(0);
    expect(isEmpty(domainObject.typeName)).toBe(false);
    expect(domainObject.renderStyle).instanceOf(SolidPrimitiveRenderStyle);
    expect(domainObject.createTransaction(Changes.geometry)).instanceOf(DomainObjectTransaction);
  });

  test('Should check canRotateComponent', () => {
    const domainObject = new MeasureBoxDomainObject(PrimitiveType.Box);
    expect(domainObject.canRotateComponent(0)).toBe(false);
    expect(domainObject.canRotateComponent(1)).toBe(false);
    expect(domainObject.canRotateComponent(2)).toBe(true);
  });

  test('Should be cloned', () => {
    const domainObject = createBoxDomainObject(PrimitiveType.Box);
    const clone = domainObject.clone();

    expect(clone).instanceOf(MeasureBoxDomainObject);
    expect(clone).not.toBe(domainObject);
    if (!(clone instanceof MeasureBoxDomainObject)) {
      return;
    }
    expect(clone.box).toStrictEqual(domainObject.box);
    expect(clone.color).toBe(domainObject.color);
    expect(clone.uniqueId).toBe(domainObject.uniqueId);
    expect(clone.name).toBe(domainObject.name);
    expect(clone.renderStyle).toStrictEqual(domainObject.renderStyle);
  });

  test('Should create info', () => {
    testMe(PrimitiveType.Box, 6);
    testMe(PrimitiveType.HorizontalArea, 4);
    testMe(PrimitiveType.VerticalArea, 4);

    function testMe(primitiveType: PrimitiveType, expectedItems: number): void {
      const domainObject = createBoxDomainObject(primitiveType);
      const info = domainObject.getPanelInfo();
      expect(info).toBeDefined();
      if (info === undefined) {
        return;
      }
      expect(info.items).toHaveLength(expectedItems);
    }
  });
});

function createBoxDomainObject(primitiveType: PrimitiveType): MeasureBoxDomainObject {
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
