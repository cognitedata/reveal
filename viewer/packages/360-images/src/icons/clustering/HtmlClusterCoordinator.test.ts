/*!
 * Copyright 2026 Cognite AS
 */

import { Vector3 } from 'three';
import { Overlay3DIcon } from '@reveal/3d-overlays';
import { jest } from '@jest/globals';
import { HtmlClusterCoordinator } from './HtmlClusterCoordinator';
import type { HtmlClusterCollection } from './HtmlClusterCoordinator';
import type { ClusterScreenInfo } from './ClusterRenderingStrategy';

type ApplyOcclusionFn = HtmlClusterCollection['applyHtmlClusterOcclusion'];
type ApplyOcclusionMock = jest.MockedFunction<ApplyOcclusionFn>;

describe(HtmlClusterCoordinator.name, () => {
  test('calls applyHtmlClusterOcclusion exactly once per runCoordinator call', () => {
    const coordinator = new HtmlClusterCoordinator();
    const applyMock = jest.fn<ApplyOcclusionFn>();
    coordinator.onCollectionAdded(createMockCollection([], applyMock));

    coordinator.runCoordinator();
    expect(applyMock).toHaveBeenCalledTimes(1);

    applyMock.mockClear();
    coordinator.onCollectionAdded(createMockCollection([]));
    coordinator.runCoordinator();
    expect(applyMock).toHaveBeenCalledTimes(1);

    expect(() => coordinator.runCoordinator()).not.toThrow();
  });

  test('dispose clears collections and subsequent runCoordinator calls are no-ops', () => {
    const coordinator = new HtmlClusterCoordinator();
    const applyMock = jest.fn<ApplyOcclusionFn>();
    coordinator.onCollectionAdded(createMockCollection([], applyMock));

    coordinator.dispose();
    coordinator.runCoordinator();
    expect(applyMock).not.toHaveBeenCalled();
  });

  test('calls applyHtmlClusterOcclusion on registered collections and stops after removal', () => {
    const coordinator = new HtmlClusterCoordinator();
    const applyMockA = jest.fn<ApplyOcclusionFn>();
    const applyMockB = jest.fn<ApplyOcclusionFn>();
    const collectionA = createMockCollection([], applyMockA);

    coordinator.onCollectionAdded(collectionA);
    coordinator.onCollectionAdded(createMockCollection([], applyMockB));

    coordinator.runCoordinator();
    expect(applyMockA).toHaveBeenCalledTimes(1);
    expect(applyMockB).toHaveBeenCalledTimes(1);

    coordinator.onCollectionRemoved(collectionA);
    applyMockA.mockClear();
    coordinator.runCoordinator();
    expect(applyMockA).not.toHaveBeenCalled();
    expect(applyMockB).toHaveBeenCalledTimes(2);
  });

  test('cross-collection occlusion: overlapping farther cluster is occluded, non-overlapping is not', () => {
    const coordinator = new HtmlClusterCoordinator();
    const closeIcon = createMockIcon();
    const farOverlappingIcon = createMockIcon();
    const farDistantIcon = createMockIcon();

    const applyMockA = jest.fn<ApplyOcclusionFn>();
    const applyMockB = jest.fn<ApplyOcclusionFn>();
    coordinator.onCollectionAdded(createMockCollection([createScreenInfo(closeIcon, 500, 300, 10)], applyMockA));
    coordinator.onCollectionAdded(
      createMockCollection(
        [createScreenInfo(farOverlappingIcon, 500, 300, 50), createScreenInfo(farDistantIcon, 800, 300, 50)],
        applyMockB
      )
    );

    coordinator.runCoordinator();

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

    const applyMock = jest.fn<ApplyOcclusionFn>();
    coordinator.onCollectionAdded(
      createMockCollection(
        [
          createScreenInfo(closeIcon, 500, 300, 10),
          createScreenInfo(nearFarIcon, 530, 300, 50),
          createScreenInfo(distantFarIcon, 600, 300, 50)
        ],
        applyMock
      )
    );

    coordinator.runCoordinator();

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
    applyHtmlClusterOcclusion: applyFn ?? jest.fn<ApplyOcclusionFn>()
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
