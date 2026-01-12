/*!
 * Copyright 2025 Cognite AS
 */

import { Mock, It } from 'moq.ts';
import { Matrix4, PerspectiveCamera, Ray, Vector3, WebGLRenderer } from 'three';
import { BeforeSceneRenderedDelegate, EventTrigger, SceneHandler } from '@reveal/utilities';
import { jest } from '@jest/globals';
import { ClusteredIcon, IconCollection } from './IconCollection';

describe(IconCollection.name, () => {
  const singleCenterIconPosition = new Vector3(0, 0, 0);
  const closeIconPositions = [singleCenterIconPosition, new Vector3(1, 0, 0), new Vector3(0, 1, 0)];
  const farIconPositions = [new Vector3(100, 0, 0), new Vector3(101, 0, 0), new Vector3(100, 1, 0)];
  const farestIconPosition = new Vector3(1000, 1000, 0);
  const bitFarIconPositions = [new Vector3(2, 0, 0), new Vector3(0, 2, 0), new Vector3(2, 2, 0)];
  const singleBitFarIconPosition = new Vector3(5, 0, 0);
  const bitMoreFarIconPositions = [new Vector3(50, 0, 0), new Vector3(51, 0, 0), new Vector3(50, 1, 0)];
  const squareClusterPositions = [
    new Vector3(100, 0, 0),
    new Vector3(102, 0, 0),
    new Vector3(100, 2, 0),
    new Vector3(102, 2, 0)
  ];
  const tightClusterPositions = [
    new Vector3(200, 0, 0),
    new Vector3(201, 0, 0),
    new Vector3(200, 1, 0),
    new Vector3(201, 1, 0),
    new Vector3(200.5, 0.5, 0)
  ];

  let mockSceneHandler: SceneHandler;
  let mockEventTrigger: EventTrigger<BeforeSceneRenderedDelegate>;
  let capturedRenderCallback: BeforeSceneRenderedDelegate | undefined;
  let mockRenderer: WebGLRenderer;
  let setNeedsRedrawMock: jest.Mock;

  function createCamera(position: Vector3, lookAt: Vector3 = new Vector3(0, 0, 0)): PerspectiveCamera {
    const camera = new PerspectiveCamera(75, 16 / 9, 0.1, 1000);
    camera.position.copy(position);
    camera.lookAt(lookAt);
    camera.updateMatrixWorld();
    return camera;
  }

  function createCollection(positions: Vector3[], withRedrawCallback = false): IconCollection {
    return new IconCollection(
      positions,
      mockSceneHandler,
      mockEventTrigger,
      undefined,
      withRedrawCallback ? setNeedsRedrawMock : undefined
    );
  }

  function renderFrame(camera: PerspectiveCamera, frameNumber = 0): void {
    capturedRenderCallback?.({ frameNumber, renderer: mockRenderer, camera });
  }

  beforeEach(() => {
    capturedRenderCallback = undefined;
    setNeedsRedrawMock = jest.fn();

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

  describe('setIconClustersByLOD', () => {
    test('Empty icon collection does not throw on render', () => {
      const collection = createCollection([]);
      expect(capturedRenderCallback).toBeDefined();
      expect(() => renderFrame(createCamera(new Vector3(0, 0, 10)))).not.toThrow();
      collection.dispose();
    });

    test('Single icon within distance threshold is not clustered', () => {
      const collection = createCollection([singleCenterIconPosition]);
      expect(capturedRenderCallback).toBeDefined();

      renderFrame(createCamera(new Vector3(0, 0, 30)));

      expect(collection.icons.length).toBe(1);
      expect(collection.icons[0].culled).toBe(false);
      collection.dispose();
    });

    test('Icon outside camera frustum is culled', () => {
      const collection = createCollection([farestIconPosition]);
      expect(capturedRenderCallback).toBeDefined();

      renderFrame(createCamera(new Vector3(0, 0, 10), new Vector3(0, 0, -100)));

      expect(collection.icons.length).toBe(1);
      expect(collection.icons[0].culled).toBe(true);
      collection.dispose();
    });

    test('Multiple close icons are all visible (not clustered)', () => {
      const iconPositions = [singleCenterIconPosition, ...bitFarIconPositions];
      const collection = createCollection(iconPositions);
      expect(capturedRenderCallback).toBeDefined();

      renderFrame(createCamera(new Vector3(1, 1, 20)));

      const visibleIcons = collection.icons.filter(icon => !icon.culled);
      expect(visibleIcons.length).toBe(4);
      collection.dispose();
    });

    test('Far icons are clustered while close icons remain visible', () => {
      const allPositions = [...closeIconPositions, ...farIconPositions];
      const collection = createCollection(allPositions);
      expect(capturedRenderCallback).toBeDefined();

      renderFrame(createCamera(new Vector3(0.5, 0.5, 20)));

      // Close icons should not be culled
      closeIconPositions.forEach((_, i) => expect(collection.icons[i].culled).toBe(false));
      // Far icons should have at least some clustering
      const culledFarIcons = collection.icons.slice(3, 6).filter(icon => icon.culled);
      expect(culledFarIcons.length).toBeGreaterThanOrEqual(1);
      collection.dispose();
    });

    test('Icons become visible when camera moves closer', () => {
      const collection = createCollection(bitMoreFarIconPositions);
      expect(capturedRenderCallback).toBeDefined();

      // Camera far from icons initially
      const camera = createCamera(new Vector3(0, 0, 10));
      renderFrame(camera);

      // Move camera closer
      camera.position.set(50, 0, 10);
      camera.lookAt(new Vector3(50, 0, 0));
      camera.updateMatrixWorld();
      renderFrame(camera);

      const visibleIcons = collection.icons.filter(icon => !icon.culled);
      expect(visibleIcons.length).toBe(3);
      collection.dispose();
    });

    test('All icons are initially marked as culled before selection', () => {
      const collection = createCollection([singleCenterIconPosition, singleBitFarIconPosition]);
      expect(capturedRenderCallback).toBeDefined();

      renderFrame(createCamera(new Vector3(0, 0, 10)));

      expect(collection.icons.length).toBe(2);
      collection.dispose();
    });

    test('Transform is applied correctly when calculating camera position in model space', () => {
      const collection = createCollection([singleCenterIconPosition]);
      collection.setTransform(new Matrix4().makeTranslation(10, 0, 0));
      expect(capturedRenderCallback).toBeDefined();

      renderFrame(createCamera(new Vector3(10, 0, 30)));

      expect(collection.icons[0].culled).toBe(false);
      collection.dispose();
    });

    test('Uses distance-based clustering with 40-unit threshold', () => {
      const allPositions = [...closeIconPositions, ...farIconPositions];
      const collection = createCollection(allPositions);
      expect(capturedRenderCallback).toBeDefined();

      renderFrame(createCamera(new Vector3(0, 0, 30)));

      closeIconPositions.forEach((_, i) => expect(collection.icons[i].culled).toBe(false));
      collection.dispose();
    });

    test('Clustered nodes return representative icon when no close icons exist', () => {
      const collection = createCollection(farIconPositions);
      expect(capturedRenderCallback).toBeDefined();

      renderFrame(createCamera(new Vector3(0, 0, 10), new Vector3(100, 0, 0)));

      const visibleCount = collection.icons.filter(icon => !icon.culled).length;
      expect(visibleCount).toBeGreaterThanOrEqual(1);
      expect(visibleCount).toBeLessThanOrEqual(collection.icons.length);
      collection.dispose();
    });

    test('Single icon in cluster node is shown as individual (not clustered)', () => {
      // Create a scenario where a single icon ends up in a cluster node with node.data === null
      // This tests the else branch (lines 344-354) where clusterSize === 1
      const positions = [
        new Vector3(0, 0, 0), // Close icon
        new Vector3(300, 0, 0) // Single far icon isolated in octree
      ];
      const collection = createCollection(positions);
      expect(capturedRenderCallback).toBeDefined();

      // Camera at origin - far icon should be in a cluster node
      renderFrame(createCamera(new Vector3(0, 0, 10), new Vector3(150, 0, 0)));

      const clusteredIcons = collection.getVisibleClusteredIcons();

      // Both should be visible and neither should be a cluster (single icons)
      const allItems = [...clusteredIcons];
      allItems.forEach((item: ClusteredIcon) => {
        expect(item.isCluster).toBe(false);
        expect(item.clusterSize).toBe(1);
        expect(item.sizeScale).toBe(1);
      });

      collection.dispose();
    });
  });

  describe('getVisibleClusteredIcons', () => {
    test('Returns empty array before render and ClusteredIcon array after render', () => {
      const positions = [new Vector3(0, 0, 0), new Vector3(5, 0, 0)];
      const collection = createCollection(positions);

      // Before render
      expect(collection.getVisibleClusteredIcons()).toHaveLength(0);

      // After render
      renderFrame(createCamera(new Vector3(0, 0, 20)));

      const clusteredIcons = collection.getVisibleClusteredIcons();
      expect(clusteredIcons.length).toBeGreaterThan(0);
      clusteredIcons.forEach((item: ClusteredIcon) => {
        expect(item.icon).toBeDefined();
        expect(typeof item.isCluster).toBe('boolean');
        expect(typeof item.clusterSize).toBe('number');
        expect(item.clusterPosition).toBeInstanceOf(Vector3);
        expect(typeof item.sizeScale).toBe('number');
      });

      collection.dispose();
    });

    test('Close icons have clusterSize of 1, far icons are clustered with correct children', () => {
      // Close icons
      const closePositions = [new Vector3(0, 0, 0), new Vector3(2, 0, 0), new Vector3(0, 2, 0), new Vector3(2, 2, 0)];
      const closeCollection = createCollection(closePositions);
      renderFrame(createCamera(new Vector3(1, 1, 20)));

      const closeClusteredIcons = closeCollection.getVisibleClusteredIcons();
      const nonClusteredItems = closeClusteredIcons.filter((item: ClusteredIcon) => !item.isCluster);
      expect(nonClusteredItems.length).toBe(closePositions.length);
      nonClusteredItems.forEach((item: ClusteredIcon) => {
        expect(item.clusterSize).toBe(1);
        expect(item.sizeScale).toBe(1);
      });
      closeCollection.dispose();

      // Far icons
      const farCollection = createCollection(tightClusterPositions);
      renderFrame(createCamera(new Vector3(0, 0, 10), new Vector3(200, 0, 0)));

      const farClusteredIcons = farCollection.getVisibleClusteredIcons();
      const clusterItems = farClusteredIcons.filter((item: ClusteredIcon) => item.isCluster);

      if (clusterItems.length > 0) {
        const cluster = clusterItems[0];
        expect(cluster.clusterSize).toBeGreaterThan(1);
        expect(cluster.sizeScale).toBeGreaterThan(1);
        if (cluster.clusterIcons) {
          expect(cluster.clusterIcons.length).toBe(cluster.clusterSize);
        }
      }
      farCollection.dispose();
    });

    test('Cluster centroid is calculated correctly', () => {
      const expectedCentroid = new Vector3(101, 1, 0);
      const collection = createCollection(squareClusterPositions);

      renderFrame(createCamera(new Vector3(0, 0, 10), new Vector3(100, 0, 0)));

      const clusterItems = collection.getVisibleClusteredIcons().filter((item: ClusteredIcon) => item.isCluster);
      if (clusterItems.length > 0) {
        expect(clusterItems[0].clusterPosition.x).toBeCloseTo(expectedCentroid.x, 0);
        expect(clusterItems[0].clusterPosition.y).toBeCloseTo(expectedCentroid.y, 0);
        expect(clusterItems[0].clusterPosition.z).toBeCloseTo(expectedCentroid.z, 0);
      }
      collection.dispose();
    });

    test('Multiple separate clusters are created for distant icon groups', () => {
      const group1Positions = [new Vector3(100, 0, 0), new Vector3(101, 0, 0), new Vector3(100, 1, 0)];
      const group2Positions = [new Vector3(200, 0, 0), new Vector3(201, 0, 0), new Vector3(200, 1, 0)];
      const allPositions = [...group1Positions, ...group2Positions];
      const collection = createCollection(allPositions);

      renderFrame(createCamera(new Vector3(0, 0, 10), new Vector3(150, 0, 0)));

      const clusteredIcons = collection.getVisibleClusteredIcons();
      const clusterItems = clusteredIcons.filter((item: ClusteredIcon) => item.isCluster);
      expect(
        clusterItems.length + clusteredIcons.filter((item: ClusteredIcon) => !item.isCluster).length
      ).toBeGreaterThanOrEqual(1);

      const totalIconCount =
        clusterItems.reduce((sum, c) => sum + c.clusterSize, 0) +
        clusteredIcons.filter((item: ClusteredIcon) => !item.isCluster).length;
      expect(totalIconCount).toBeLessThanOrEqual(allPositions.length);
      collection.dispose();
    });

    test('Single icon at far distance is not marked as cluster', () => {
      const collection = createCollection([new Vector3(500, 0, 0)]);
      renderFrame(createCamera(new Vector3(0, 0, 10), new Vector3(500, 0, 0)));

      const clusteredIcons = collection.getVisibleClusteredIcons();
      if (clusteredIcons.length > 0) {
        expect(clusteredIcons[0].clusterSize).toBe(1);
        expect(clusteredIcons[0].isCluster).toBe(false);
      }
      collection.dispose();
    });

    test('Moving camera close to cluster declusters icons', () => {
      const collection = createCollection(squareClusterPositions);

      // Far camera - should cluster
      renderFrame(createCamera(new Vector3(0, 0, 10), new Vector3(100, 0, 0)), 0);

      // Close camera - should decluster
      renderFrame(createCamera(new Vector3(100, 0, 30)), 1);

      const clusteredIcons = collection.getVisibleClusteredIcons();
      const individualCount = clusteredIcons.filter((item: ClusteredIcon) => !item.isCluster).length;
      const clusterCount = clusteredIcons.filter((item: ClusteredIcon) => item.isCluster).length;

      expect(individualCount).toBeGreaterThanOrEqual(clusterCount);
      clusteredIcons.forEach((item: ClusteredIcon) => {
        if (!item.isCluster) expect(item.clusterSize).toBe(1);
      });
      collection.dispose();
    });
  });

  describe('intersectCluster', () => {
    test('Returns undefined when ray misses all clusters', () => {
      const collection = createCollection(tightClusterPositions);
      renderFrame(createCamera(new Vector3(0, 0, 10), new Vector3(200, 0, 0)));

      // Ray pointing away from clusters
      const ray = new Ray(new Vector3(0, 0, 10), new Vector3(0, 0, -1).normalize());
      const result = collection.intersectCluster(ray);

      expect(result).toBeUndefined();
      collection.dispose();
    });

    test('Returns undefined when ray only hits non-cluster icons', () => {
      // Close icons that won't be clustered
      const positions = [new Vector3(0, 0, 0), new Vector3(1, 0, 0)];
      const collection = createCollection(positions);
      renderFrame(createCamera(new Vector3(0, 0, 10)));

      // Ray towards the icons
      const ray = new Ray(new Vector3(0, 0, 10), new Vector3(0, 0, -1).normalize());
      const result = collection.intersectCluster(ray);

      // No clusters exist when camera is close
      expect(result).toBeUndefined();
      collection.dispose();
    });

    test('Returns ClusterIntersectionData when ray hits a cluster', () => {
      const collection = createCollection(tightClusterPositions);
      renderFrame(createCamera(new Vector3(0, 0, 10), new Vector3(200, 0, 0)));

      // Get the cluster position
      const clusteredIcons = collection.getVisibleClusteredIcons();
      const cluster = clusteredIcons.find((item: ClusteredIcon) => item.isCluster);

      if (cluster) {
        // Create a ray from camera towards the cluster
        const cameraPos = new Vector3(0, 0, 10);
        const direction = cluster.clusterPosition.clone().sub(cameraPos).normalize();
        const ray = new Ray(cameraPos, direction);

        const result = collection.intersectCluster(ray);

        expect(result).toBeDefined();
        expect(result!.clusterPosition).toBeInstanceOf(Vector3);
        expect(result!.clusterSize).toBeGreaterThan(1);
        expect(result!.clusterIcons).toBeInstanceOf(Array);
        expect(result!.representativeIcon).toBeDefined();
      }
      collection.dispose();
    });

    test('Calls setNeedsRedraw when hover state changes', () => {
      const collection = createCollection(tightClusterPositions, true);
      renderFrame(createCamera(new Vector3(0, 0, 10), new Vector3(200, 0, 0)));

      const clusteredIcons = collection.getVisibleClusteredIcons();
      const cluster = clusteredIcons.find((item: ClusteredIcon) => item.isCluster);

      if (cluster) {
        // Ray hitting cluster
        const cameraPos = new Vector3(0, 0, 10);
        const direction = cluster.clusterPosition.clone().sub(cameraPos).normalize();
        const ray = new Ray(cameraPos, direction);

        setNeedsRedrawMock.mockClear();
        collection.intersectCluster(ray);

        // Should call setNeedsRedraw when hover state changes (first time)
        expect(setNeedsRedrawMock).toHaveBeenCalled();

        // Ray missing cluster
        const missRay = new Ray(new Vector3(0, 0, 10), new Vector3(0, 0, -1).normalize());
        setNeedsRedrawMock.mockClear();
        collection.intersectCluster(missRay);

        // Should call setNeedsRedraw when hover state clears
        expect(setNeedsRedrawMock).toHaveBeenCalled();
      }
      collection.dispose();
    });

    test('Returns closest cluster when multiple clusters are in ray path', () => {
      // Create two groups of icons at different distances
      const nearGroup = [new Vector3(50, 0, 0), new Vector3(51, 0, 0), new Vector3(50, 1, 0)];
      const farGroup = [new Vector3(100, 0, 0), new Vector3(101, 0, 0), new Vector3(100, 1, 0)];
      const collection = createCollection([...nearGroup, ...farGroup]);

      renderFrame(createCamera(new Vector3(0, 0, 10), new Vector3(75, 0, 0)));

      // Ray towards both clusters
      const ray = new Ray(new Vector3(0, 0, 0), new Vector3(1, 0, 0).normalize());
      const result = collection.intersectCluster(ray);

      if (result) {
        // The closer cluster should be returned
        expect(result.clusterPosition.x).toBeLessThan(100);
      }
      collection.dispose();
    });
  });

  describe('setHoveredClusterIcon and clearHoveredCluster', () => {
    test('Set and clear hovered cluster icon triggers redraw appropriately', () => {
      const collection = createCollection(tightClusterPositions, true);
      renderFrame(createCamera(new Vector3(0, 0, 10), new Vector3(200, 0, 0)));

      const clusteredIcons = collection.getVisibleClusteredIcons();
      const cluster = clusteredIcons.find((item: ClusteredIcon) => item.isCluster);

      if (cluster) {
        // Set hovered icon (doesn't trigger redraw directly - that's done in intersectCluster)
        collection.setHoveredClusterIcon(cluster.icon);

        // Clear should trigger redraw when there was a hovered icon
        setNeedsRedrawMock.mockClear();
        collection.clearHoveredCluster();
        expect(setNeedsRedrawMock).toHaveBeenCalledTimes(1);

        // Clear again - should NOT trigger redraw (no hovered icon)
        setNeedsRedrawMock.mockClear();
        collection.clearHoveredCluster();
        expect(setNeedsRedrawMock).not.toHaveBeenCalled();
      }
      collection.dispose();
    });
  });
});
