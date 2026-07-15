/*!
 * Copyright 2026 Cognite AS
 */

import { Box3, Vector3 } from 'three';
import { Mock } from 'moq.ts';
import type { EptBinaryLoader } from '../../packages/pointclouds/src/potree-three-loader/loading/EptBinaryLoader';
import type { PointCloudEptGeometry } from '../../packages/pointclouds/src/potree-three-loader/geometry/PointCloudEptGeometry';

export function createMockEptGeometry(url = 'https://example.com/model/'): PointCloudEptGeometry {
  const mockLoader = new Mock<EptBinaryLoader>()
    .setup(l => l.extension())
    .returns('.bin')
    .object();
  return new Mock<PointCloudEptGeometry>()
    .setup(e => e.boundingBox)
    .returns(new Box3(new Vector3(0, 0, 0), new Vector3(100, 100, 100)))
    .setup(e => e.offset)
    .returns(new Vector3())
    .setup(e => e.tightBoundingBox)
    .returns(new Box3())
    .setup(e => e.loader)
    .returns(mockLoader)
    .setup(e => e.spacing)
    .returns(1)
    .setup(e => e.url)
    .returns(url)
    .object();
}
