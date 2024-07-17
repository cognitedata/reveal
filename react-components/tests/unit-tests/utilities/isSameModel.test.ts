import { describe, expect, test, vi, beforeEach } from 'vitest';

import { Matrix4 } from 'three';
import { isSameModel } from '../../../src/utilities/isSameModel';
import { cloneDeep } from 'lodash';

describe(isSameModel.name, () => {
  const model0 = { modelId: 1, revisionId: 2, transform: new Matrix4().makeRotationX(1) };
  const model1 = { modelId: 3, revisionId: 4, transform: new Matrix4().makeRotationY(2) };
  const model2 = { modelId: 1, revisionId: 2, transform: new Matrix4().makeRotationZ(3) };

  const image360Event0 = { siteId: 'site0', transform: new Matrix4().makeRotationZ(3) };
  const image360Event1 = { siteId: 'site1', transform: new Matrix4().makeRotationX(4) };
  const image360Event2 = { siteId: 'site0', transform: new Matrix4().makeRotationZ(5) };

  const image360Fdm0 = {
    externalId: 'id0',
    space: 'space0',
    transform: new Matrix4().makeRotationY(5)
  };
  const image360Fdm1 = {
    externalId: 'id1',
    space: 'space0',
    transform: new Matrix4().makeRotationY(5)
  };

  test('returns true on equal model info', () => {
    expect(isSameModel(model0, cloneDeep(model0))).toBeTruthy();
  });

  test('returns false on unequal models', () => {
    expect(isSameModel(model0, model1)).toBeFalsy();
  });

  test('returns false on equal models with different transforms', () => {
    expect(isSameModel(model0, model2)).toBeFalsy();
  });

  test('returns false with CAD/PC vs 360', () => {
    expect(isSameModel(model0, image360Event0)).toBeFalsy();
  });

  test('returns true with equal 360 images', () => {
    expect(isSameModel(image360Event0, cloneDeep(image360Event0))).toBeTruthy();
  });

  test('returns false with unequal 360 images', () => {
    expect(isSameModel(image360Event0, image360Event1)).toBeFalsy();
  });

  test('returns false for equal 360 images with different transform', () => {
    expect(isSameModel(image360Event0, image360Event2)).toBeFalsy();
  });

  test('returns false wtih FDM vs events images', () => {
    expect(isSameModel(image360Event0, image360Fdm0)).toBeFalsy();
  });

  test('returns true for equal FDM images', () => {
    expect(isSameModel(image360Fdm0, cloneDeep(image360Fdm0))).toBeTruthy();
  });

  test('returns false for unequal FDM images', () => {
    expect(isSameModel(image360Fdm0, image360Fdm1)).toBeFalsy();
  });
});
