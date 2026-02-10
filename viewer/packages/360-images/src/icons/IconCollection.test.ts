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
  let mockSceneHandler: SceneHandler;
  let mockEventTrigger: EventTrigger<BeforeSceneRenderedDelegate>;
  let capturedRenderCallback: BeforeSceneRenderedDelegate | undefined;
  let mockRenderer: WebGLRenderer;

  // Shared test positions
  const origin = new Vector3(0, 0, 0);
  const closePositions = [origin, new Vector3(1, 0, 0), new Vector3(0, 1, 0)];
  const farPositions = [new Vector3(100, 0, 0), new Vector3(101, 0, 0), new Vector3(100, 1, 0)];
  const clusterablePositions = [
    origin,
    new Vector3(50, 0, 0),
    new Vector3(0, 50, 0),
    new Vector3(50, 50, 0),
    new Vector3(200, 0, 0),
    new Vector3(200, 5, 0),
    new Vector3(200, 0, 5),
    new Vector3(205, 0, 0)
  ];
  const clusterCameraPosition = new Vector3(0, 25, 25);

  const createCamera = (position: Vector3, lookAt: Vector3 = origin): PerspectiveCamera => {
    const camera = new PerspectiveCamera(75, 16 / 9, 0.1, 1000);
    camera.position.copy(position);
    camera.lookAt(lookAt);
    camera.updateMatrixWorld();
    return camera;
  };

  const createCollection = (positions: Vector3[], enableHtmlClusters?: boolean, setNeedsRedraw?: () => void) =>
    new IconCollection(
      positions,
      mockSceneHandler,
      mockEventTrigger,
      enableHtmlClusters !== undefined ? { enableHtmlClusters } : undefined,
      setNeedsRedraw
    );

  const renderFrame = (camera: PerspectiveCamera, frameNumber = 0) =>
    capturedRenderCallback?.({ frameNumber, renderer: mockRenderer, camera });

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

  test('enableHtmlClusters configuration and icon visibility in both modes', () => {
    const camera = createCamera(new Vector3(0, 0, 20));

    // Default enabled, explicit true, and explicit false configurations
    const defaultCollection = createCollection(closePositions);
    expect(defaultCollection.isHtmlClustersEnabled()).toBe(true);
    defaultCollection.dispose();

    const enabledCollection = createCollection([origin], true);
    renderFrame(camera);
    expect(enabledCollection.isHtmlClustersEnabled()).toBe(true);
    expect(enabledCollection.icons[0].culled).toBe(false);
    enabledCollection.dispose();

    const disabledCollection = createCollection([origin], false);
    renderFrame(camera);
    expect(disabledCollection.isHtmlClustersEnabled()).toBe(false);
    expect(disabledCollection.icons[0].culled).toBe(false);
    disabledCollection.dispose();
  });

  test('LOD behavior: empty collection, visibility, frustum culling, camera movement, and transforms', () => {
    // Empty collection doesn't throw
    const emptyCollection = createCollection([]);
    expect(capturedRenderCallback).toBeDefined();
    expect(() => renderFrame(createCamera(new Vector3(0, 0, 10)))).not.toThrow();
    emptyCollection.dispose();

    // Single icon visible, icon outside frustum culled
    const singleCollection = createCollection([origin]);
    renderFrame(createCamera(new Vector3(0, 0, 30)));
    expect(singleCollection.icons[0].culled).toBe(false);
    singleCollection.dispose();

    const outsideCollection = createCollection([new Vector3(1000, 1000, 0)]);
    renderFrame(createCamera(new Vector3(0, 0, 10), new Vector3(0, 0, -100)));
    expect(outsideCollection.icons[0].culled).toBe(true);
    outsideCollection.dispose();

    // Camera movement makes icons visible
    const movementCollection = createCollection(farPositions);
    renderFrame(createCamera(new Vector3(0, 0, 10)));
    renderFrame(createCamera(new Vector3(100, 0, 10), new Vector3(100, 0, 0)));
    expect(movementCollection.icons.filter(icon => !icon.culled).length).toBe(3);
    movementCollection.dispose();

    // Transform applied correctly
    const transformCollection = createCollection([origin]);
    transformCollection.setTransform(new Matrix4().makeTranslation(10, 0, 0));
    renderFrame(createCamera(new Vector3(10, 0, 30)));
    expect(transformCollection.icons[0].culled).toBe(false);
    transformCollection.dispose();
  });

  test('ClusteredIcon structure, centroid calculation, and declustering behavior', () => {
    // Valid structure with correct properties
    const structureCollection = createCollection([origin, new Vector3(5, 0, 0)], true);
    expect(structureCollection.getVisibleClusteredIcons()).toHaveLength(0);
    renderFrame(createCamera(new Vector3(0, 0, 20)));

    const clusteredIcons = structureCollection.getVisibleClusteredIcons();
    expect(clusteredIcons.length).toBeGreaterThan(0);
    clusteredIcons.forEach((item: ClusteredIcon) => {
      expect(item.icon).toBeDefined();
      expect(typeof item.isCluster).toBe('boolean');
      expect(typeof item.clusterSize).toBe('number');
      expect(item.clusterPosition).toBeInstanceOf(Vector3);
    });
    structureCollection.dispose();

    // Centroid calculation for clusters
    const centroidCollection = createCollection(farPositions, true);
    renderFrame(createCamera(new Vector3(0, 0, 10), new Vector3(100, 0, 0)));
    const clusters = centroidCollection
      .getVisibleClusteredIcons()
      .filter((item: ClusteredIcon) => item.isCluster && item.clusterIcons && item.clusterIcons.length > 1);

    for (const cluster of clusters) {
      const expectedCentroid = new Vector3();
      cluster.clusterIcons!.forEach(icon => expectedCentroid.add(icon.getPosition()));
      expectedCentroid.divideScalar(cluster.clusterIcons!.length);
      expect(cluster.clusterPosition.x).toBeCloseTo(expectedCentroid.x, 5);
      expect(cluster.clusterPosition.y).toBeCloseTo(expectedCentroid.y, 5);
      expect(cluster.clusterPosition.z).toBeCloseTo(expectedCentroid.z, 5);
      expect(cluster.clusterSize).toBe(cluster.clusterIcons!.length);
    }
    centroidCollection.dispose();

    // Declustering when camera moves close
    const declusterCollection = createCollection(farPositions, true);
    renderFrame(createCamera(new Vector3(0, 0, 10), new Vector3(100, 0, 0)), 0);
    renderFrame(createCamera(new Vector3(100, 0, 5), new Vector3(100, 0, 0)), 1);
    expect(
      declusterCollection.getVisibleClusteredIcons().filter((i: ClusteredIcon) => !i.isCluster).length
    ).toBeGreaterThanOrEqual(1);
    declusterCollection.dispose();
  });

  test('cluster intersection, hover state changes, and clearHoveredCluster behavior', () => {
    const setNeedsRedrawMock = jest.fn();
    const collection = createCollection(clusterablePositions, true, setNeedsRedrawMock);
    renderFrame(createCamera(clusterCameraPosition, new Vector3(200, 0, 0)));

    const clusters = collection.getVisibleClusteredIcons().filter((item: ClusteredIcon) => item.isCluster);
    expect(clusters.length).toBeGreaterThan(0);

    const targetCluster = clusters[0];
    const hitRay = new Ray(
      clusterCameraPosition,
      targetCluster.clusterPosition.clone().sub(clusterCameraPosition).normalize()
    );
    const missRay = new Ray(clusterCameraPosition, new Vector3(0, 0, 1).normalize());

    // Miss returns undefined, hit returns cluster data
    expect(collection.intersectCluster(missRay)).toBeUndefined();
    const result = collection.intersectCluster(hitRay);
    assert(result);
    expect(result.clusterPosition).toBeInstanceOf(Vector3);
    expect(result.clusterIcons.length).toBeGreaterThan(0);

    // Hover state changes trigger redraw correctly
    setNeedsRedrawMock.mockClear();
    collection.intersectCluster(hitRay);
    expect(setNeedsRedrawMock).not.toHaveBeenCalled(); // Same hit - no redraw

    setNeedsRedrawMock.mockClear();
    collection.intersectCluster(missRay);
    expect(setNeedsRedrawMock).toHaveBeenCalledTimes(1); // Miss clears hover

    setNeedsRedrawMock.mockClear();
    collection.intersectCluster(missRay);
    expect(setNeedsRedrawMock).not.toHaveBeenCalled(); // Miss again - no redraw

    // clearHoveredCluster behavior
    collection.intersectCluster(hitRay); // Set hover state
    setNeedsRedrawMock.mockClear();
    collection.clearHoveredCluster();
    expect(setNeedsRedrawMock).toHaveBeenCalledTimes(1);

    setNeedsRedrawMock.mockClear();
    collection.clearHoveredCluster();
    expect(setNeedsRedrawMock).not.toHaveBeenCalled(); // Already cleared
    collection.dispose();

    // clearHoveredCluster does nothing when HTML clusters disabled
    const disabledMock = jest.fn();
    const disabledCollection = createCollection(clusterablePositions, false, disabledMock);
    renderFrame(createCamera(clusterCameraPosition, new Vector3(200, 0, 0)));
    disabledMock.mockClear();
    disabledCollection.clearHoveredCluster();
    expect(disabledMock).not.toHaveBeenCalled();
    disabledCollection.dispose();
  });

  test('setCullingScheme switching behavior and state preservation', () => {
    const setNeedsRedrawMock = jest.fn();
    const collection = createCollection(clusterablePositions, true, setNeedsRedrawMock);
    const camera = createCamera(new Vector3(0, 0, 50));

    // Initial clustered mode
    renderFrame(camera);
    const initialClusters = collection.getVisibleClusteredIcons().filter((i: ClusteredIcon) => i.isCluster);
    expect(collection.getVisibleClusteredIcons().length).toBeGreaterThan(0);

    // Setting same scheme - no changes
    setNeedsRedrawMock.mockClear();
    collection.setCullingScheme('clustered');
    expect(setNeedsRedrawMock).not.toHaveBeenCalled();

    // Switch to proximity triggers redraw
    setNeedsRedrawMock.mockClear();
    collection.setCullingScheme('proximity');
    expect(setNeedsRedrawMock).toHaveBeenCalledTimes(1);
    renderFrame(camera, 1);

    // Switch back to clustered restores clustering
    collection.setCullingScheme('clustered');
    renderFrame(camera, 2);
    expect(collection.getVisibleClusteredIcons().filter((i: ClusteredIcon) => i.isCluster).length).toBe(
      initialClusters.length
    );

    collection.dispose();
  });

  test('single icon in cluster node shows as individual with correct properties', () => {
    // Test with widely separated icons to ensure single icons are not marked as clusters
    const widelySpacedPositions = [origin, new Vector3(500, 0, 0)];
    const collection = createCollection(widelySpacedPositions, true);
    // Camera close to one icon, looking toward the center - this ensures both icons are processed
    renderFrame(createCamera(new Vector3(0, 0, 10), new Vector3(250, 0, 0)));

    const clusteredIcons = collection.getVisibleClusteredIcons();

    // No single-icon clusters should exist - icons with clusterSize 1 must have isCluster false
    const singleIconClusters = clusteredIcons.filter((item: ClusteredIcon) => item.clusterSize === 1 && item.isCluster);
    expect(singleIconClusters.length).toBe(0);

    // All individual icons have correct properties
    const individualIcons = clusteredIcons.filter((item: ClusteredIcon) => !item.isCluster);
    individualIcons.forEach((item: ClusteredIcon) => {
      expect(item.clusterSize).toBe(1);
      expect(item.sizeScale).toBe(1);
      expect(item.clusterPosition).toEqual(item.icon.getPosition());
    });

    collection.dispose();
  });
});
