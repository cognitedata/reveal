/*!
 * Copyright 2025 Cognite AS
 */

import { assert, describe, expect, test } from 'vitest';
import { isEmpty } from '../../base/utilities/TranslateInput';
import { Quantity } from '../../base/domainObjectsHelpers/Quantity';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { ExampleDomainObject } from './ExampleDomainObject';
import { Vector3 } from 'three';
import { ExampleRenderStyle } from './ExampleRenderStyle';
import { PopupStyle } from '../../base/domainObjectsHelpers/PopupStyle';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';

describe(ExampleDomainObject.name, () => {
  test('should initialize with correct default values', () => {
    const domainObject = createExampleDomainObject();
    expect(domainObject.center).toStrictEqual(new Vector3(1, 2, 3));
    expect(domainObject.icon?.length).greaterThan(0);
    expect(isEmpty(domainObject.typeName)).toBe(false);
    expect(domainObject.renderStyle).toBeInstanceOf(ExampleRenderStyle);
    expect(domainObject.createTransaction(Changes.geometry)).toBeDefined();
  });

  test('Should be cloned', () => {
    const domainObject = createExampleDomainObject();
    const clone = domainObject.clone();
    expect(clone).toStrictEqual(domainObject);
  });

  test('Should have edit cursor', () => {
    const domainObject = createExampleDomainObject();
    const cursor = domainObject.getEditToolCursor(createFullRenderTargetMock(), new Vector3());
    expect(cursor).toBe('move');
  });

  test('Should create info with 3 length quantities', () => {
    const domainObject = createExampleDomainObject();
    expect(domainObject.hasPanelInfo).toBe(true);
    expect(domainObject.getPanelInfoStyle()).instanceOf(PopupStyle);

    const info = domainObject.getPanelInfo();
    expect(info).toBeDefined();
    assert(info !== undefined);
    expect(info.getItemsByQuantity(Quantity.Length)).toHaveLength(3);
  });
});

export function createExampleDomainObject(): ExampleDomainObject {
  const domainObject = new ExampleDomainObject();
  domainObject.center.set(1, 2, 3);
  return domainObject;
}
