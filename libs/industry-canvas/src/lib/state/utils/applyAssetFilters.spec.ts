import { ContainerType } from '@cognite/unified-file-viewer';

import {
  AssetContainerConfig,
  AssetContainerConfig2,
  EventContainerConfigTypeBB1,
} from './__mock__/data';
import applyAssetFilters from './applyAssetFilters';

describe('applyAssetFilters', () => {
  it('should not apply any asset filter if no asset container', () => {
    expect(
      applyAssetFilters(
        [EventContainerConfigTypeBB1],
        ['property-path'],
        false
      )([])
    ).toEqual([]);
  });

  describe('generic asset filters', () => {
    it('should apply generic asset filter if shouldApplyToAll is passed', () => {
      expect(
        applyAssetFilters([AssetContainerConfig], ['property-path'], true)([])
      ).toEqual([
        {
          appliesToContainerType: ContainerType.ASSET,
          properties: ['property-path'],
        },
      ]);
    });

    it('should override specific asset filters', () => {
      expect(
        applyAssetFilters([AssetContainerConfig], ['property-path3'], true)([])
      ).toEqual([
        {
          appliesToContainerType: ContainerType.ASSET,
          properties: ['property-path3'],
        },
      ]);
    });
  });

  describe('specific asset filters', () => {
    it('should apply specific asset filters for each asset container', () => {
      expect(
        applyAssetFilters(
          [AssetContainerConfig, AssetContainerConfig2],
          ['property-path', 'property-path-2'],
          false
        )([])
      ).toEqual([
        {
          appliesToContainerType: ContainerType.ASSET,
          containerId: 'asset-container-id',
          properties: ['property-path', 'property-path-2'],
        },
        {
          appliesToContainerType: ContainerType.ASSET,
          containerId: 'asset-container-id2',
          properties: ['property-path', 'property-path-2'],
        },
      ]);
    });

    it('should not override other specific asset filters', () => {
      const existingFilter = {
        appliesToContainerType: ContainerType.ASSET,
        containerId: AssetContainerConfig2.id,
        properties: ['property-path3'],
      };

      expect(
        applyAssetFilters(
          [AssetContainerConfig],
          ['property-path', 'property-path-2'],
          false
        )([existingFilter])
      ).toEqual([
        existingFilter,
        {
          appliesToContainerType: ContainerType.ASSET,
          containerId: AssetContainerConfig.id,
          properties: ['property-path', 'property-path-2'],
        },
      ]);
    });
  });
});
