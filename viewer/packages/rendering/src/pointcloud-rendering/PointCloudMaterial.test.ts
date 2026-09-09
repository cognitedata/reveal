/*!
 * Copyright 2026 Cognite AS
 */

import { PointCloudMaterial } from './PointCloudMaterial';
import { DEFAULT_MAX_ADAPTIVE_POINT_SIZE, DEFAULT_MAX_POINT_SIZE } from './constants';
import { PointSizeType } from './enums';

describe('PointCloudMaterial point size limits', () => {
  let material: PointCloudMaterial;

  beforeEach(() => {
    material = new PointCloudMaterial();
  });

  afterEach(() => {
    material.dispose();
  });

  test('Adaptive allows larger close-up points by default', () => {
    expect(material.pointSizeType).toBe(PointSizeType.Adaptive);
    expect(material.maxSize).toBe(DEFAULT_MAX_ADAPTIVE_POINT_SIZE);
    expect(material.maxSize).toBeGreaterThan(DEFAULT_MAX_POINT_SIZE);
    expect(material.uniforms.maxSize.value).toBe(material.maxSize);
  });

  test.each([PointSizeType.Fixed, PointSizeType.Attenuated])('switching to %s restores its original cap', type => {
    material.pointSizeType = type;
    expect(material.maxSize).toBe(DEFAULT_MAX_POINT_SIZE);

    material.pointSizeType = PointSizeType.Adaptive;
    expect(material.maxSize).toBe(DEFAULT_MAX_ADAPTIVE_POINT_SIZE);
  });

  test.each([0, DEFAULT_MAX_POINT_SIZE, DEFAULT_MAX_ADAPTIVE_POINT_SIZE, 50])(
    'explicit cap %s survives mode switches, even when equal to a default',
    maxSize => {
      material.maxSize = maxSize;
      for (const type of [PointSizeType.Fixed, PointSizeType.Attenuated, PointSizeType.Adaptive]) {
        material.pointSizeType = type;
        expect(material.maxSize).toBe(maxSize);
      }
    }
  );

  test('constructor preserves an explicit cap across mode switches', () => {
    material.dispose();
    material = new PointCloudMaterial({ maxSize: 15 });
    expect(material.maxSize).toBe(15);
    material.pointSizeType = PointSizeType.Fixed;
    expect(material.maxSize).toBe(15);
  });
});
