/*!
 * Copyright 2026 Cognite AS
 */

import { Texture, Vector3 } from 'three';
import { ClusterOverlayPointsObject } from './ClusterOverlayPointsObject';
import type { ClusterSpriteTextures } from './clusterSpriteTextures';

describe(ClusterOverlayPointsObject.name, () => {
  test('uploads cluster instances and rejects overflow', () => {
    const points = new ClusterOverlayPointsObject(2, {
      textures: createStubTextures(),
      minPixelSize: 48,
      maxPixelSize: 120,
      radius: 1.65
    });

    points.setClusters([
      { position: new Vector3(1, 2, 3), clusterSize: 8, opacity: 1, hover: 0 },
      { position: new Vector3(4, 5, 6), clusterSize: 12, opacity: 0.5, hover: 1 }
    ]);

    const geometry = points.children[0] as { geometry: { drawRange: { count: number } } };
    expect(geometry.geometry.drawRange.count).toBe(2);

    expect(() =>
      points.setClusters([
        { position: new Vector3(), clusterSize: 1, opacity: 1, hover: 0 },
        { position: new Vector3(), clusterSize: 1, opacity: 1, hover: 0 },
        { position: new Vector3(), clusterSize: 1, opacity: 1, hover: 0 }
      ])
    ).toThrow(/exceeds the maximum/);

    points.dispose();
  });
});

function createStubTextures(): ClusterSpriteTextures {
  return {
    ring: new Texture(),
    ringHover: new Texture(),
    digitAtlas: new Texture()
  };
}
