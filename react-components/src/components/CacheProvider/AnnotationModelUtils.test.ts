/*!
 * Copyright 2025 Cognite AS
 */
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { type Asset, type IdEither } from '@cognite/sdk';
import {
  fetchAssetsForAssetIds,
  fetchAssetsForAssetReferences,
  fetchPointCloudAnnotationAssets
} from './AnnotationModelUtils';
import { type InstanceReference } from '../../utilities/instanceIds';
import { type PointCloudAnnotationModel } from './types';
import { sdkMock, retrieveMock } from '#test-utils/fixtures/sdk';
import { createAssetMock, createDMAssetMock } from '#test-utils/fixtures/assets';
import { type ExternalIdsResultList } from '../../data-providers/FdmSDK';
import { type AssetProperties } from '../../data-providers/core-dm-provider/utils/filters';
import {
  CORE_DM_SPACE,
  COGNITE_ASSET_VIEW_VERSION_KEY
} from '../../data-providers/core-dm-provider/dataModels';

describe('AnnotationModelUtils', () => {
  let assets: Asset[];
  beforeEach(() => {
    vi.resetAllMocks();
    assets = [createAssetMock(1), createAssetMock(2)];
  });

  describe('fetchAssetsForAssetIds', () => {
    test('should fetch assets for given asset IDs', async () => {
      const assetIds: IdEither[] = [{ id: 1 }, { id: 2 }];
      retrieveMock.mockResolvedValueOnce(assets);

      const result = await fetchAssetsForAssetIds(assetIds, sdkMock);

      expect(retrieveMock).toHaveBeenCalledWith(assetIds, { ignoreUnknownIds: true });
      expect(result).toEqual(assets);
    });

    test('should handle empty asset IDs', async () => {
      const assetIds: IdEither[] = [];
      const result = await fetchAssetsForAssetIds(assetIds, sdkMock);

      expect(retrieveMock).not.toHaveBeenCalledWith(assetIds, { ignoreUnknownIds: true });
      expect(result).toEqual([]);
    });

    test('should handle assets for duplicate asset IDs correctly', async () => {
      const assetIds: IdEither[] = [{ id: 1 }, { id: 1 }];
      const nonDuplicateAssets: Asset[] = [createAssetMock(1)];
      retrieveMock.mockResolvedValueOnce(nonDuplicateAssets);
      const result = await fetchAssetsForAssetIds(assetIds, sdkMock);

      expect(retrieveMock).toHaveBeenCalledWith([assetIds[0]], { ignoreUnknownIds: true });
      expect(result).toEqual(nonDuplicateAssets);
    });
  });

  describe('fetchAssetsForAssetReferences', () => {
    test('should fetch assets for given asset references', async () => {
      const dmAssets: ExternalIdsResultList<AssetProperties> =
        createDMAssetMock('asset-external-id1');
      const assetReferences: InstanceReference[] = [
        { id: 1 },
        { externalId: 'asset-external-id1', space: 'asset-space' }
      ];
      retrieveMock.mockResolvedValueOnce([assets[0]]);

      const result = await fetchAssetsForAssetReferences(assetReferences, sdkMock);
      const dmExpectedAssets = dmAssets.items.map((item) => ({
        ...item,
        properties: item.properties[CORE_DM_SPACE][COGNITE_ASSET_VIEW_VERSION_KEY]
      }));
      const expectedAssets = [assets[0], ...dmExpectedAssets];

      expect(retrieveMock).toHaveBeenCalledWith([assetReferences[0]], {
        ignoreUnknownIds: true
      });
      expect(result).toEqual(expectedAssets);
    });
  });

  describe('fetchPointCloudAnnotationAssets', () => {
    test('should fetch assets for given point cloud annotations', async () => {
      const assetRef = { id: 1 };
      const annotations: PointCloudAnnotationModel[] = [
        {
          id: 1,
          createdTime: new Date(),
          lastUpdatedTime: new Date(),
          status: 'approved',
          annotatedResourceType: 'threedmodel',
          annotatedResourceId: 1,
          annotationType: 'pointCloud',
          creatingApp: 'testApp',
          creatingAppVersion: '1.0',
          creatingUser: 'testUser',
          data: {
            assetRef,
            region: [{ box: { matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] } }]
          }
        }
      ];
      retrieveMock.mockResolvedValueOnce(assets);

      const result = await fetchPointCloudAnnotationAssets(annotations, sdkMock);

      expect(retrieveMock).toHaveBeenCalledWith([assetRef], {
        ignoreUnknownIds: true
      });
      expect(result.size).toBe(1);
      expect(result.get(1)).toEqual(assets[0]);
    });

    test('should fetch asset for given point cloud annotations containing multiple annotation with same asset', async () => {
      const assetRef = { id: 1 };
      const annotations: PointCloudAnnotationModel[] = [
        {
          id: 1,
          createdTime: new Date(),
          lastUpdatedTime: new Date(),
          status: 'approved',
          annotatedResourceType: 'threedmodel',
          annotatedResourceId: 1,
          annotationType: 'pointCloud',
          creatingApp: 'testApp',
          creatingAppVersion: '1.0',
          creatingUser: 'testUser',
          data: {
            assetRef,
            region: [{ box: { matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] } }]
          }
        },
        {
          id: 2,
          createdTime: new Date(),
          lastUpdatedTime: new Date(),
          status: 'approved',
          annotatedResourceType: 'threedmodel',
          annotatedResourceId: 2,
          annotationType: 'pointCloud',
          creatingApp: 'testApp',
          creatingAppVersion: '1.0',
          creatingUser: 'testUser',
          data: {
            assetRef,
            region: [{ box: { matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] } }]
          }
        }
      ];
      retrieveMock.mockResolvedValueOnce([assets[0]]);

      const result = await fetchPointCloudAnnotationAssets(annotations, sdkMock);

      expect(retrieveMock).toHaveBeenCalledWith([assetRef], {
        ignoreUnknownIds: true
      });
      expect(result.size).toBe(2);
      expect(result.get(1)).toEqual(assets[0]);
    });
  });
});
