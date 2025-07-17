import { beforeEach, describe, expect, test } from 'vitest';
import { ClassicCadAssetMappingPerModelCache } from './ClassicCadAssetMappingPerModelCache';
import { assetMappings3DListMock, sdkMock } from '#test-utils/fixtures/sdk';
import { createModelRevisionKey } from '../idAndKeyTranslation';
import { type RawCdfHybridCadAssetMapping } from './rawAssetMappingTypes';
import { type AssetMapping3D } from '@cognite/sdk';
import { createCursorAndAsyncIteratorMock } from '#test-utils/fixtures/cursorAndIterator';

describe(ClassicCadAssetMappingPerModelCache.name, () => {
  const MODEL_ID = 123;
  const REVISION_ID = 234;

  const modelRevisionKey = createModelRevisionKey(MODEL_ID, REVISION_ID);

  const ASSET_MAPPINGS: RawCdfHybridCadAssetMapping[] = [
    { nodeId: 1, treeIndex: 2, subtreeSize: 3, assetId: 4 },
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
      assetId: 11,
      assetInstanceId: { externalId: 'externalId1', space: 'space1' }
    }
  ];

  beforeEach(() => {
    // We need to do an explicit casting because the `AssetMapping3D` SDK type requires
    // `assetId` to be defined, but this may not be true in real life
    assetMappings3DListMock.mockReturnValue(
      createCursorAndAsyncIteratorMock({ items: ASSET_MAPPINGS as AssetMapping3D[] })
    );
  });

  test('returns undefined if nothing is cached yet', async () => {
    const cache = new ClassicCadAssetMappingPerModelCache(sdkMock);

    const result = await cache.getModelToAssetMappingCacheItems(modelRevisionKey);

    expect(result).toBeUndefined();
  });

  test('returns promise with separated mappings from `fetchAndCacheMappingsForModel`', async () => {
    const cache = new ClassicCadAssetMappingPerModelCache(sdkMock);

    const result = await cache.fetchAndCacheMappingsForModel(MODEL_ID, REVISION_ID);

    const { assetInstanceId: instanceId0, ...assetMappingBase1 } = ASSET_MAPPINGS[1];
    const {
      assetId: assetId1,
      assetInstanceId: instanceId1,
      ...assetMappingBase2
    } = ASSET_MAPPINGS[2];

    expect(result).toEqual([
      ASSET_MAPPINGS[0],
      { ...assetMappingBase1, instanceId: instanceId0 },
      { ...assetMappingBase2, assetId: assetId1 },
      { ...assetMappingBase2, instanceId: instanceId1 }
    ]);
  });

  test('calling getter returns cached result', async () => {
    const cache = new ClassicCadAssetMappingPerModelCache(sdkMock);

    const result = await cache.fetchAndCacheMappingsForModel(MODEL_ID, REVISION_ID);

    const gotResult = await cache.getModelToAssetMappingCacheItems(modelRevisionKey);
    expect(gotResult).toEqual(result);

    expect(assetMappings3DListMock).toHaveBeenCalledTimes(1);
  });

  test('results for different models are cached separately', async () => {
    const cache = new ClassicCadAssetMappingPerModelCache(sdkMock);

    const modelId1 = 987;
    const revisionId1 = 876;

    const result = await cache.fetchAndCacheMappingsForModel(MODEL_ID, REVISION_ID);

    assetMappings3DListMock.mockReturnValue(
      createCursorAndAsyncIteratorMock({ items: [ASSET_MAPPINGS[1]] as AssetMapping3D[] })
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
