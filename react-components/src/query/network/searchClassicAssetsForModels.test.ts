import { beforeEach, describe, expect, test, vi } from 'vitest';
import { searchClassicAssetsForModels } from './searchClassicAssetsForModels';
import { cadModelOptions, taggedCadModelOptions } from '#test-utils/fixtures/cadModel';
import { Mock, It } from 'moq.ts';
import {
  FilesAPI,
  type Asset,
  type AssetMappings3DAPI,
  type AssetsAPI,
  type CogniteClient,
  type HttpResponse,
  type IdEither
} from '@cognite/sdk';
import { createAssetMock } from '#test-utils/fixtures/assets';
import assert from 'assert';
import { isInternalId } from '../../utilities/instanceIds';
import { type AssetMappingAndNode3DCache } from '../../components/CacheProvider/AssetMappingAndNode3DCache';
import { type RevealRenderTarget } from '../../architecture';
import { drop, take } from 'lodash';
import { taggedPointCloudModelOptions } from '#test-utils/fixtures/pointCloud';
import { createPointCloudAnnotationMock } from '#test-utils/fixtures/pointCloudAnnotation';
import { createCursorAndAsyncIteratorMock } from '#test-utils/fixtures/cursorAndIterator';
import { createAssetMappingMock } from '#test-utils/fixtures/cadAssetMapping';
import {
  taggedImage360ClassicOptions,
  taggedImage360DmOptions
} from '#test-utils/fixtures/image360';
import { createFileMock } from '#test-utils/fixtures/files';
import { createClassic360AnnotationMock } from '#test-utils/fixtures/image360Annotations';

const ARBITRARY_SEARCH_LIMIT = 100;

const TEST_ASSETS = [
  createAssetMock(0, 'asset0'),
  createAssetMock(1, 'asset1'),
  createAssetMock(2, 'asset2', 'this is not asset1')
];
const TEST_PROJECT = 'test_project';

const mockAssetMappings3dFilter = vi.fn<AssetMappings3DAPI['filter']>();
const mockAssetsRetrieve = vi.fn<AssetsAPI['retrieve']>();
const mockPostAssetList = vi.fn<CogniteClient['post']>();
const mockAnnotationsList = vi.fn<CogniteClient['annotations']['list']>();
const mockFilesList = vi.fn<FilesAPI['list']>();

