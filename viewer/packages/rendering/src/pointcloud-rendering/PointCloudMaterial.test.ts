/*!
 * Copyright 2026 Cognite AS
 */
import { PointCloudMaterial } from './PointCloudMaterial';

describe(PointCloudMaterial.name, () => {
  test('draws every point by default, so the dithered LOD frontier is opt-in per node', () => {
    const material = new PointCloudMaterial();

    expect(material.uniforms.keepFraction.value).toBe(1);
  });
});
