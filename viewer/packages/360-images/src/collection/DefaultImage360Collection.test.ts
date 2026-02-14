/*!
 * Copyright 2026 Cognite AS
 */

import { Mock, It, Times, IMock } from 'moq.ts';
import { jest } from '@jest/globals';
import { Ray, Vector3 } from 'three';
import { DefaultImage360Collection } from './DefaultImage360Collection';
import { ClusterIntersectionData, IconCollection } from '../icons/IconCollection';
import { Image360Entity } from '../entity/Image360Entity';
import { Image360AnnotationFilter } from '../annotation/Image360AnnotationFilter';
import { ClassicDataSourceType, Image360Provider } from '@reveal/data-providers';
import { Overlay3DIcon } from '@reveal/3d-overlays';

describe(DefaultImage360Collection.name, () => {
  const DEFAULT_CLUSTER_DISTANCE_THRESHOLD = 25;
  const UPDATED_CLUSTER_DISTANCE_THRESHOLD = 50;
  const SECOND_UPDATED_CLUSTER_DISTANCE_THRESHOLD = 100;
  const DEFAULT_MAX_OCTREE_DEPTH = 3;
  const UPDATED_MAX_OCTREE_DEPTH = 5;
  const TEST_RAY = new Ray(new Vector3(0, 0, 0), new Vector3(1, 0, 0));
  const TEST_CLUSTER_POSITION = new Vector3(10, 0, 0);

  type MockIconConfig = {
    clusterDistanceThreshold?: number;
    maxOctreeDepth?: number;
    htmlClustersEnabled?: boolean;
    intersectClusterResult?: ClusterIntersectionData;
  };

  const createMockIconCollection = (
    config?: MockIconConfig
  ): { mock: IMock<IconCollection>; state: MockIconConfig } => {
    const state: MockIconConfig = {
      clusterDistanceThreshold: config?.clusterDistanceThreshold ?? DEFAULT_CLUSTER_DISTANCE_THRESHOLD,
      maxOctreeDepth: config?.maxOctreeDepth ?? DEFAULT_MAX_OCTREE_DEPTH,
      htmlClustersEnabled: config?.htmlClustersEnabled ?? true,
      intersectClusterResult: config?.intersectClusterResult
    };

    const mock = new Mock<IconCollection>()
      .setup(i => i.getClusterDistanceThreshold())
      .callback(() => state.clusterDistanceThreshold ?? DEFAULT_CLUSTER_DISTANCE_THRESHOLD)
      .setup(i => i.setClusterDistanceThreshold(It.IsAny()))
      .callback(({ args }) => {
        state.clusterDistanceThreshold = args[0];
      })
      .setup(i => i.getMaxOctreeDepth())
      .callback(() => state.maxOctreeDepth)
      .setup(i => i.setMaxOctreeDepth(It.IsAny()))
      .callback(({ args }) => {
        state.maxOctreeDepth = args[0];
      })
      .setup(i => i.isHtmlClustersEnabled())
      .callback(() => state.htmlClustersEnabled ?? true)
      .setup(i => i.intersectCluster(It.IsAny()))
      .callback(() => state.intersectClusterResult)
      .setup(i => i.clearHoveredCluster())
      .returns(undefined)
      .setup(i => i.setHoveredClusterIcon(It.IsAny()))
      .returns(undefined);

    return { mock, state };
  };

  const createMockAnnotationFilter = () => new Mock<Image360AnnotationFilter>().object();
  const createMockProvider = () => new Mock<Image360Provider<ClassicDataSourceType>>().object();
  const createSetNeedsRedraw = () => jest.fn();

  const createMockIcon = () => new Mock<Overlay3DIcon>().object();

  const createMockEntity = (icon: Overlay3DIcon): IMock<Image360Entity<ClassicDataSourceType>> =>
    new Mock<Image360Entity<ClassicDataSourceType>>()
      .setup(e => e.icon)
      .returns(icon)
      .setup(e => e.dispose())
      .returns(undefined);

  const createTestCollection = (
    mockIcons: IconCollection,
    entities: Image360Entity<ClassicDataSourceType>[] = []
  ): DefaultImage360Collection<ClassicDataSourceType> => {
    const mockIdentifier = { site_id: 'test-site' };
    const collectionLabel = 'Test Collection';
    const annotationFilter = createMockAnnotationFilter();
    const provider = createMockProvider();

    return new DefaultImage360Collection(
      mockIdentifier,
      collectionLabel,
      entities,
      mockIcons,
      annotationFilter,
      provider,
      createSetNeedsRedraw()
    );
  };

  describe('cluster distance threshold get/set', () => {
    test('returns default threshold and updates after set', () => {
      const { mock } = createMockIconCollection({ clusterDistanceThreshold: DEFAULT_CLUSTER_DISTANCE_THRESHOLD });
      const collection = createTestCollection(mock.object());

      expect(collection.getClusterDistanceThreshold()).toBe(DEFAULT_CLUSTER_DISTANCE_THRESHOLD);

      collection.setClusterDistanceThreshold(UPDATED_CLUSTER_DISTANCE_THRESHOLD);
      expect(collection.getClusterDistanceThreshold()).toBe(UPDATED_CLUSTER_DISTANCE_THRESHOLD);

      collection.setClusterDistanceThreshold(SECOND_UPDATED_CLUSTER_DISTANCE_THRESHOLD);
      expect(collection.getClusterDistanceThreshold()).toBe(SECOND_UPDATED_CLUSTER_DISTANCE_THRESHOLD);

      mock.verify(i => i.setClusterDistanceThreshold(UPDATED_CLUSTER_DISTANCE_THRESHOLD), Times.Once());
      mock.verify(i => i.setClusterDistanceThreshold(SECOND_UPDATED_CLUSTER_DISTANCE_THRESHOLD), Times.Once());
    });
  });

  describe('max octree depth get/set', () => {
    test('returns default depth, updates to custom value, and allows undefined', () => {
      const { mock } = createMockIconCollection({ maxOctreeDepth: DEFAULT_MAX_OCTREE_DEPTH });
      const collection = createTestCollection(mock.object());

      expect(collection.getMaxOctreeDepth()).toBe(DEFAULT_MAX_OCTREE_DEPTH);

      collection.setMaxOctreeDepth(UPDATED_MAX_OCTREE_DEPTH);
      expect(collection.getMaxOctreeDepth()).toBe(UPDATED_MAX_OCTREE_DEPTH);

      collection.setMaxOctreeDepth(undefined);
      expect(collection.getMaxOctreeDepth()).toBeUndefined();

      mock.verify(i => i.setMaxOctreeDepth(UPDATED_MAX_OCTREE_DEPTH), Times.Once());
      mock.verify(i => i.setMaxOctreeDepth(undefined), Times.Once());
    });
  });

  describe('isHtmlClustersEnabled', () => {
    test('returns correct enabled/disabled state from IconCollection', () => {
      const { mock: enabledMock } = createMockIconCollection({ htmlClustersEnabled: true });
      const enabledCollection = createTestCollection(enabledMock.object());
      expect(enabledCollection.isHtmlClustersEnabled()).toBe(true);

      const { mock: disabledMock } = createMockIconCollection({ htmlClustersEnabled: false });
      const disabledCollection = createTestCollection(disabledMock.object());
      expect(disabledCollection.isHtmlClustersEnabled()).toBe(false);
    });
  });

  describe('cluster hover operations', () => {
    test('intersectCluster, setHoveredClusterIcon, and clearHoveredCluster delegate to IconCollection', () => {
      const mockIcon = createMockIcon();
      const clusterData: ClusterIntersectionData = {
        clusterPosition: TEST_CLUSTER_POSITION,
        clusterSize: 3,
        clusterIcons: [mockIcon],
        representativeIcon: mockIcon
      };

      const { mock } = createMockIconCollection({ intersectClusterResult: clusterData });
      const collection = createTestCollection(mock.object());

      const result = collection.intersectCluster(TEST_RAY);
      expect(result).toBe(clusterData);

      collection.setHoveredClusterIcon(mockIcon);
      collection.setHoveredClusterIcon(undefined);
      collection.clearHoveredCluster();

      mock.verify(i => i.intersectCluster(TEST_RAY), Times.Once());
      mock.verify(i => i.setHoveredClusterIcon(mockIcon), Times.Once());
      mock.verify(i => i.setHoveredClusterIcon(undefined), Times.Once());
      mock.verify(i => i.clearHoveredCluster(), Times.Once());
    });

    test('intersectCluster returns undefined when no cluster hit', () => {
      const { mock } = createMockIconCollection({ intersectClusterResult: undefined });
      const collection = createTestCollection(mock.object());

      expect(collection.intersectCluster(TEST_RAY)).toBeUndefined();
    });
  });

  describe('entity operations', () => {
    test('getEntitiesFromIcons returns mapped entities and filters unknown icons', () => {
      const icon1 = createMockIcon();
      const icon2 = createMockIcon();
      const unknownIcon = createMockIcon();

      const entity1Mock = createMockEntity(icon1);
      const entity2Mock = createMockEntity(icon2);

      const { mock } = createMockIconCollection();
      const collection = createTestCollection(mock.object(), [entity1Mock.object(), entity2Mock.object()]);

      const allEntities = collection.getEntitiesFromIcons([icon1, icon2]);
      expect(allEntities).toHaveLength(2);

      const singleEntity = collection.getEntitiesFromIcons([icon1]);
      expect(singleEntity).toHaveLength(1);
      expect(singleEntity[0]).toBe(entity1Mock.object());

      const noEntities = collection.getEntitiesFromIcons([unknownIcon]);
      expect(noEntities).toHaveLength(0);

      const mixedEntities = collection.getEntitiesFromIcons([icon1, unknownIcon]);
      expect(mixedEntities).toHaveLength(1);
    });

    test('remove disposes entity and removes from collection', () => {
      const icon = createMockIcon();
      const entityMock = createMockEntity(icon);

      const { mock } = createMockIconCollection();
      const collection = createTestCollection(mock.object(), [entityMock.object()]);

      expect(collection.image360Entities).toHaveLength(1);

      collection.remove(entityMock.object());

      expect(collection.image360Entities).toHaveLength(0);
      entityMock.verify(e => e.dispose(), Times.Once());
    });
  });
});
