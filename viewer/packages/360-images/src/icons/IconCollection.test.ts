/*!
 * Copyright 2025 Cognite AS
 */

import { Mock, It } from 'moq.ts';
import { Matrix4, PerspectiveCamera, Ray, Vector3, WebGLRenderer } from 'three';
import { BeforeSceneRenderedDelegate, EventTrigger, SceneHandler } from '@reveal/utilities';
import { jest } from '@jest/globals';
import { ClusteredIcon, IconCollection } from './IconCollection';
import assert from 'assert';

describe(IconCollection.name, () => {
  // Shared mock setup
  let mockSceneHandler: SceneHandler;
  let mockEventTrigger: EventTrigger<BeforeSceneRenderedDelegate>;
  let capturedRenderCallback: BeforeSceneRenderedDelegate | undefined;
  let mockRenderer: WebGLRenderer;

  // Shared test data
  const closePositions = [new Vector3(0, 0, 0), new Vector3(1, 0, 0), new Vector3(0, 1, 0)];
  const farPositions = [new Vector3(100, 0, 0), new Vector3(101, 0, 0), new Vector3(100, 1, 0)];
  const clusterablePositions = [
    new Vector3(0, 0, 0),
    new Vector3(50, 0, 0),
    new Vector3(0, 50, 0),
    new Vector3(50, 50, 0),
    new Vector3(200, 0, 0),
    new Vector3(200, 5, 0),
    new Vector3(200, 0, 5),
    new Vector3(205, 0, 0)
  ];

  function createCamera(position: Vector3, lookAt: Vector3 = new Vector3(0, 0, 0)): PerspectiveCamera {
    const camera = new PerspectiveCamera(75, 16 / 9, 0.1, 1000);
    camera.position.copy(position);
    camera.lookAt(lookAt);
    camera.updateMatrixWorld();
    return camera;
  }

  function createCollection(positions: Vector3[], enableHtmlClusters?: boolean, setNeedsRedraw?: () => void) {
    return new IconCollection(
      positions,
      mockSceneHandler,
      mockEventTrigger,
      enableHtmlClusters !== undefined ? { enableHtmlClusters } : undefined,
      setNeedsRedraw
    );
  }

  function renderFrame(camera: PerspectiveCamera, frameNumber = 0) {
    capturedRenderCallback?.({ frameNumber, renderer: mockRenderer, camera });
  }

  beforeEach(() => {
    capturedRenderCallback = undefined;

    mockSceneHandler = new Mock<SceneHandler>()
      .setup(s => s.addObject3D(It.IsAny()))
      .returns(undefined)
      .setup(s => s.removeObject3D(It.IsAny()))
      .returns(undefined)
      .object();

    mockEventTrigger = new Mock<EventTrigger<BeforeSceneRenderedDelegate>>()
      .setup(e => e.subscribe(It.IsAny()))
      .callback(({ args }) => {
        capturedRenderCallback = args[0];
      })
      .setup(e => e.unsubscribe(It.IsAny()))
      .returns(undefined)
      .object();

    mockRenderer = new Mock<WebGLRenderer>()
      .setup(r => r.getSize(It.IsAny()))
      .callback(({ args }) => args[0].set(1920, 1080))
      .setup(r => r.domElement)
      .returns(document.createElement('canvas'))
      .object();
  });

  describe('enableHtmlClusters flag', () => {
    test('defaults to true and can be configured via options', () => {
      // Default - HTML clusters enabled
      const defaultCollection = createCollection(closePositions);
      expect(defaultCollection.isHtmlClustersEnabled()).toBe(true);
      defaultCollection.dispose();

      // Explicit true
      const enabledCollection = createCollection(closePositions, true);
      expect(enabledCollection.isHtmlClustersEnabled()).toBe(true);
      enabledCollection.dispose();

      // Explicit false
      const disabledCollection = createCollection(closePositions, false);
      expect(disabledCollection.isHtmlClustersEnabled()).toBe(false);
      disabledCollection.dispose();
    });

    test('both modes show icons correctly when camera is close', () => {
      const camera = createCamera(new Vector3(0, 0, 20));

      // HTML clusters disabled
      const disabledCollection = createCollection([new Vector3(0, 0, 0)], false);
      renderFrame(camera);
      expect(disabledCollection.icons[0].culled).toBe(false);
      disabledCollection.dispose();

      // HTML clusters enabled
      const enabledCollection = createCollection([new Vector3(0, 0, 0)], true);
      renderFrame(camera);
      expect(enabledCollection.icons[0].culled).toBe(false);
      enabledCollection.dispose();
    });
  });

  describe('LOD and clustering behavior', () => {
    test('empty collection does not throw, single icon is visible, icon outside frustum is culled', () => {
      // Empty collection
      const emptyCollection = createCollection([]);
      expect(capturedRenderCallback).toBeDefined();
      const camera = createCamera(new Vector3(0, 0, 10));
      expect(() => renderFrame(camera)).not.toThrow();
      emptyCollection.dispose();

      // Single icon within distance
      const singleCollection = createCollection([new Vector3(0, 0, 0)]);
      renderFrame(createCamera(new Vector3(0, 0, 30)));
      expect(singleCollection.icons[0].culled).toBe(false);
      singleCollection.dispose();

      // Icon outside frustum
      const outsideCollection = createCollection([new Vector3(1000, 1000, 0)]);
      renderFrame(createCamera(new Vector3(0, 0, 10), new Vector3(0, 0, -100)));
      expect(outsideCollection.icons[0].culled).toBe(true);
      outsideCollection.dispose();
    });

    test('icons become visible when camera moves closer', () => {
      const positions = [new Vector3(50, 0, 0), new Vector3(51, 0, 0), new Vector3(50, 1, 0)];
      const collection = createCollection(positions);

      // Far camera
      renderFrame(createCamera(new Vector3(0, 0, 10)));

      // Move camera closer
      const closeCamera = createCamera(new Vector3(50, 0, 10), new Vector3(50, 0, 0));
      renderFrame(closeCamera);

      const visibleCount = collection.icons.filter(icon => !icon.culled).length;
      expect(visibleCount).toBe(3);

      collection.dispose();
    });

    test('transform is applied correctly when calculating camera position', () => {
      const collection = createCollection([new Vector3(0, 0, 0)]);
      collection.setTransform(new Matrix4().makeTranslation(10, 0, 0));

      renderFrame(createCamera(new Vector3(10, 0, 30)));
      expect(collection.icons[0].culled).toBe(false);

      collection.dispose();
    });
  });

  describe('ClusteredIcon structure and behavior', () => {
    test('getVisibleClusteredIcons returns valid structure with correct properties', () => {
      const positions = [new Vector3(0, 0, 0), new Vector3(5, 0, 0)];
      const collection = createCollection(positions, true);

      // Before render - empty
      expect(collection.getVisibleClusteredIcons()).toHaveLength(0);

      // After render - valid ClusteredIcon items
      renderFrame(createCamera(new Vector3(0, 0, 20)));

      const clusteredIcons = collection.getVisibleClusteredIcons();
      expect(clusteredIcons.length).toBeGreaterThan(0);
      clusteredIcons.forEach((item: ClusteredIcon) => {
        expect(item.icon).toBeDefined();
        expect(typeof item.isCluster).toBe('boolean');
        expect(typeof item.clusterSize).toBe('number');
        expect(item.clusterPosition).toBeInstanceOf(Vector3);
      });

      // Close icons have clusterSize 1
      const closeIcons = clusteredIcons.filter((i: ClusteredIcon) => !i.isCluster);
      closeIcons.forEach((item: ClusteredIcon) => expect(item.clusterSize).toBe(1));

      collection.dispose();
    });

    test('cluster centroid and child icons are correctly calculated', () => {
      const collection = createCollection(farPositions, true);
      renderFrame(createCamera(new Vector3(0, 0, 10), new Vector3(100, 0, 0)));

      const clusteredIcons = collection.getVisibleClusteredIcons();
      const clusters = clusteredIcons.filter(
        (item: ClusteredIcon) => item.isCluster && item.clusterIcons && item.clusterIcons.length > 1
      );

      // Verify centroid calculation
      for (const cluster of clusters) {
        const icons = cluster.clusterIcons!;
        const expectedCentroid = new Vector3();
        icons.forEach(icon => expectedCentroid.add(icon.getPosition()));
        expectedCentroid.divideScalar(icons.length);

        expect(cluster.clusterPosition.x).toBeCloseTo(expectedCentroid.x, 5);
        expect(cluster.clusterPosition.y).toBeCloseTo(expectedCentroid.y, 5);
        expect(cluster.clusterPosition.z).toBeCloseTo(expectedCentroid.z, 5);
        expect(cluster.clusterSize).toBe(icons.length);
      }

      collection.dispose();
    });

    test('single icon in cluster node shows as individual with sizeScale 1', () => {
      const positions = [new Vector3(0, 0, 0), new Vector3(500, 0, 0)];
      const collection = createCollection(positions, true);
      renderFrame(createCamera(new Vector3(0, 0, 10), new Vector3(250, 0, 0)));

      const clusteredIcons = collection.getVisibleClusteredIcons();
      clusteredIcons.forEach((item: ClusteredIcon) => {
        expect(item.isCluster).toBe(false);
        expect(item.clusterSize).toBe(1);
        expect(item.sizeScale).toBe(1);
        expect(item.clusterPosition).toEqual(item.icon.getPosition());
      });

      collection.dispose();
    });

    test('moving camera close to cluster declusters icons', () => {
      const positions = [new Vector3(100, 0, 0), new Vector3(101, 0, 0), new Vector3(100, 1, 0)];
      const collection = createCollection(positions, true);

      // Far camera - clustered
      renderFrame(createCamera(new Vector3(0, 0, 10), new Vector3(100, 0, 0)), 0);

      // Very close camera - should show individual icons
      renderFrame(createCamera(new Vector3(100, 0, 5), new Vector3(100, 0, 0)), 1);

      const clusteredIcons = collection.getVisibleClusteredIcons();
      const individualCount = clusteredIcons.filter((i: ClusteredIcon) => !i.isCluster).length;
      expect(individualCount).toBeGreaterThanOrEqual(1);

      collection.dispose();
    });
  });

  describe('cluster intersection and hover', () => {
    test('intersectCluster returns undefined on miss, cluster data on hit', () => {
      const collection = createCollection(clusterablePositions, true);
      const cameraPosition = new Vector3(0, 25, 25);
      renderFrame(createCamera(cameraPosition, new Vector3(200, 0, 0)));

      const clusteredIcons = collection.getVisibleClusteredIcons();
      const clusters = clusteredIcons.filter((item: ClusteredIcon) => item.isCluster);
      expect(clusters.length).toBeGreaterThan(0);

      // Miss ray
      const missRay = new Ray(cameraPosition, new Vector3(0, 0, 1).normalize());
      expect(collection.intersectCluster(missRay)).toBeUndefined();

      // Hit ray aimed at cluster centroid
      const targetCluster = clusters[0];
      const rayDirection = targetCluster.clusterPosition.clone().sub(cameraPosition).normalize();
      const hitRay = new Ray(cameraPosition, rayDirection);

      const result = collection.intersectCluster(hitRay);
      assert(result);
      expect(result.clusterPosition).toBeInstanceOf(Vector3);
      expect(result.clusterIcons.length).toBeGreaterThan(0);

      collection.dispose();
    });

    test('hover state changes trigger redraw correctly', () => {
      const setNeedsRedrawMock = jest.fn();
      const collection = createCollection(clusterablePositions, true, setNeedsRedrawMock);
      const cameraPosition = new Vector3(0, 25, 25);
      renderFrame(createCamera(cameraPosition, new Vector3(200, 0, 0)));

      const clusters = collection.getVisibleClusteredIcons().filter((i: ClusteredIcon) => i.isCluster);
      const targetCluster = clusters[0];
      const rayDir = targetCluster.clusterPosition.clone().sub(cameraPosition).normalize();
      const hitRay = new Ray(cameraPosition, rayDir);
      const missRay = new Ray(cameraPosition, new Vector3(0, 0, 1).normalize());

      // First hit - triggers redraw
      setNeedsRedrawMock.mockClear();
      collection.intersectCluster(hitRay);
      expect(setNeedsRedrawMock).toHaveBeenCalledTimes(1);

      // Same hit - no redraw
      setNeedsRedrawMock.mockClear();
      collection.intersectCluster(hitRay);
      expect(setNeedsRedrawMock).not.toHaveBeenCalled();

      // Miss - clears hover, triggers redraw
      setNeedsRedrawMock.mockClear();
      collection.intersectCluster(missRay);
      expect(setNeedsRedrawMock).toHaveBeenCalledTimes(1);

      // Miss again - no redraw
      setNeedsRedrawMock.mockClear();
      collection.intersectCluster(missRay);
      expect(setNeedsRedrawMock).not.toHaveBeenCalled();

      collection.dispose();
    });
  });
});
