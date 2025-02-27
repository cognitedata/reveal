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
import { sdkMock, retrieveMock, postMock } from '../../../tests/tests-utilities/fixtures/sdk';
import { createAssetMock, createDMAssetMock } from '../../../tests/tests-utilities/fixtures/assets';

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

      expect(result).toEqual([]);
    });

    test('should handle assets for duplicate asset IDs', async () => {
      const assetIds: IdEither[] = [{ id: 1 }, { id: 1 }];
      const nonDuplicateAssets: Asset[] = [createAssetMock(1)];
      retrieveMock.mockResolvedValueOnce(nonDuplicateAssets);
      const result = await fetchAssetsForAssetIds(assetIds, sdkMock);

      expect(result).toEqual(nonDuplicateAssets);
    });

    test('should handle assets for duplicate asset IDs correctly', async () => {
      const assetIds: IdEither[] = [{ id: 1 }, { id: 1 }];
      const nonDuplicateAssets: Asset[] = [createAssetMock(1)];
      retrieveMock.mockResolvedValueOnce(nonDuplicateAssets);
      const result = await fetchAssetsForAssetIds(assetIds, sdkMock);

      expect(result).toEqual(nonDuplicateAssets);
    });
  });

  describe('fetchAssetsForAssetReferences', () => {
    test('should fetch assets for given asset references', async () => {
      const dmAssets: Asset[] = [
        createDMAssetMock('asset-external-id1', 'asset-1'),
        createDMAssetMock('asset-external-id2', 'asset-2')
      ];
      const assetReferences: InstanceReference[] = [
        { id: 1 },
        { id: 2 },
        { externalId: 'asset-external-id1', space: 'asset-space' }
      ];
      const assetInstances = [{ id: 1 }, { id: 2 }];
      retrieveMock.mockResolvedValueOnce(assets);
      postMock.mockResolvedValueOnce({ data: { items: dmAssets }, status: 200, headers: {} });

      const result = await fetchAssetsForAssetReferences(assetReferences, sdkMock);

      expect(result).toEqual(assetInstances);
    });
  });

  // describe('fetchPointCloudAnnotationAssets', () => {
  //   test('should fetch assets for given point cloud annotations', async () => {
  //     const annotations: PointCloudAnnotationModel[] = [{ id: 1, assetId: { id: 1 } }, { id: 2, assetId: { id: 2 } }];
  //     const assets: Asset[] = [
  //       { id: 1, rootId: 0, name: 'Asset 1', lastUpdatedTime: new Date(), createdTime: new Date() },
  //       { id: 2, rootId: 0, name: 'Asset 2', lastUpdatedTime: new Date(), createdTime: new Date() }
  //     ];
  //     retrieveMock.mockResolvedValueOnce(assets);

  //     const result = await fetchPointCloudAnnotationAssets(annotations, sdkMock);

  //     expect(result.size).toBe(2);
  //     expect(result.get(1)).toEqual({ id: 1 });
  //     expect(result.get(2)).toEqual({ id: 2 });
  //   });
  // });
});
