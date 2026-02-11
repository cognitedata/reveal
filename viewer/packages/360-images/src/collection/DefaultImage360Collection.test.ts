/*!
 * Copyright 2026 Cognite AS
 */

import { Mock, It, Times, IMock } from 'moq.ts';
import { jest } from '@jest/globals';
import { DefaultImage360Collection } from './DefaultImage360Collection';
import { IconCollection } from '../icons/IconCollection';
import { Image360Entity } from '../entity/Image360Entity';
import { Image360AnnotationFilter } from '../annotation/Image360AnnotationFilter';
import { ClassicDataSourceType, Image360Provider } from '@reveal/data-providers';

describe(DefaultImage360Collection.name, () => {
  const DEFAULT_CLUSTER_DISTANCE_THRESHOLD = 25;
  const UPDATED_CLUSTER_DISTANCE_THRESHOLD = 50;
  const SECOND_UPDATED_CLUSTER_DISTANCE_THRESHOLD = 100;
  const DEFAULT_MAX_OCTREE_DEPTH = 3;
  const UPDATED_MAX_OCTREE_DEPTH = 5;

  type MockIconConfig = {
    clusterDistanceThreshold?: number;
    maxOctreeDepth?: number;
    htmlClustersEnabled?: boolean;
  };

  const createMockIconCollection = (
    config?: MockIconConfig
  ): { mock: IMock<IconCollection>; state: MockIconConfig } => {
    const state: MockIconConfig = {
      clusterDistanceThreshold: config?.clusterDistanceThreshold ?? DEFAULT_CLUSTER_DISTANCE_THRESHOLD,
      maxOctreeDepth: config?.maxOctreeDepth ?? DEFAULT_MAX_OCTREE_DEPTH,
      htmlClustersEnabled: config?.htmlClustersEnabled ?? true
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
      .callback(() => state.htmlClustersEnabled ?? true);

    return { mock, state };
  };

  const createMockAnnotationFilter = () => new Mock<Image360AnnotationFilter>().object();
  const createMockProvider = () => new Mock<Image360Provider<ClassicDataSourceType>>().object();
  const createSetNeedsRedraw = () => jest.fn();

  const createTestCollection = (mockIcons: IconCollection): DefaultImage360Collection<ClassicDataSourceType> => {
    const mockIdentifier = { site_id: 'test-site' };
    const collectionLabel = 'Test Collection';
    const entities: Image360Entity<ClassicDataSourceType>[] = [];
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
});
