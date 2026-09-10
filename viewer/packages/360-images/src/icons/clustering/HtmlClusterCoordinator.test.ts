/*!
 * Copyright 2026 Cognite AS
 */

import { Vector3 } from 'three';
import { Overlay3DIcon } from '@reveal/3d-overlays';
import { vi } from 'vitest';
import type { Mock } from 'vitest';
import { HtmlClusterCoordinator } from './HtmlClusterCoordinator';
import type { HtmlClusterCollection } from './HtmlClusterCoordinator';
import type { ClusterScreenInfo } from './ClusterRenderingStrategy';

type ApplyOcclusionFn = HtmlClusterCollection['applyHtmlClusterOcclusion'];
type ApplyOcclusionMock = Mock<ApplyOcclusionFn>;

describe(HtmlClusterCoordinator.name, () => {
  test('dispatches applyHtmlClusterOcclusion to exactly the passed collections, once per call', () => {
    const coordinator = new HtmlClusterCoordinator();
    const applyMockA = vi.fn<ApplyOcclusionFn>();
    const applyMockB = vi.fn<ApplyOcclusionFn>();
    const collectionA = createMockCollection([], applyMockA);
    const collectionB = createMockCollection([], applyMockB);

    coordinator.runCoordinator([]);
    expect(applyMockA).not.toHaveBeenCalled();

    coordinator.runCoordinator([collectionA, collectionB]);
    expect(applyMockA).toHaveBeenCalledTimes(1);
    expect(applyMockB).toHaveBeenCalledTimes(1);

    applyMockA.mockClear();
    applyMockB.mockClear();
    coordinator.runCoordinator([collectionB]);
    expect(applyMockA).not.toHaveBeenCalled();
    expect(applyMockB).toHaveBeenCalledTimes(1);
  });

  test('cross-collection occlusion: overlapping farther cluster is occluded, non-overlapping is not', () => {
    const coordinator = new HtmlClusterCoordinator();
    const closeIcon = createMockIcon();
    const farOverlappingIcon = createMockIcon();
    const farDistantIcon = createMockIcon();

    const applyMockA = vi.fn<ApplyOcclusionFn>();
    const applyMockB = vi.fn<ApplyOcclusionFn>();
    const collectionA = createMockCollection([createScreenInfo(closeIcon, 500, 300, 10)], applyMockA);
    const collectionB = createMockCollection(
      [createScreenInfo(farOverlappingIcon, 500, 300, 50), createScreenInfo(farDistantIcon, 800, 300, 50)],
      applyMockB
    );

    coordinator.runCoordinator([collectionA, collectionB]);

    const appliedToA = applyMockA.mock.calls[0][0];
    const appliedToB = applyMockB.mock.calls[0][0];
    expect(appliedToA.has(closeIcon)).toBe(false);
    expect(appliedToB.has(farOverlappingIcon)).toBe(true);
    expect(appliedToB.has(farDistantIcon)).toBe(false);
  });

  test('partially overlapping clusters: only the cluster within overlapRadius is occluded', () => {
    const coordinator = new HtmlClusterCoordinator();
    const closeIcon = createMockIcon();
    const nearFarIcon = createMockIcon();
    const distantFarIcon = createMockIcon();

    const applyMock = vi.fn<ApplyOcclusionFn>();
    const collection = createMockCollection(
      [
        createScreenInfo(closeIcon, 500, 300, 10),
        createScreenInfo(nearFarIcon, 530, 300, 50),
        createScreenInfo(distantFarIcon, 600, 300, 50)
      ],
      applyMock
    );

    coordinator.runCoordinator([collection]);

    const applied = applyMock.mock.calls[0][0];
    expect(applied.has(closeIcon)).toBe(false);
    expect(applied.has(nearFarIcon)).toBe(true);
    expect(applied.has(distantFarIcon)).toBe(false);
  });
});

function createMockIcon(): Overlay3DIcon {
  return new Overlay3DIcon({ position: new Vector3(), minPixelSize: 1, maxPixelSize: 100, iconRadius: 1 }, {});
}

function createMockCollection(screenInfos: ClusterScreenInfo[], applyFn?: ApplyOcclusionMock): HtmlClusterCollection {
  return {
    getStagedHtmlClusterScreenInfos: () => screenInfos,
    applyHtmlClusterOcclusion: applyFn ?? vi.fn<ApplyOcclusionFn>()
  };
}

function createScreenInfo(
  icon: Overlay3DIcon,
  screenX: number,
  screenY: number,
  distance: number,
  projectedSize: number = 80
): ClusterScreenInfo {
  return {
    data: { icon, isCluster: true, clusterSize: 2, clusterPosition: new Vector3(), sizeScale: 5.5 },
    screenPos: new Vector3(screenX, screenY, 0),
    worldPos: new Vector3(),
    distance,
    projectedSize
  };
}