const mockSdk = new Mock<CogniteClient>()
  .setup((p) => p.annotations.list)
  .returns(mockAnnotationsList)
  .setup((p) => p.assetMappings3D.filter)
  .returns(mockAssetMappings3dFilter)
  .setup((p) => p.assets.retrieve)
  .returns(mockAssetsRetrieve)
  .setup((p) => p.files.list)
  .returns(mockFilesList)
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
    mockPostAssetList.mockResolvedValue(createHttpResponseObject({ items: [] }));
  });

  describe('CAD models', () => {
    beforeEach(() => {
      mockAssetsRetrieve.mockImplementation(
        async (idObjects) => await findIdEitherInAssetList(idObjects, TEST_ASSETS)
      );
    });

    describe('without query string', () => {
      test('calls `sdk.assetMappings3D.filter` with input models and returns empty result when models have no mapped data', async () => {
        const results = await searchClassicAssetsForModels(
          '',
          [taggedCadModelOptions],
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
            items: TEST_ASSETS.map((asset) => createAssetMappingMock({ assetId: asset.id }))
          })
        );

        const results = await searchClassicAssetsForModels(
          '',
          [taggedCadModelOptions],
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
          items: take(assetList, searchLimit).map((asset) =>
            createAssetMappingMock({ assetId: asset.id })
          ),
          nextCursor: secondPageCursor
        };

        const assetMappingFilterResponse1 = {
          items: drop(assetList, searchLimit).map((asset) =>
            createAssetMappingMock({ assetId: asset.id })
          )
        };

        mockAssetMappings3dFilter
          .mockReturnValueOnce(createCursorAndAsyncIteratorMock(assetMappingFilterResponse0))
          .mockReturnValueOnce(createCursorAndAsyncIteratorMock(assetMappingFilterResponse1));

        mockAssetsRetrieve.mockImplementation(
          async (idObjects) => await findIdEitherInAssetList(idObjects, assetList)
        );

        const results = await searchClassicAssetsForModels(
          '',
          [taggedCadModelOptions],
          searchLimit,
          undefined,
          mockSdk,
          mockRenderTarget
        );

        expect(results.nextCursor).toBeDefined();

        const nextPageResults = await searchClassicAssetsForModels(
          '',
          [taggedCadModelOptions],
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
        const results = await searchClassicAssetsForModels(
          'some-query',
          [taggedCadModelOptions],
          ARBITRARY_SEARCH_LIMIT,
          undefined,
          mockSdk,
          mockRenderTarget
        );

        expect(results).toEqual({ nextCursor: undefined, data: [] });
      });

      test('returns with mapping when query has result', async () => {
        mockGetAssetMappingsForModel.mockResolvedValue(
          TEST_ASSETS.map((asset) => createAssetMappingMock({ assetId: asset.id }))
        );
        mockPostAssetList.mockResolvedValue(createHttpResponseObject({ items: TEST_ASSETS }));

        const results = await searchClassicAssetsForModels(
          'some-query',
          [taggedCadModelOptions],
          ARBITRARY_SEARCH_LIMIT,
          undefined,
          mockSdk,
          mockRenderTarget
        );

        expect(results).toEqual({ nextCursor: undefined, data: TEST_ASSETS });
      });
    });
  });

  describe('Point clouds', () => {
    beforeEach(() => {
      mockAssetsRetrieve.mockImplementation(
        async (idObjects) => await findIdEitherInAssetList(idObjects, TEST_ASSETS)
      );
      mockAnnotationsList.mockReturnValue(createCursorAndAsyncIteratorMock({ items: [] }));
    });

    test('returns empty result when no relevant results exist', async () => {
      const result = await searchClassicAssetsForModels(
        'asset1',
        [taggedPointCloudModelOptions],
        ARBITRARY_SEARCH_LIMIT,
        undefined,
        mockSdk,
        mockRenderTarget
      );

      expect(result).toEqual({ data: [], nextCursor: undefined });
    });

    test('returns relevant assets when there is contextualization', async () => {
      const pointCloudAnnotations = TEST_ASSETS.map((asset) =>
        createPointCloudAnnotationMock({
          assetId: asset.id,
          modelId: taggedPointCloudModelOptions.addOptions.modelId
        })
      );

      mockAnnotationsList.mockReturnValue(
        createCursorAndAsyncIteratorMock({
          items: pointCloudAnnotations
        })
      );

      const result = await searchClassicAssetsForModels(
        'asset1',
        [taggedPointCloudModelOptions],
        ARBITRARY_SEARCH_LIMIT,
        undefined,
        mockSdk,
        mockRenderTarget
      );

      // TEST_ASSET[1] has the query string in the name, TEST_ASSETS[2] has it in the description
      expect(result).toEqual({ data: [TEST_ASSETS[1], TEST_ASSETS[2]], nextCursor: undefined });
    });
  });

  describe('360 images', () => {
    const TEST_FILES = [
      createFileMock({
        id: 1,
        metadata: { siteId: taggedImage360ClassicOptions.addOptions.siteId }
      })
    ];

    beforeEach(() => {
      mockFilesList.mockReturnValue(createCursorAndAsyncIteratorMock({ items: TEST_FILES }));
      mockAnnotationsList.mockReturnValue(createCursorAndAsyncIteratorMock({ items: [] }));
      mockAssetsRetrieve.mockImplementation(
        async (idObjects) => await findIdEitherInAssetList(idObjects, TEST_ASSETS)
      );
    });

    test('returns no assets when no relevant ones are found', async () => {
      const result = await searchClassicAssetsForModels(
        '',
        [taggedImage360ClassicOptions, taggedImage360DmOptions],
        ARBITRARY_SEARCH_LIMIT,
        undefined,
        mockSdk,
        mockRenderTarget
      );

      expect(result).toEqual({ data: [], nextCursor: undefined });
    });

    test('returns relevant assets when there is contextualization', async () => {
      const mockAnnotations = TEST_FILES.map((file) =>
        createClassic360AnnotationMock({ fileId: file.id, assetId: TEST_ASSETS[0].id })
      );
      mockAnnotationsList.mockReturnValue(
        createCursorAndAsyncIteratorMock({ items: mockAnnotations })
      );
      const result = await searchClassicAssetsForModels(
        'asset0',
        [taggedImage360ClassicOptions, taggedImage360DmOptions],
        ARBITRARY_SEARCH_LIMIT,
        undefined,
        mockSdk,
        mockRenderTarget
      );

      expect(result).toEqual({ data: [TEST_ASSETS[0]], nextCursor: undefined });
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
