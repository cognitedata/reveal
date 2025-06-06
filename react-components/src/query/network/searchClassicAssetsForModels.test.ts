import { beforeEach, describe, expect, test, vi } from 'vitest';
import { searchClassicAssetsForModels } from './searchClassicAssetsForModels';
import { cadModelOptions } from '#test-utils/fixtures/cadModel';
import { Mock, It } from 'moq.ts';
import {
  type CogniteAsyncIterator,
  type ListResponse,
  type Asset,
  type AssetMappings3DAPI,
  type AssetsAPI,
  type CogniteClient,
  type CursorAndAsyncIterator,
  type HttpResponse,
  type IdEither
} from '@cognite/sdk';
import { createAssetMock } from '#test-utils/fixtures/assets';
import assert from 'assert';
import { isInternalId } from '../../utilities/instanceIds';
import { type AssetMappingAndNode3DCache } from '../../components/CacheProvider/AssetMappingAndNode3DCache';
import { type RevealRenderTarget } from '../../architecture';
import { type CdfAssetMapping } from '../../components/CacheProvider/types';
import { drop, take } from 'lodash';

const ARBITRARY_SEARCH_LIMIT = 100;
const ARBITRARY_NODE_ID = 200;
const ARBITRARY_TREE_INDEX = 143;

const TEST_ASSETS = [createAssetMock(0), createAssetMock(1), createAssetMock(2)];
const TEST_PROJECT = 'test_project';

const mockAssetMappings3dFilter = vi.fn<AssetMappings3DAPI['filter']>();
const mockAssetsRetrieve = vi.fn<AssetsAPI['retrieve']>();
const mockPostAssetList = vi.fn<CogniteClient['post']>();

const mockSdk = new Mock<CogniteClient>()
  .setup((p) => p.assetMappings3D.filter)
  .returns(mockAssetMappings3dFilter)
  .setup((p) => p.assets.retrieve)
  .returns(mockAssetsRetrieve)
  .setup((p) => p.project)
  .returns(TEST_PROJECT)
  .setup(
    async (p) =>
      await p.post(
        It.Is((url) => url === `/api/v1/projects/${TEST_PROJECT}/assets/list`),
        It.IsAny()
      )
  )
  .callback(async ({ args: [url, parameters] }) => await mockPostAssetList(url, parameters))
  .object();

const mockGetAssetMappingsForModel =
  vi.fn<AssetMappingAndNode3DCache['getAssetMappingsForModel']>();

const mockRenderTarget = new Mock<RevealRenderTarget>()
  .setup((p) => p.cdfCaches.assetMappingAndNode3dCache)
  .returns(
    new Mock<AssetMappingAndNode3DCache>()
      .setup((p) => p.getAssetMappingsForModel)
      .returns(mockGetAssetMappingsForModel)
      .object()
  )
  .object();

