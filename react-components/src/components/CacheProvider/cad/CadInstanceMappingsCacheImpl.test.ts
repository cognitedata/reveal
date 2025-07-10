import { beforeEach, describe, expect, test, vi } from 'vitest';
import { type CadInstanceMappingsCache } from './CadInstanceMappingsCache';
import { type FdmCadNodeCache } from './FdmCadNodeCache';
import { type ClassicCadAssetMappingCache } from './ClassicCadAssetMappingCache';
import { type DmsUniqueIdentifier } from '../../../data-providers';
import { createCadNodeMock } from '#test-utils/fixtures/cadNode';
import { createFdmKey, createModelRevisionKey } from '../idAndKeyTranslation';
import { type AssetId } from '../types';
import { createCadInstanceMappingsCache } from './CadInstanceMappingsCacheImpl';

describe(createCadInstanceMappingsCache.name, () => {
  const mockClassicGetAssetMappingsForLowestAncestor =
    vi.fn<ClassicCadAssetMappingCache['getAssetMappingsForLowestAncestor']>();
  const mockClassicGetNodesForAssetIds =
    vi.fn<ClassicCadAssetMappingCache['getNodesForAssetIds']>();
  const mockClassicGenerateNode3DCachePerItem =
    vi.fn<ClassicCadAssetMappingCache['generateNode3DCachePerItem']>();
  const mockClassicGenerateAssetMappingsCachePerItemFromModelCache =
    vi.fn<ClassicCadAssetMappingCache['generateAssetMappingsCachePerItemFromModelCache']>();
  const mockClassicGetAssetMappingsForModel =
    vi.fn<ClassicCadAssetMappingCache['getAssetMappingsForModel']>();

  const mockClassicCadAssetMappingCache: ClassicCadAssetMappingCache = {
    getAssetMappingsForLowestAncestor: mockClassicGetAssetMappingsForLowestAncestor,
    getNodesForAssetIds: mockClassicGetNodesForAssetIds,
    generateNode3DCachePerItem: mockClassicGenerateNode3DCachePerItem,
    generateAssetMappingsCachePerItemFromModelCache:
      mockClassicGenerateAssetMappingsCachePerItemFromModelCache,
    getAssetMappingsForModel: mockClassicGetAssetMappingsForModel
  };

  const mockDmGetMappingsForFdmInstances = vi.fn<FdmCadNodeCache['getMappingsForFdmInstances']>();
  const mockDmGetAllMappingExternalIds = vi.fn<FdmCadNodeCache['getAllMappingExternalIds']>();
  const mockDmGetClossetParentDataPromises =
    vi.fn<FdmCadNodeCache['getClosestParentDataPromises']>();

  const mockFdmCadAssetMappingCache: FdmCadNodeCache = {
    getMappingsForFdmInstances: mockDmGetMappingsForFdmInstances,
    getAllMappingExternalIds: mockDmGetAllMappingExternalIds,
    getClosestParentDataPromises: mockDmGetClossetParentDataPromises
  };

  const MODELS = [
    {
      modelId: 123,
      revisionId: 234
    },
    {
      modelId: 345,
      revisionId: 456
    }
  ];

  const CLASSIC_INSTANCES = [13, 42] as const satisfies AssetId[];

  const DM_INSTANCES: DmsUniqueIdentifier[] = [
    { externalId: 'external-id0', space: 'space0' },
    { externalId: 'external-id1', space: 'space1' }
  ];

  let cacheWrapper: CadInstanceMappingsCache;

  beforeEach(() => {
    cacheWrapper = createCadInstanceMappingsCache(
      mockClassicCadAssetMappingCache,
      mockFdmCadAssetMappingCache
    );
  });

  describe('getMappingsForModelsAndInstances', () => {
    test('returns classic and dm results as provided from classic and dm caches respectively', async () => {
      const cadNodes = [
        createCadNodeMock({ treeIndex: 1 }),
        createCadNodeMock({ treeIndex: 2 }),
        createCadNodeMock({ treeIndex: 3 })
      ];

      mockDmGetMappingsForFdmInstances.mockResolvedValueOnce([
        { ...MODELS[0], mappings: new Map([[createFdmKey(DM_INSTANCES[0]), [cadNodes[0]]]]) },
        { ...MODELS[1], mappings: new Map([[createFdmKey(DM_INSTANCES[1]), [cadNodes[2]]]]) }
      ]);

      mockClassicGetNodesForAssetIds
        .mockResolvedValueOnce(
          // First model
          new Map([[CLASSIC_INSTANCES[0], [cadNodes[0], cadNodes[1]]]])
        )
        .mockResolvedValueOnce(
          // second model
          new Map([[CLASSIC_INSTANCES[1], [cadNodes[2]]]])
        );

      const result = await cacheWrapper.getMappingsForModelsAndInstances(
        [...CLASSIC_INSTANCES, ...DM_INSTANCES],
        MODELS
      );

      const modelKeys = MODELS.map((model) =>
        createModelRevisionKey(model.modelId, model.revisionId)
      );

      expect(result.get(modelKeys[0])?.get(createFdmKey(DM_INSTANCES[0]))).toEqual([cadNodes[0]]);
      expect(result.get(modelKeys[0])?.get(CLASSIC_INSTANCES[0])).toEqual([
        cadNodes[0],
        cadNodes[1]
      ]);
      expect(result.get(modelKeys[1])?.get(createFdmKey(DM_INSTANCES[1]))).toEqual([cadNodes[2]]);
      expect(result.get(modelKeys[1])?.get(CLASSIC_INSTANCES[1])).toEqual([cadNodes[2]]);
    });
  });
});
