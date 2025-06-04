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

  test('should have a grid when the object is initialized', () => {
    domainObject = createTerrainDomainObject();
    expect(domainObject.grid).toBeDefined();
    expect(isGreyScale(domainObject.color)).toBe(false);
    expect(isEmpty(domainObject.typeName)).toBe(false);
    expect(domainObject.renderStyle).instanceOf(TerrainRenderStyle);
  });

  test('should verify and change the render style when contour increment is too small', () => {
    domainObject = createTerrainDomainObject();

    const style = new TerrainRenderStyle();

    // Set a very small increment
    style.increment = 0.0001;

    // The verification determine that the increment is too small (and will create too many contours)
    // and set it to some default value, depended of the z-range of the terrain.
    domainObject.verifyRenderStyle(style);
    expect(style.increment).toBe(10);
  });

  test('should verify but cannot change the renders style when contour increment is too small because the grid is missing', () => {
    domainObject = new TerrainDomainObject();
    expect(domainObject.grid).toBeUndefined();

    const style = new TerrainRenderStyle();

    // Check the default value before verification is 0, which mean it is not set
    expect(style.increment).toBe(0);

    // Try to verify it, but it cannot because the terrain it missing, amd the increment is not updated
    domainObject.verifyRenderStyle(style);
    expect(style.increment).toBe(0);
  });
});