describe(searchClassicAssetsForModels.name, () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockAssetMappings3dFilter.mockReturnValue(createCursorAndAsyncIteratorMock({ items: [] }));

    mockAssetsRetrieve.mockImplementation(
      async (idObjects) => await findIdEitherInAssetList(idObjects, TEST_ASSETS)
    );
  });

  describe('without query string', () => {
    test('calls `sdk.assetMappings3D.filter` with input models and returns empty result when models have no mapped data', async () => {
      const results = await searchClassicAssetsForModels(
        '',
        [cadModelOptions],
        [],
        ARBITRARY_SEARCH_LIMIT,
        undefined,
        mockSdk,
        mockRenderTarget
      );

      expect(mockAssetMappings3dFilter).toHaveBeenCalledWith(
        cadModelOptions.modelId,
        cadModelOptions.revisionId,
        { cursor: undefined, limit: ARBITRARY_SEARCH_LIMIT }
      );
      expect(results).toEqual({ nextCursor: undefined, data: [] });
    });

    test('returns relevant mapped data when models have contextualization', async () => {
      mockAssetMappings3dFilter.mockReturnValue(
        createCursorAndAsyncIteratorMock({
          items: TEST_ASSETS.map((asset) => createAssetMapping(asset.id))
        })
      );

      const results = await searchClassicAssetsForModels(
        '',
        [cadModelOptions],
        [],
        ARBITRARY_SEARCH_LIMIT,
        undefined,
        mockSdk,
        mockRenderTarget
      );

      expect(results).toEqual({ nextCursor: undefined, data: TEST_ASSETS });
    });

    test('is able fetch all assets using cursors', async () => {
      const searchLimit = 10;
      const numAssets = 14;
      const assetList = [...Array(numAssets).keys()].map((id) => createAssetMock(id));

      const secondPageCursor = 'second-page-cursor';

      const assetMappingFilterResponse0 = {
        items: take(assetList, searchLimit).map((asset) => createAssetMapping(asset.id)),
        nextCursor: secondPageCursor
      };

      const assetMappingFilterResponse1 = {
        items: drop(assetList, searchLimit).map((asset) => createAssetMapping(asset.id))
      };

      mockAssetMappings3dFilter
        .mockReturnValueOnce(createCursorAndAsyncIteratorMock(assetMappingFilterResponse0))
        .mockReturnValueOnce(createCursorAndAsyncIteratorMock(assetMappingFilterResponse1));

      mockAssetsRetrieve.mockImplementation(
        async (idObjects) => await findIdEitherInAssetList(idObjects, assetList)
      );

      const results = await searchClassicAssetsForModels(
        '',
        [cadModelOptions],
        [],
        searchLimit,
        undefined,
        mockSdk,
        mockRenderTarget
      );

      expect(results.nextCursor).toBeDefined();

      const nextPageResults = await searchClassicAssetsForModels(
        '',
        [cadModelOptions],
        [],
        searchLimit,
        results.nextCursor,
        mockSdk,
        mockRenderTarget
      );

      expect(nextPageResults.nextCursor).toBeUndefined();

      expect(mockAssetMappings3dFilter).toHaveBeenCalledWith(
        cadModelOptions.modelId,
        cadModelOptions.revisionId,
        expect.objectContaining({ cursor: secondPageCursor })
      );

      expect([...results.data, ...nextPageResults.data]).toEqual(assetList);
    });
  });

  describe('with search query', () => {
    test('returns with no mappings when query has no result', async () => {
      mockGetAssetMappingsForModel.mockResolvedValue([]);
      mockPostAssetList.mockResolvedValue(createHttpResponseObject({ items: [] }));
      const results = await searchClassicAssetsForModels(
        'some-query',
        [cadModelOptions],
        [],
        ARBITRARY_SEARCH_LIMIT,
        undefined,
        mockSdk,
        mockRenderTarget
      );

      expect(results).toEqual({ nextCursor: undefined, data: [] });
    });

    test('returns with mapping when query has result', async () => {
      mockGetAssetMappingsForModel.mockResolvedValue(
        TEST_ASSETS.map((asset) => createAssetMapping(asset.id))
      );
      mockPostAssetList.mockResolvedValue(createHttpResponseObject({ items: TEST_ASSETS }));

      const results = await searchClassicAssetsForModels(
        'some-query',
        [cadModelOptions],
        [],
        ARBITRARY_SEARCH_LIMIT,
        undefined,
        mockSdk,
        mockRenderTarget
      );

      expect(results).toEqual({ nextCursor: undefined, data: TEST_ASSETS });
    });
  });
});

async function findIdEitherInAssetList(idObjects: IdEither[], assets: Asset[]): Promise<Asset[]> {
  return await Promise.resolve(
    idObjects.map((idEither) => {
      assert(isInternalId(idEither));

      const asset = assets.find((asset) => asset.id === idEither.id);

      assert(asset !== undefined);

      return asset;
    })
  );
}

function createHttpResponseObject<T>(data: T): HttpResponse<T> {
  return {
    data,
    status: 200,
    headers: {}
  };
}

function createAssetMapping(assetId: number): CdfAssetMapping {
  return { assetId, nodeId: ARBITRARY_NODE_ID, treeIndex: ARBITRARY_TREE_INDEX, subtreeSize: 1 };
}

function createCursorAndAsyncIteratorMock<T>(
  response: ListResponse<T[]>
): CursorAndAsyncIterator<T> {
  return Object.assign(Promise.resolve(response), new Mock<CogniteAsyncIterator<T>>().object());
}
