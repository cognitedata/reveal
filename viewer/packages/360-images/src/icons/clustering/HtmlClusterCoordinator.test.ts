/*!
 * Copyright 2026 Cognite AS
 */

import { Mock, It } from 'moq.ts';
import { Color, Vector3 } from 'three';
import { Overlay3DIcon } from '@reveal/3d-overlays';
import { jest } from '@jest/globals';
import { BeforeSceneRenderedDelegate, EventTrigger } from '@reveal/utilities';
import { HtmlClusterCoordinator } from './HtmlClusterCoordinator';
import type { HtmlClusterCollection } from './HtmlClusterCoordinator';
import type { ClusterScreenInfo } from './ClusterRenderingStrategy';

type ApplyOcclusionFn = HtmlClusterCollection['applyHtmlClusterOcclusion'];
type ApplyOcclusionMock = jest.MockedFunction<ApplyOcclusionFn>;

describe(HtmlClusterCoordinator.name, () => {
  let mockEventTrigger: EventTrigger<BeforeSceneRenderedDelegate>;
  let capturedCallbacks: BeforeSceneRenderedDelegate[];

  const fireCoordinatorEvent = () => {
    const last = capturedCallbacks[capturedCallbacks.length - 1];
    last?.({} as Parameters<BeforeSceneRenderedDelegate>[0]);
  };

  beforeEach(() => {
    capturedCallbacks = [];
    mockEventTrigger = new Mock<EventTrigger<BeforeSceneRenderedDelegate>>()
      .setup(e => e.subscribe(It.IsAny()))
      .callback(({ args }) => {
        capturedCallbacks.push(args[0]);
      })
      .setup(e => e.unsubscribe(It.IsAny()))
      .callback(({ args }) => {
        const cb = args[0];
        const idx = capturedCallbacks.indexOf(cb);
        if (idx !== -1) capturedCallbacks.splice(idx, 1);
      })
      .object();
  });

  test('subscribes exactly once and re-subscribes on collection added to remain last', () => {
    const coordinator = new HtmlClusterCoordinator(mockEventTrigger);
    expect(capturedCallbacks.length).toBe(1);

    coordinator.onCollectionAdded(createMockCollection([]));
    expect(capturedCallbacks.length).toBe(1);

    coordinator.onCollectionAdded(createMockCollection([]));
    expect(capturedCallbacks.length).toBe(1);

    expect(() => fireCoordinatorEvent()).not.toThrow();
  });

  test('dispose unsubscribes the handler and subsequent events are no-ops', () => {
    const coordinator = new HtmlClusterCoordinator(mockEventTrigger);
    const applyMock = jest.fn<ApplyOcclusionFn>();
    coordinator.onCollectionAdded(createMockCollection([], applyMock));

    coordinator.dispose();
    expect(capturedCallbacks.length).toBe(0);

    fireCoordinatorEvent();
    expect(applyMock).not.toHaveBeenCalled();
  });

  test('calls applyHtmlClusterOcclusion on registered collections and stops after removal', () => {
    const coordinator = new HtmlClusterCoordinator(mockEventTrigger);
    const applyMockA = jest.fn<ApplyOcclusionFn>();
    const applyMockB = jest.fn<ApplyOcclusionFn>();
    const collectionA = createMockCollection([], applyMockA);

    coordinator.onCollectionAdded(collectionA);
    coordinator.onCollectionAdded(createMockCollection([], applyMockB));

    fireCoordinatorEvent();
    expect(applyMockA).toHaveBeenCalledTimes(1);
    expect(applyMockB).toHaveBeenCalledTimes(1);

    coordinator.onCollectionRemoved(collectionA);
    applyMockA.mockClear();
    fireCoordinatorEvent();
    expect(applyMockA).not.toHaveBeenCalled();
    expect(applyMockB).toHaveBeenCalledTimes(2);
  });

  test('cross-collection occlusion: overlapping farther cluster is occluded, non-overlapping is not', () => {
    const coordinator = new HtmlClusterCoordinator(mockEventTrigger);
    const closeIcon = createMockIcon();
    const farOverlappingIcon = createMockIcon();
    const farDistantIcon = createMockIcon();

    // overlapRadius = 80 * 0.7 = 56
    // farOverlappingIcon at same pos as closeIcon --> screenDist=0 < 56 --> occluded
    // farDistantIcon at dx=700 from closeIcon --> screenDist=700 > 56 --> not occluded
    const applyMockA = jest.fn<ApplyOcclusionFn>();
    const applyMockB = jest.fn<ApplyOcclusionFn>();
    coordinator.onCollectionAdded(createMockCollection([createScreenInfo(closeIcon, 500, 300, 10)], applyMockA));
    coordinator.onCollectionAdded(
      createMockCollection(
        [createScreenInfo(farOverlappingIcon, 500, 300, 50), createScreenInfo(farDistantIcon, 800, 300, 50)],
        applyMockB
      )
    );

    fireCoordinatorEvent();

    const appliedToA = applyMockA.mock.calls[0][0];
    const appliedToB = applyMockB.mock.calls[0][0];
    expect(appliedToA.has(closeIcon)).toBe(false);
    expect(appliedToB.has(farOverlappingIcon)).toBe(true);
    expect(appliedToB.has(farDistantIcon)).toBe(false);
  });

  test('partially overlapping clusters: only the cluster within overlapRadius is occluded', () => {
    const coordinator = new HtmlClusterCoordinator(mockEventTrigger);
    const closeIcon = createMockIcon();
    const nearFarIcon = createMockIcon();
    const distantFarIcon = createMockIcon();

    // overlapRadius = 80 * 0.7 = 56
    // nearFarIcon at dx=30 from closeIcon --> screenDist=30 < 56 --> occluded
    // distantFarIcon at dx=100 from closeIcon --> screenDist=100 > 56 --> not occluded
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

    fireCoordinatorEvent();

    const applied = applyMock.mock.calls[0][0];
    expect(applied.has(closeIcon)).toBe(false);
    expect(applied.has(nearFarIcon)).toBe(true);
    expect(applied.has(distantFarIcon)).toBe(false);
  });
});

function createMockIcon(): Overlay3DIcon {
  return new Mock<Overlay3DIcon>()
    .setup(i => i.getPosition())
    .returns(new Vector3())
    .setup(i => i.getColor())
    .returns(new Color(1, 1, 1))
    .object();
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
