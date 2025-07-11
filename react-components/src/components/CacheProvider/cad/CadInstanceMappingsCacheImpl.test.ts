import { beforeEach, describe, expect, test, vi } from 'vitest';
import { type CadInstanceMappingsCache } from './CadInstanceMappingsCache';
import { type FdmCadNodeCache } from './FdmCadNodeCache';
import { type ClassicCadAssetMappingCache } from './ClassicCadAssetMappingCache';
import { type DmsUniqueIdentifier } from '../../../data-providers';
import { createCadNodeMock } from '#test-utils/fixtures/cadNode';
import { createFdmKey, createModelRevisionKey } from '../idAndKeyTranslation';
import type { AssetId, CadNodeIdData, CadNodeTreeData, FdmKey } from '../types';
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

  describe('getAllModelMappings', () => {
    beforeEach(() => {
      mockClassicGetAssetMappingsForModel.mockResolvedValue([]);
      mockDmGetAllMappingExternalIds.mockResolvedValue(new Map());
    });

    test('returns empty map when no models are provider', async () => {
      const result = await cacheWrapper.getAllModelMappings([]);
      expect(result.size).toBe(0);
    });

    test('returns all model mappings from classic cache', async () => {
      const cadNodeIdData: CadNodeTreeData = { treeIndex: 123, subtreeSize: 42 };

      mockClassicGetAssetMappingsForModel.mockResolvedValue([
        {
          ...cadNodeIdData,
          assetId: CLASSIC_INSTANCES[0]
        }
      ]);

      const result = await cacheWrapper.getAllModelMappings([MODELS[0]]);
      expect(result).toEqual(
        new Map([
          [
            createModelRevisionKey(MODELS[0].modelId, MODELS[0].revisionId),
            new Map([[CLASSIC_INSTANCES[0], [cadNodeIdData]]])
          ]
        ])
      );
    });

    test('returns all model mappings from dm cache', async () => {
      const cadNodeIdData: CadNodeTreeData = { treeIndex: 123, subtreeSize: 42 };
      const cadNode = createCadNodeMock(cadNodeIdData);

      mockDmGetAllMappingExternalIds.mockResolvedValue(
        new Map([
          [
            createModelRevisionKey(MODELS[0].modelId, MODELS[0].revisionId),
            [
              {
                cadNode,
                connection: {
                  instance: DM_INSTANCES[0],
                  ...MODELS[0],
                  treeIndex: cadNodeIdData.treeIndex
                }
              }
            ]
          ]
        ])
      );

      const result = await cacheWrapper.getAllModelMappings([MODELS[0]]);
      expect(result).toEqual(
        new Map([
          [
            createModelRevisionKey(MODELS[0].modelId, MODELS[0].revisionId),
            new Map([[createFdmKey(DM_INSTANCES[0]), [cadNodeIdData]]])
          ]
        ])
      );
    });

    test('returns all data associated with multiple classic and DM models', async () => {
      const cadNodeData: CadNodeTreeData[] = [
        { treeIndex: 1, subtreeSize: 15 },
        { treeIndex: 2, subtreeSize: 16 },
        { treeIndex: 3, subtreeSize: 17 }
      ];

      const cadNodes = cadNodeData.map(createCadNodeMock);

      mockClassicGetAssetMappingsForModel
        .mockResolvedValueOnce([
          // First model
          {
            ...cadNodeData[0],
            assetId: CLASSIC_INSTANCES[0]
          },
          {
            ...cadNodeData[1],
            assetId: CLASSIC_INSTANCES[1]
          }
        ])
        .mockResolvedValueOnce([
          // Second model
          {
            ...cadNodeData[2],
            assetId: CLASSIC_INSTANCES[1]
          },
          {
            ...cadNodeData[1],
            assetId: CLASSIC_INSTANCES[1]
          }
        ]);

      mockDmGetAllMappingExternalIds.mockResolvedValue(
        new Map([
          [
            createModelRevisionKey(MODELS[0].modelId, MODELS[0].revisionId),
            [
              {
                cadNode: cadNodes[0],
                connection: {
                  instance: DM_INSTANCES[0],
                  ...MODELS[0],
                  treeIndex: cadNodeData[0].treeIndex
                }
              },
              {
                cadNode: cadNodes[2],
                connection: {
                  instance: DM_INSTANCES[1],
                  ...MODELS[0],
                  treeIndex: cadNodeData[2].treeIndex
                }
              }
            ]
          ],
          [
            createModelRevisionKey(MODELS[1].modelId, MODELS[1].revisionId),
            [
              {
                cadNode: cadNodes[1],
                connection: {
                  instance: DM_INSTANCES[1],
                  ...MODELS[1],
                  treeIndex: cadNodeData[1].treeIndex
                }
              }
            ]
          ]
        ])
      );

      const result = await cacheWrapper.getAllModelMappings(MODELS);

      expect(result).toEqual(
        new Map([
          [
            createModelRevisionKey(MODELS[0].modelId, MODELS[0].revisionId),
            new Map<AssetId | FdmKey, CadNodeTreeData[]>([
              [CLASSIC_INSTANCES[0], [cadNodeData[0]]],
              [CLASSIC_INSTANCES[1], [cadNodeData[1]]],
              [createFdmKey(DM_INSTANCES[0]), [cadNodeData[0]]],
              [createFdmKey(DM_INSTANCES[1]), [cadNodeData[2]]]
            ])
          ],
          [
            createModelRevisionKey(MODELS[1].modelId, MODELS[1].revisionId),
            new Map<AssetId | FdmKey, CadNodeTreeData[]>([
              [CLASSIC_INSTANCES[1], [cadNodeData[2], cadNodeData[1]]],
              [createFdmKey(DM_INSTANCES[1]), [cadNodeData[1]]]
            ])
          ]
        ])
      );
    });
  });
});
