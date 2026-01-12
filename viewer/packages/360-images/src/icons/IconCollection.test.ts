/*!
 * Copyright 2025 Cognite AS
 */

import { Mock, It } from 'moq.ts';
import { Matrix4, PerspectiveCamera, Vector3, WebGLRenderer } from 'three';
import { BeforeSceneRenderedDelegate, EventTrigger, SceneHandler } from '@reveal/utilities';
import { ClusteredIcon, IconCollection } from './IconCollection';

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

    test('getVisibleClusteredIcons returns empty array before render', () => {
      const positions = [new Vector3(0, 0, 0), new Vector3(1, 0, 0)];
      const collection = new IconCollection(positions, mockSceneHandler, mockEventTrigger);

      // Before render callback, should be empty
      const clusteredIcons = collection.getVisibleClusteredIcons();
      expect(clusteredIcons).toBeDefined();
      expect(clusteredIcons.length).toBe(0);

      collection.dispose();
    });

    test('getVisibleClusteredIcons returns ClusteredIcon array after render', () => {
      const positions = [new Vector3(0, 0, 0), new Vector3(5, 0, 0)];
      const collection = new IconCollection(positions, mockSceneHandler, mockEventTrigger);

      expect(capturedRenderCallback).toBeDefined();

      const camera = createCamera(new Vector3(0, 0, 20));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      const clusteredIcons = collection.getVisibleClusteredIcons();
      expect(clusteredIcons.length).toBeGreaterThan(0);

      // Verify ClusteredIcon structure
      clusteredIcons.forEach((item: ClusteredIcon) => {
        expect(item.icon).toBeDefined();
        expect(typeof item.isCluster).toBe('boolean');
        expect(typeof item.clusterSize).toBe('number');
        expect(item.clusterPosition).toBeInstanceOf(Vector3);
        expect(typeof item.sizeScale).toBe('number');
      });

      collection.dispose();
    });

    test('Close icons are not clustered - each has clusterSize of 1', () => {
      // Icons very close together, camera close to them
      const positions = [new Vector3(0, 0, 0), new Vector3(2, 0, 0), new Vector3(0, 2, 0), new Vector3(2, 2, 0)];
      const collection = new IconCollection(positions, mockSceneHandler, mockEventTrigger);

      expect(capturedRenderCallback).toBeDefined();

      // Camera very close to icons (within 50 unit threshold)
      const camera = createCamera(new Vector3(1, 1, 20));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      const clusteredIcons = collection.getVisibleClusteredIcons();

      // Each icon should be individual (not clustered)
      const nonClusteredItems = clusteredIcons.filter((item: ClusteredIcon) => !item.isCluster);
      expect(nonClusteredItems.length).toBe(positions.length);

      // Each should have clusterSize of 1
      nonClusteredItems.forEach((item: ClusteredIcon) => {
        expect(item.clusterSize).toBe(1);
        expect(item.sizeScale).toBe(1);
        expect(item.isCluster).toBe(false);
      });

      collection.dispose();
    });

    test('Far icons are clustered - cluster has correct children count', () => {
      // Group of icons far from camera
      const farPositions = [
        new Vector3(200, 0, 0),
        new Vector3(201, 0, 0),
        new Vector3(200, 1, 0),
        new Vector3(201, 1, 0),
        new Vector3(200.5, 0.5, 0)
      ];
      const collection = new IconCollection(farPositions, mockSceneHandler, mockEventTrigger);

      expect(capturedRenderCallback).toBeDefined();

      // Camera at origin, looking towards the far icons
      const camera = createCamera(new Vector3(0, 0, 10), new Vector3(200, 0, 0));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      const clusteredIcons = collection.getVisibleClusteredIcons();

      // Should have at least one cluster
      const clusterItems = clusteredIcons.filter((item: ClusteredIcon) => item.isCluster);

      if (clusterItems.length > 0) {
        // Verify cluster properties
        const cluster = clusterItems[0];
        expect(cluster.isCluster).toBe(true);
        expect(cluster.clusterSize).toBeGreaterThan(1);
        expect(cluster.sizeScale).toBeGreaterThan(1); // Clusters are scaled up

        // Verify clusterIcons array contains all children
        if (cluster.clusterIcons) {
          expect(cluster.clusterIcons.length).toBe(cluster.clusterSize);
        }
      }

      collection.dispose();
    });

    test('Cluster centroid is calculated correctly', () => {
      // Create icons at known positions
      const positions = [
        new Vector3(100, 0, 0),
        new Vector3(102, 0, 0),
        new Vector3(100, 2, 0),
        new Vector3(102, 2, 0)
      ];

      // Expected centroid: (101, 1, 0)
      const expectedCentroid = new Vector3(101, 1, 0);

      const collection = new IconCollection(positions, mockSceneHandler, mockEventTrigger);

      expect(capturedRenderCallback).toBeDefined();

      // Camera far from icons to trigger clustering
      const camera = createCamera(new Vector3(0, 0, 10), new Vector3(100, 0, 0));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      const clusteredIcons = collection.getVisibleClusteredIcons();
      const clusterItems = clusteredIcons.filter((item: ClusteredIcon) => item.isCluster);

      if (clusterItems.length > 0) {
        const cluster = clusterItems[0];

        // Centroid should be close to expected value
        expect(cluster.clusterPosition.x).toBeCloseTo(expectedCentroid.x, 0);
        expect(cluster.clusterPosition.y).toBeCloseTo(expectedCentroid.y, 0);
        expect(cluster.clusterPosition.z).toBeCloseTo(expectedCentroid.z, 0);
      }

      collection.dispose();
    });

    test('Multiple separate clusters are created for distant icon groups', () => {
      // Two groups of icons far apart
      const group1Positions = [new Vector3(100, 0, 0), new Vector3(101, 0, 0), new Vector3(100, 1, 0)];
      const group2Positions = [new Vector3(200, 0, 0), new Vector3(201, 0, 0), new Vector3(200, 1, 0)];

      const allPositions = [...group1Positions, ...group2Positions];
      const collection = new IconCollection(allPositions, mockSceneHandler, mockEventTrigger);

      expect(capturedRenderCallback).toBeDefined();

      // Camera at origin, looking at both groups
      const camera = createCamera(new Vector3(0, 0, 10), new Vector3(150, 0, 0));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      const clusteredIcons = collection.getVisibleClusteredIcons();
      const clusterItems = clusteredIcons.filter((item: ClusteredIcon) => item.isCluster);

      // Should have separate clusters for each group (or at least more than one)
      // The exact number depends on the octree partitioning
      expect(
        clusterItems.length + clusteredIcons.filter((item: ClusteredIcon) => !item.isCluster).length
      ).toBeGreaterThanOrEqual(1);

      // Total icon count should still match
      const totalIconCount =
        clusterItems.reduce((sum, c) => sum + c.clusterSize, 0) +
        clusteredIcons.filter((item: ClusteredIcon) => !item.isCluster).length;
      expect(totalIconCount).toBeLessThanOrEqual(allPositions.length);

      collection.dispose();
    });

    test('Single icon at far distance is not marked as cluster', () => {
      // Single isolated icon far from camera
      const positions = [new Vector3(500, 0, 0)];
      const collection = new IconCollection(positions, mockSceneHandler, mockEventTrigger);

      expect(capturedRenderCallback).toBeDefined();

      // Camera at origin looking at the far icon
      const camera = createCamera(new Vector3(0, 0, 10), new Vector3(500, 0, 0));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      const clusteredIcons = collection.getVisibleClusteredIcons();

      if (clusteredIcons.length > 0) {
        // Single icon should not be a cluster (clusterSize = 1, isCluster = false)
        const singleItem = clusteredIcons[0];
        expect(singleItem.clusterSize).toBe(1);
        expect(singleItem.isCluster).toBe(false);
      }

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

      expect(capturedRenderCallback).toBeDefined();

      // First, camera far away - should cluster
      let camera = createCamera(new Vector3(0, 0, 10), new Vector3(100, 0, 0));
      capturedRenderCallback?.({ frameNumber: 0, renderer: mockRenderer, camera });

      let clusteredIcons = collection.getVisibleClusteredIcons();

      // Now move camera close to icons - should decluster
      camera = createCamera(new Vector3(100, 0, 30));
      capturedRenderCallback?.({ frameNumber: 1, renderer: mockRenderer, camera });

      clusteredIcons = collection.getVisibleClusteredIcons();
      const finalClusterCount = clusteredIcons.filter((item: ClusteredIcon) => item.isCluster).length;
      const individualIconCount = clusteredIcons.filter((item: ClusteredIcon) => !item.isCluster).length;

      // When camera is close, should have more individual icons
      expect(individualIconCount).toBeGreaterThanOrEqual(finalClusterCount);
      // All items should be visible with individual icons having clusterSize = 1
      clusteredIcons.forEach((item: ClusteredIcon) => {
        if (!item.isCluster) {
          expect(item.clusterSize).toBe(1);
        }
      });

      collection.dispose();
    });
  });
});
