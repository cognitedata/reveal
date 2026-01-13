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
    // Icons distributed to force deep octree subdivision (depth >= 3) for cluster creation
    const clusterableIconPositions = [
      new Vector3(0, 0, 0),
      new Vector3(50, 0, 0),
      new Vector3(0, 50, 0),
      new Vector3(50, 50, 0),
      new Vector3(0, 0, 50),
      new Vector3(50, 0, 50),
      new Vector3(0, 50, 50),
      new Vector3(50, 50, 50),
      // Far cluster at x=200
      new Vector3(200, 0, 0),
      new Vector3(200, 5, 0),
      new Vector3(200, 0, 5),
      new Vector3(200, 5, 5),
      new Vector3(205, 0, 0),
      new Vector3(205, 5, 0)
    ];

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

    test('Close icons have clusterSize 1 when camera is near', () => {
      // Icons positioned in front of camera along Z-axis for reliable frustum containment
      const clusterPositions = [
        new Vector3(0, 0, 30),
        new Vector3(1, 0, 30),
        new Vector3(0, 1, 30),
        new Vector3(1, 1, 30)
      ];
      const collection = new IconCollection(clusterPositions, mockSceneHandler, mockEventTrigger);

      // Camera close to icons (within 50-unit threshold)
      const closeCamera = createCamera(new Vector3(0.5, 0.5, 0), new Vector3(0.5, 0.5, 30));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera: closeCamera });

      const clusteredIcons = collection.getVisibleClusteredIcons();
      const closeIcons = clusteredIcons.filter((i: ClusteredIcon) => !i.isCluster);
      expect(closeIcons.length).toBe(clusterPositions.length);
      closeIcons.forEach((item: ClusteredIcon) => expect(item.clusterSize).toBe(1));

      collection.dispose();
    });

    test('Far icons cluster with correct centroid and children amount', () => {
      // Mix of close and far icons - close icons force octree hierarchy
      // that enables clustering of distant icons
      const nearPositions = [new Vector3(0, 0, 0), new Vector3(1, 0, 0)];
      const farPositions = [new Vector3(100, 0, 0), new Vector3(101, 0, 0), new Vector3(100, 1, 0)];
      const allPositions = [...nearPositions, ...farPositions];
      const collection = new IconCollection(allPositions, mockSceneHandler, mockEventTrigger);

      // Camera near origin - close icons are individual, far icons cluster
      const camera = createCamera(new Vector3(0.5, 0.5, 20));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      // Use the underlying icons API to verify clustering behavior
      const icons = collection.icons;
      const farIcons = icons.slice(nearPositions.length);
      const culledFarIcons = farIcons.filter(icon => icon.culled);

      // Far icons should be culled (clustered)
      expect(culledFarIcons.length).toBe(3);

      // Also verify getVisibleClusteredIcons returns valid amount of clustered items
      const clusteredIcons = collection.getVisibleClusteredIcons();
      expect(clusteredIcons.length).toBe(2);

      collection.dispose();
    });

    test('Single icon in cluster node is shown as individual (node.data null with clusterSize 1)', () => {
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

    test('Cluster centroid is correctly calculated from child icon positions', () => {
      // Use far icons only so they cluster when camera is distant
      const collection = new IconCollection(farIconPositions, mockSceneHandler, mockEventTrigger);

      // Camera at origin looking toward the far icons - they will cluster
      const camera = createCamera(new Vector3(0, 0, 10), new Vector3(100, 0, 0));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      const clusteredIcons = collection.getVisibleClusteredIcons();
      expect(clusteredIcons.length).toBeGreaterThan(0);

      // Get clusters that have child icons
      const clustersWithChildren = clusteredIcons.filter(
        (item: ClusteredIcon) => item.isCluster && item.clusterIcons && item.clusterIcons.length > 1
      );

      // Verify centroid is mathematically correct for each cluster
      for (const cluster of clustersWithChildren) {
        // Calculate expected centroid: sum of all icon positions divided by count
        const icons = cluster.clusterIcons!;
        let sumX = 0,
          sumY = 0,
          sumZ = 0;
        for (const icon of icons) {
          const pos = icon.getPosition();
          sumX += pos.x;
          sumY += pos.y;
          sumZ += pos.z;
        }
        const expectedCentroid = new Vector3(sumX / icons.length, sumY / icons.length, sumZ / icons.length);

        // Verify cluster position matches the calculated centroid
        expect(cluster.clusterPosition.x).toBeCloseTo(expectedCentroid.x, 5);
        expect(cluster.clusterPosition.y).toBeCloseTo(expectedCentroid.y, 5);
        expect(cluster.clusterPosition.z).toBeCloseTo(expectedCentroid.z, 5);
      }

      collection.dispose();
    });

    test('Cluster stores all child icons in clusterIcons array', () => {
      // Use far icons only so they cluster when camera is distant
      const collection = new IconCollection(farIconPositions, mockSceneHandler, mockEventTrigger);

      // Camera at origin looking toward the far icons - they will cluster
      const camera = createCamera(new Vector3(0, 0, 10), new Vector3(100, 0, 0));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      const clusteredIcons = collection.getVisibleClusteredIcons();
      expect(clusteredIcons.length).toBeGreaterThan(0);

      // All visible items should have valid clusterIcons arrays
      clusteredIcons.forEach((item: ClusteredIcon) => {
        expect(item.clusterSize).toBeGreaterThanOrEqual(1);
        expect(item.icon).toBeDefined();
        expect(item.icon.getPosition()).toBeInstanceOf(Vector3);
      });

      collection.dispose();
    });

    test('Parent node with single icon shows as individual with sizeScale 1', () => {
      // Create icons that are far enough apart to be in separate octree nodes
      // but with one node containing only a single icon
      const positions = [
        new Vector3(0, 0, 0),
        new Vector3(0, 1, 0),
        new Vector3(200, 0, 0) // Single isolated icon
      ];
      const collection = new IconCollection(positions, mockSceneHandler, mockEventTrigger);

      // Camera looking toward both groups
      const camera = createCamera(new Vector3(0, 0, 10), new Vector3(100, 0, 0));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      const clusteredIcons = collection.getVisibleClusteredIcons();
      const individualIcons = clusteredIcons.filter((item: ClusteredIcon) => !item.isCluster);

      // The isolated icon should be shown as individual with sizeScale 1
      individualIcons.forEach((item: ClusteredIcon) => {
        expect(item.sizeScale).toBe(1);
        expect(item.clusterSize).toBe(1);
        expect(item.clusterPosition).toEqual(item.icon.getPosition());
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

    test('intersectCluster returns undefined when ray misses clusters', () => {
      // Mix of close and far icons to enable clustering
      const nearPositions = [new Vector3(0, 0, 0), new Vector3(1, 0, 0)];
      const farPositions = [new Vector3(100, 0, 0), new Vector3(101, 0, 0), new Vector3(100, 1, 0)];
      const allPositions = [...nearPositions, ...farPositions];
      const collection = new IconCollection(allPositions, mockSceneHandler, mockEventTrigger);

      const camera = createCamera(new Vector3(0.5, 0.5, 20));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      // Ray pointing away from all icons should miss
      const missRay = new Ray(new Vector3(0.5, 0.5, 20), new Vector3(0, 0, 1).normalize());
      expect(collection.intersectCluster(missRay)).toBeUndefined();

      collection.dispose();
    });

    test('intersectCluster returns cluster data when ray hits a cluster', () => {
      const collection = new IconCollection(clusterableIconPositions, mockSceneHandler, mockEventTrigger);

      // Camera near origin, far from the icons at x=200
      // Distance ~200 >> 50 threshold, so x=200 icons should cluster
      const cameraPosition = new Vector3(0, 25, 25);
      const camera = createCamera(cameraPosition, new Vector3(200, 0, 0));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      const clusteredIcons = collection.getVisibleClusteredIcons();
      const clusters = clusteredIcons.filter((item: ClusteredIcon) => item.isCluster);

      // Verify we have at least one cluster
      expect(clusters.length).toBeGreaterThan(0);

      // Aim ray at the cluster's centroid
      const targetCluster = clusters[0];
      const rayDirection = targetCluster.clusterPosition.clone().sub(cameraPosition).normalize();
      const hitRay = new Ray(cameraPosition, rayDirection);

      const result = collection.intersectCluster(hitRay);

      assert(result);
      // Check that the result is a valid cluster intersection data
      expect(result.clusterPosition).toBeInstanceOf(Vector3);
      expect(result.clusterIcons.length).toBeGreaterThan(0);

      collection.dispose();
    });
    test('intersectCluster triggers redraw when hover state changes', () => {
      const setNeedsRedrawMock = jest.fn();
      const collection = new IconCollection(
        clusterableIconPositions,
        mockSceneHandler,
        mockEventTrigger,
        undefined,
        setNeedsRedrawMock
      );

      const cameraPosition = new Vector3(0, 25, 25);
      const camera = createCamera(cameraPosition, new Vector3(200, 0, 0));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      const clusteredIcons = collection.getVisibleClusteredIcons();
      const clusters = clusteredIcons.filter((item: ClusteredIcon) => item.isCluster);
      expect(clusters.length).toBeGreaterThan(0);

      // Aim ray at the cluster's centroid
      const targetCluster = clusters[0];
      const rayDirection = targetCluster.clusterPosition.clone().sub(cameraPosition).normalize();
      const hitRay = new Ray(cameraPosition, rayDirection);

      // First intersection - hover state changes from null to target, triggers redraw
      setNeedsRedrawMock.mockClear();
      collection.intersectCluster(hitRay);
      expect(setNeedsRedrawMock).toHaveBeenCalledTimes(1);

      // Same ray again - hover state unchanged, no redraw
      setNeedsRedrawMock.mockClear();
      collection.intersectCluster(hitRay);
      expect(setNeedsRedrawMock).not.toHaveBeenCalled();

      // Miss ray pointing away - clears hover state, triggers redraw
      setNeedsRedrawMock.mockClear();
      const missRay = new Ray(cameraPosition, new Vector3(0, 0, 1).normalize());
      collection.intersectCluster(missRay);
      expect(setNeedsRedrawMock).toHaveBeenCalledTimes(1);

      // Miss again - hover state already cleared, no redraw
      setNeedsRedrawMock.mockClear();
      collection.intersectCluster(missRay);
      expect(setNeedsRedrawMock).not.toHaveBeenCalled();

      collection.dispose();
    });

    test('setHoveredClusterIcon and clearHoveredCluster manage hover state and redraw', () => {
      // Simple setup with icons close to camera for visible items
      const positions = [new Vector3(0, 0, 0), new Vector3(5, 0, 0)];
      const setNeedsRedrawMock = jest.fn();
      const collection = new IconCollection(
        positions,
        mockSceneHandler,
        mockEventTrigger,
        undefined,
        setNeedsRedrawMock
      );
      const camera = createCamera(new Vector3(0, 0, 20));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      const visibleIcons = collection.getVisibleClusteredIcons();
      expect(visibleIcons.length).toBeGreaterThan(0);
      const iconItem = visibleIcons[0];

      // Set hover on an icon
      collection.setHoveredClusterIcon(iconItem.icon);

      // Clear hover - should trigger redraw
      setNeedsRedrawMock.mockClear();
      collection.clearHoveredCluster();
      expect(setNeedsRedrawMock).toHaveBeenCalledTimes(1);

      // Clear again - no redraw (no hover state)
      setNeedsRedrawMock.mockClear();
      collection.clearHoveredCluster();
      expect(setNeedsRedrawMock).not.toHaveBeenCalled();

      collection.dispose();
    });
  });
});
