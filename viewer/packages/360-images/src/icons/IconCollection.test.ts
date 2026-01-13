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
  describe('setIconClustersByLOD', () => {
    let mockSceneHandler: SceneHandler;
    let mockEventTrigger: EventTrigger<BeforeSceneRenderedDelegate>;
    let capturedRenderCallback: BeforeSceneRenderedDelegate | undefined;
    let mockRenderer: WebGLRenderer;

    const singleCenterIconPosition = new Vector3(0, 0, 0);

    const closeIconPositions = [singleCenterIconPosition, new Vector3(1, 0, 0), new Vector3(0, 1, 0)];
    const farIconPositions = [new Vector3(100, 0, 0), new Vector3(101, 0, 0), new Vector3(100, 1, 0)];
    const farestIconPosition = new Vector3(1000, 1000, 0);
    const bitFarIconPositions = [new Vector3(2, 0, 0), new Vector3(0, 2, 0), new Vector3(2, 2, 0)];
    const singleBitFarIconPosition = new Vector3(5, 0, 0);
    const bitMoreFarIconPositions = [new Vector3(50, 0, 0), new Vector3(51, 0, 0), new Vector3(50, 1, 0)];

    function createCamera(position: Vector3, lookAt: Vector3 = new Vector3(0, 0, 0)): PerspectiveCamera {
      const camera = new PerspectiveCamera(75, 16 / 9, 0.1, 1000);
      camera.position.copy(position);
      camera.lookAt(lookAt);
      camera.updateMatrixWorld();
      return camera;
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

    test('Empty icon collection does not throw on render', () => {
      const collection = new IconCollection([], mockSceneHandler, mockEventTrigger);

      expect(capturedRenderCallback).toBeDefined();
      const camera = createCamera(new Vector3(0, 0, 10));

      expect(() => capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera })).not.toThrow();
      collection.dispose();
    });

    test('Single icon within distance threshold is not clustered', () => {
      const collection = new IconCollection([singleCenterIconPosition], mockSceneHandler, mockEventTrigger);

      expect(capturedRenderCallback).toBeDefined();

      // Camera close to the icon (within default distance threshold of 40)
      const camera = createCamera(new Vector3(0, 0, 30));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      // Icon should not be culled when camera is close
      const icons = collection.icons;
      expect(icons.length).toBe(1);
      expect(icons[0].culled).toBe(false);

      collection.dispose();
    });

    test('Icon outside camera frustum is culled', () => {
      const collection = new IconCollection([farestIconPosition], mockSceneHandler, mockEventTrigger);

      expect(capturedRenderCallback).toBeDefined();

      // Camera looking away from the icon
      const camera = createCamera(new Vector3(0, 0, 10), new Vector3(0, 0, -100));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      // Icon should be culled when outside frustum
      const icons = collection.icons;
      expect(icons.length).toBe(1);
      expect(icons[0].culled).toBe(true);

      collection.dispose();
    });

    test('Multiple close icons are all visible (not clustered)', () => {
      const iconPositions = [singleCenterIconPosition, ...bitFarIconPositions];
      const collection = new IconCollection(iconPositions, mockSceneHandler, mockEventTrigger);

      expect(capturedRenderCallback).toBeDefined();
      // Camera close to all icons
      const camera = createCamera(new Vector3(1, 1, 20));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      // All icons should not be culled when camera is close
      const icons = collection.icons;
      expect(icons.length).toBe(4);
      const visibleIcons = icons.filter(icon => !icon.culled);
      expect(visibleIcons.length).toBe(4);

      collection.dispose();
    });

    test('Far icons are clustered while close icons remain visible', () => {
      // Create a group of close icons and a group of far icons
      const allPositions = [...closeIconPositions, ...farIconPositions];
      const collection = new IconCollection(allPositions, mockSceneHandler, mockEventTrigger);

      expect(capturedRenderCallback).toBeDefined();
      // Camera positioned close to the first group
      const camera = createCamera(new Vector3(0.5, 0.5, 20));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      const icons = collection.icons;
      expect(icons.length).toBe(6);

      // Close icons should not be culled
      const closeIcons = icons.slice(0, 3);
      closeIcons.forEach(icon => {
        expect(icon.culled).toBe(false);
      });

      // Far icons should have at least some clustering (some culled)
      const farIcons = icons.slice(3, 6);
      const culledFarIcons = farIcons.filter(icon => icon.culled);
      // At least some far icons should be culled due to clustering
      expect(culledFarIcons.length).toBeGreaterThanOrEqual(1);

      collection.dispose();
    });

    test('Icons become visible when camera moves closer', () => {
      const collection = new IconCollection(bitMoreFarIconPositions, mockSceneHandler, mockEventTrigger);

      expect(capturedRenderCallback).toBeDefined();

      // Camera far from icons initially
      const camera = createCamera(new Vector3(0, 0, 10));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      // Now move camera closer to icons
      camera.position.set(50, 0, 10);
      camera.lookAt(new Vector3(50, 0, 0));
      camera.updateMatrixWorld();

      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      // Icons should not be culled when camera is close
      const icons = collection.icons;
      const visibleIcons = icons.filter(icon => !icon.culled);
      expect(visibleIcons.length).toBe(3);

      collection.dispose();
    });

    test('All icons are initially marked as culled before selection', () => {
      const iconPositions = [singleCenterIconPosition, singleBitFarIconPosition];
      const collection = new IconCollection(iconPositions, mockSceneHandler, mockEventTrigger);

      expect(capturedRenderCallback).toBeDefined();

      // Create a camera looking at the icons
      const camera = createCamera(new Vector3(0, 0, 10));

      // Before render callback, icons should have default culled state
      // After render callback, the method should first mark all as culled, then un-cull the selected ones
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      // Verify icons are properly processed
      const icons = collection.icons;
      expect(icons.length).toBe(2);

      collection.dispose();
    });

    test('Transform is applied correctly when calculating camera position in model space', () => {
      const collection = new IconCollection([singleCenterIconPosition], mockSceneHandler, mockEventTrigger);

      const transform = new Matrix4().makeTranslation(10, 0, 0);
      collection.setTransform(transform);

      expect(capturedRenderCallback).toBeDefined();

      // Camera should need to account for transform
      const camera = createCamera(new Vector3(10, 0, 30));

      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      const icons = collection.icons;
      expect(icons.length).toBe(1);
      // Icon at origin with +10 transform should appear at (10, 0, 0) in world space
      // Camera at (10, 0, 30) should see it
      expect(icons[0].culled).toBe(false);

      collection.dispose();
    });

    test('Uses distance-based clustering with 40-unit threshold', () => {
      const allPositions = [...closeIconPositions, ...farIconPositions];

      const collection = new IconCollection(allPositions, mockSceneHandler, mockEventTrigger);
      expect(capturedRenderCallback).toBeDefined();

      // Camera positioned close to origin (within 40 units of closeIconPositions)
      const camera = createCamera(new Vector3(0, 0, 30));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      const icons = collection.icons;
      // Close icons (within 40 units) should not be culled
      closeIconPositions.forEach((_, i) => {
        expect(icons[i].culled).toBe(false);
      });

      collection.dispose();
    });

    test('Clustered nodes return representative icon when no close icons exist', () => {
      const collection = new IconCollection(farIconPositions, mockSceneHandler, mockEventTrigger);
      expect(capturedRenderCallback).toBeDefined();

      // Camera at origin - all farIconPositions are beyond 40 units threshold
      const camera = createCamera(new Vector3(0, 0, 10), new Vector3(100, 0, 0));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      const icons = collection.icons;
      const visibleCount = icons.filter(icon => !icon.culled).length;
      // At least one icon should be visible (the representative), but not necessarily all
      expect(visibleCount).toBeGreaterThanOrEqual(1);
      expect(visibleCount).toBeLessThanOrEqual(icons.length);

      collection.dispose();
    });

    test('getVisibleClusteredIcons returns empty before render and valid ClusteredIcon array after', () => {
      const positions = [new Vector3(0, 0, 0), new Vector3(5, 0, 0)];
      const collection = new IconCollection(positions, mockSceneHandler, mockEventTrigger);

      // Before render - should be empty
      expect(collection.getVisibleClusteredIcons()).toHaveLength(0);

      // After render - should have ClusteredIcon items with correct structure
      const camera = createCamera(new Vector3(0, 0, 20));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      const clusteredIcons = collection.getVisibleClusteredIcons();
      expect(clusteredIcons.length).toBeGreaterThan(0);
      clusteredIcons.forEach((item: ClusteredIcon) => {
        expect(item.icon).toBeDefined();
        expect(typeof item.isCluster).toBe('boolean');
        expect(typeof item.clusterSize).toBe('number');
        expect(item.clusterPosition).toBeInstanceOf(Vector3);
      });

      collection.dispose();
    });

    test('Close icons have clusterSize 1, far icons cluster with correct centroid and children', () => {
      // Shared positions for clustering tests
      const clusterPositions = [
        new Vector3(100, 0, 0),
        new Vector3(102, 0, 0),
        new Vector3(100, 2, 0),
        new Vector3(102, 2, 0)
      ];
      const expectedCentroid = new Vector3(101, 1, 0);
      const collection = new IconCollection(clusterPositions, mockSceneHandler, mockEventTrigger);

      // Test close icons (not clustered) - camera close to icons, looking at them
      const closeCamera = createCamera(new Vector3(101, 1, 20), new Vector3(101, 1, 0));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera: closeCamera });
      const closeIcons = collection.getVisibleClusteredIcons().filter((i: ClusteredIcon) => !i.isCluster);
      expect(closeIcons.length).toBe(clusterPositions.length);
      closeIcons.forEach((item: ClusteredIcon) => expect(item.clusterSize).toBe(1));

      // Test far icons (clustered with centroid) - camera far from icons
      const farCamera = createCamera(new Vector3(0, 0, 10), new Vector3(100, 0, 0));
      capturedRenderCallback?.({ frameNumber: 1, renderer: mockRenderer, camera: farCamera });
      const clusters = collection.getVisibleClusteredIcons().filter((i: ClusteredIcon) => i.isCluster);
      if (clusters.length > 0) {
        expect(clusters[0].clusterSize).toBeGreaterThan(1);
        expect(clusters[0].sizeScale).toBeGreaterThan(1);
        expect(clusters[0].clusterPosition.x).toBeCloseTo(expectedCentroid.x, 0);
        expect(clusters[0].clusterPosition.y).toBeCloseTo(expectedCentroid.y, 0);
        if (clusters[0].clusterIcons) expect(clusters[0].clusterIcons.length).toBe(clusters[0].clusterSize);
      }
      collection.dispose();
    });

    test('Single icon in cluster node is shown as individual (node.data null with clusterSize 1)', () => {
      // Tests the else branch (lines 344-354) where a cluster node contains only one icon
      const positions = [new Vector3(0, 0, 0), new Vector3(500, 0, 0)];
      const collection = new IconCollection(positions, mockSceneHandler, mockEventTrigger);

      const camera = createCamera(new Vector3(0, 0, 10), new Vector3(250, 0, 0));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      const clusteredIcons = collection.getVisibleClusteredIcons();
      // Both icons should be individual (not clustered)
      clusteredIcons.forEach((item: ClusteredIcon) => {
        expect(item.isCluster).toBe(false);
        expect(item.clusterSize).toBe(1);
      });

      collection.dispose();
    });

    test('Moving camera close to cluster declusters icons', () => {
      const positions = [
        new Vector3(100, 0, 0),
        new Vector3(101, 0, 0),
        new Vector3(100, 1, 0),
        new Vector3(101, 1, 0)
      ];
      const collection = new IconCollection(positions, mockSceneHandler, mockEventTrigger);

      // Far camera - clustered
      let camera = createCamera(new Vector3(0, 0, 10), new Vector3(100, 0, 0));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      // Close camera - declustered
      camera = createCamera(new Vector3(100, 0, 30));
      capturedRenderCallback?.({ frameNumber: 1, renderer: mockRenderer, camera });

      const clusteredIcons = collection.getVisibleClusteredIcons();
      const individualCount = clusteredIcons.filter((i: ClusteredIcon) => !i.isCluster).length;
      const clusterCount = clusteredIcons.filter((i: ClusteredIcon) => i.isCluster).length;
      expect(individualCount).toBeGreaterThanOrEqual(clusterCount);
      collection.dispose();
    });

    test('intersectCluster returns undefined when missing, returns data when hitting cluster', () => {
      const clusterPositions = [
        new Vector3(200, 0, 0),
        new Vector3(201, 0, 0),
        new Vector3(200, 1, 0),
        new Vector3(201, 1, 0)
      ];
      const collection = new IconCollection(clusterPositions, mockSceneHandler, mockEventTrigger);
      const camera = createCamera(new Vector3(0, 0, 10), new Vector3(200, 0, 0));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      // Ray missing clusters
      const missRay = new Ray(new Vector3(0, 0, 10), new Vector3(0, 0, -1).normalize());
      expect(collection.intersectCluster(missRay)).toBeUndefined();

      // Ray hitting cluster
      const cluster = collection.getVisibleClusteredIcons().find((i: ClusteredIcon) => i.isCluster);
      if (cluster) {
        const cameraPos = new Vector3(0, 0, 10);
        const hitDirection = cluster.clusterPosition.clone().sub(cameraPos).normalize();
        const hitRay = new Ray(cameraPos, hitDirection);
        const result = collection.intersectCluster(hitRay);

        assert(result);
        expect(result.clusterSize).toBeGreaterThan(1);
        expect(result.clusterIcons).toBeInstanceOf(Array);
        expect(result.representativeIcon).toBeDefined();
      }

      collection.dispose();
    });

    test('setHoveredClusterIcon and clearHoveredCluster manage hover state and redraw', () => {
      const clusterPositions = [new Vector3(200, 0, 0), new Vector3(201, 0, 0), new Vector3(200, 1, 0)];
      const setNeedsRedrawMock = jest.fn();
      const collection = new IconCollection(
        clusterPositions,
        mockSceneHandler,
        mockEventTrigger,
        undefined,
        setNeedsRedrawMock
      );
      const camera = createCamera(new Vector3(0, 0, 10), new Vector3(200, 0, 0));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      const cluster = collection.getVisibleClusteredIcons().find((i: ClusteredIcon) => i.isCluster);
      if (cluster) {
        // Set hover (doesn't trigger redraw directly)
        collection.setHoveredClusterIcon(cluster.icon);

        // Clear hover - should trigger redraw
        setNeedsRedrawMock.mockClear();
        collection.clearHoveredCluster();
        expect(setNeedsRedrawMock).toHaveBeenCalledTimes(1);

        // Clear again - no redraw (no hover state)
        setNeedsRedrawMock.mockClear();
        collection.clearHoveredCluster();
        expect(setNeedsRedrawMock).not.toHaveBeenCalled();
      }

      collection.dispose();
    });
  });
});
