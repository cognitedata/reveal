/*!
 * Copyright 2025 Cognite AS
 */
import { beforeEach, describe, expect, test } from 'vitest';
import { TerrainDomainObject } from './TerrainDomainObject';
import { createTerrainDomainObject } from './TerrainThreeView.test';
import { isEmpty } from '../../base/utilities/TranslateInput';
import { isGreyScale } from '../../base/utilities/colors/colorExtensions';
import { TerrainRenderStyle } from './TerrainRenderStyle';

describe(TerrainDomainObject.name, () => {
  let domainObject: TerrainDomainObject;

  beforeEach(() => {
    domainObject = createTerrainDomainObject();
  });

  test('should have a grid', () => {
    domainObject = createTerrainDomainObject();
    expect(domainObject.grid).toBeDefined();
    expect(isGreyScale(domainObject.color)).toBe(false);
    expect(isEmpty(domainObject.typeName)).toBe(false);
    expect(domainObject.renderStyle).instanceOf(TerrainRenderStyle);
  });

  test('should verify and change the render style', () => {
    domainObject = createTerrainDomainObject();

    const style = new TerrainRenderStyle();
    style.increment = 0.0001;
    domainObject.verifyRenderStyle(style);
    expect(style.increment).toBe(10);
  });

  test('should not have grid', () => {
    domainObject = new TerrainDomainObject();
    expect(domainObject.grid).toBeUndefined();

    const style = new TerrainRenderStyle();
    domainObject.verifyRenderStyle(style);
    expect(style.increment).toBe(0);
  });
});
