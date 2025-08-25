import { beforeEach, describe, expect, test } from 'vitest';
import { ClassicCadAssetMappingPerModelCache } from './ClassicCadAssetMappingPerModelCache';
import { assetMappings3DListMock, sdkMock } from '#test-utils/fixtures/sdk';
import { createModelRevisionKey } from '../idAndKeyTranslation';
import {
  convertToHybridAssetMapping,
  type RawCdfHybridCadAssetMapping
} from './rawAssetMappingTypes';
import { type AssetMapping3D } from '@cognite/sdk';
import { createCursorAndAsyncIteratorMock } from '#test-utils/fixtures/cursorAndIterator';

describe(ClassicCadAssetMappingPerModelCache.name, () => {
  const MODEL_ID = 123;
  const REVISION_ID = 234;

  const modelRevisionKey = createModelRevisionKey(MODEL_ID, REVISION_ID);

  const CLASSIC_ASSET_MAPPINGS: RawCdfHybridCadAssetMapping[] = [
    { nodeId: 1, treeIndex: 2, subtreeSize: 3, assetId: 4 },
    { nodeId: 11, treeIndex: 12, subtreeSize: 13, assetId: 14 }
  ];

  const DM_ASSET_MAPPINGS: RawCdfHybridCadAssetMapping[] = [
    {
      nodeId: 5,
      treeIndex: 6,
      subtreeSize: 7,
      assetInstanceId: { externalId: 'externalId0', space: 'space0' }
    },
    {
      nodeId: 8,
      treeIndex: 9,
      subtreeSize: 10,
      assetInstanceId: { externalId: 'externalId1', space: 'space1' }
    }
  ];

  beforeEach(() => {
    // SDK method uses `AssetMapping3D', but it is out of
    // date with the API definition, so we need to cast
    assetMappings3DListMock
      .mockReturnValueOnce(
        createCursorAndAsyncIteratorMock({ items: CLASSIC_ASSET_MAPPINGS as AssetMapping3D[] })
      )
      .mockReturnValueOnce(
        createCursorAndAsyncIteratorMock({ items: DM_ASSET_MAPPINGS as AssetMapping3D[] })
      );
  });

  test('returns undefined if nothing is cached yet', async () => {
    const cache = new ClassicCadAssetMappingPerModelCache(sdkMock);

    const result = await cache.getModelToAssetMappingCacheItems(modelRevisionKey);

    expect(result).toBeUndefined();
  });

  test('returns promise with both classic and DM mappings from `fetchAndCacheMappingsForModel`', async () => {
    const cache = new ClassicCadAssetMappingPerModelCache(sdkMock);

    const result = await cache.fetchAndCacheMappingsForModel(MODEL_ID, REVISION_ID);

    expect(result).toEqual([
      CLASSIC_ASSET_MAPPINGS[0],
      CLASSIC_ASSET_MAPPINGS[1],
      convertToHybridAssetMapping(DM_ASSET_MAPPINGS[0]),
      convertToHybridAssetMapping(DM_ASSET_MAPPINGS[1])
    ]);
  });

  test('calling getter returns cached result', async () => {
    const cache = new ClassicCadAssetMappingPerModelCache(sdkMock);

    const result = await cache.fetchAndCacheMappingsForModel(MODEL_ID, REVISION_ID);

    // List endpoint gets called twice, once for classic and once for DM
    expect(assetMappings3DListMock).toHaveBeenCalledTimes(2);

    const gotResult = await cache.getModelToAssetMappingCacheItems(modelRevisionKey);
    expect(gotResult).toEqual(result);

    expect(assetMappings3DListMock).toHaveBeenCalledTimes(2);
  });

  test('results for different models are cached separately', async () => {
    const cache = new ClassicCadAssetMappingPerModelCache(sdkMock);

    const modelId1 = 987;
    const revisionId1 = 876;

    const result = await cache.fetchAndCacheMappingsForModel(MODEL_ID, REVISION_ID);

    assetMappings3DListMock.mockReturnValue(
      // SDK method uses `AssetMapping3D', but it is out of
      // date with the API definition, so we need to cast
      createCursorAndAsyncIteratorMock({ items: [CLASSIC_ASSET_MAPPINGS[1]] as AssetMapping3D[] })
    );

    const result1 = await cache.fetchAndCacheMappingsForModel(modelId1, revisionId1);

    expect(result1).not.toEqual(result);
  });

  test('calls asset mapping endpoint with getDmsInstances: true', async () => {
    const cache = new ClassicCadAssetMappingPerModelCache(sdkMock);

    await cache.fetchAndCacheMappingsForModel(MODEL_ID, REVISION_ID);

    expect(assetMappings3DListMock).toHaveBeenCalledWith(
      MODEL_ID,
      REVISION_ID,
      expect.objectContaining({ getDmsInstances: true })
    );
  });
});
