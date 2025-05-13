import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCadHybridAssetMappings } from './getCadHybridAssetMappings';
import { CadModelOptions } from '../../components';
import { Source } from '../../data-providers';
import { RevealRenderTarget } from '../../architecture';
import { NodeDefinition } from '@cognite/sdk';
import { CdfAssetMapping } from '../../components/CacheProvider/types';


describe('getCadHybridAssetMappings', () => {
  const mockCadModels: CadModelOptions[] = [
    { modelId: 1, revisionId: 1, type: 'cad' },
    { modelId: 2, revisionId: 2, type: 'cad' }
  ];

  const mockViewsToSearch: Source[] = [
    { externalId: 'view1', space: 'space1', version: 'v1', type: 'view' },
    { externalId: 'view2', space: 'space2', version: 'v1', type: 'view' },
  ];
  const mockAssetMappings: CdfAssetMapping[] = [
    {
      assetInstanceId: { externalId: 'asset1', space: 'space1' },
      treeIndex: 0,
      subtreeSize: 0,
      nodeId: 0,
      assetId: 0
    },
    {
      assetInstanceId: { externalId: 'asset2', space: 'space2' },
      treeIndex: 0,
      subtreeSize: 0,
      nodeId: 1,
      assetId: 1
    }
  ];

  const nodeDefinitions: NodeDefinition[] = [{
    space: 'space1',
    externalId: 'asset1',
    instanceType: 'node',
    properties: {
      space1: { 'view1/v1': {} }
    },
    version: 1,
    createdTime: 123456789,
    lastUpdatedTime: 123456789
  },
  {
    space: 'space2',
    externalId: 'asset2',
    instanceType: 'node',
    properties: {
      space2: { 'view2/v1': {} }
    },
    version: 1,
    createdTime: 123456789,
    lastUpdatedTime: 123456789
  }];

  let mockRenderTarget: RevealRenderTarget;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRenderTarget = {
      cdfCaches: {
        assetMappingAndNode3dCache: {
          getAssetMappingsForModel: vi.fn().mockResolvedValue([]),
        }
      },
      rootDomainObject: {
        sdk: {
          instances: {
            retrieve: vi.fn().mockResolvedValue([])
          }
        },
        fdmSdk: {
          searchInstances: vi.fn().mockResolvedValue([]),
        }
      }
    } as unknown as RevealRenderTarget;
  });

  it('should return undefined mappings when no hybrid mappings are found', async () => {

    const result = await getCadHybridAssetMappings(mockCadModels, mockViewsToSearch, 'query string', mockRenderTarget);

    expect(result).toEqual({
      allHybridAssetMappings: undefined,
      searchedHybridAssetMappings: undefined
    });
  });

  it('should fetch all hybrid mappings and filter them by views', async () => {

    mockRenderTarget.cdfCaches.assetMappingAndNode3dCache.getAssetMappingsForModel = vi.fn().mockResolvedValue(mockAssetMappings);
    mockRenderTarget.rootDomainObject.sdk.instances.retrieve = vi.fn().mockResolvedValue({
      items: nodeDefinitions
    });

    const result = await getCadHybridAssetMappings(mockCadModels, mockViewsToSearch, '', mockRenderTarget);

    expect(result.allHybridAssetMappings).toHaveLength(4);
    expect(result.allHybridAssetMappings).toEqual(getExpectedAllHybridMappings());
    expect(result.searchedHybridAssetMappings).toBeUndefined();
  });

  it('should fetch hybrid mappings and search instances when query is provided', async () => {

    mockRenderTarget.cdfCaches.assetMappingAndNode3dCache.getAssetMappingsForModel = vi.fn().mockResolvedValue(mockAssetMappings);
    mockRenderTarget.rootDomainObject.sdk.instances.retrieve = vi.fn().mockResolvedValue({
      items: nodeDefinitions
    });

    mockRenderTarget.rootDomainObject.fdmSdk.searchInstances = vi.fn().mockResolvedValue({
      instances: [{ externalId: 'asset1', space: 'space1' }]
    });

    const result = await getCadHybridAssetMappings(mockCadModels, mockViewsToSearch, 'asset1', mockRenderTarget);

    expect(mockRenderTarget.rootDomainObject.fdmSdk.searchInstances).toHaveBeenCalledTimes(2);
    expect(result.allHybridAssetMappings).toHaveLength(4);
    expect(result.searchedHybridAssetMappings).toHaveLength(2);
    expect(result.searchedHybridAssetMappings).toEqual(getExpectedSearchedHybridMappings());
  });

  it('should handle error gracefully with undefined when trying to get mappings from the caching system', async () => {
    mockRenderTarget.cdfCaches.assetMappingAndNode3dCache.getAssetMappingsForModel = vi.fn().mockRejectedValueOnce(
      new Error('Failed to fetch asset mappings')
    );

    const result = await getCadHybridAssetMappings(mockCadModels, mockViewsToSearch, '', mockRenderTarget);
    expect(result).toEqual({
      allHybridAssetMappings: undefined,
      searchedHybridAssetMappings: undefined
    });
  });
});

function getExpectedSearchedHybridMappings() {
  return [
    {
      view: {
        externalId: "view1",
        space: "space1",
        version: "v1",
        type: "view",
      },
      instances: [
        {
          externalId: "asset1",
          space: "space1",
        },
      ],
    },
    {
      view: {
        externalId: "view2",
        space: "space2",
        version: "v1",
        type: "view",
      },
      instances: [
        {
          externalId: "asset1",
          space: "space1",
        },
      ],
    },
  ]
}

function getExpectedAllHybridMappings() {
  return [
    {
      model: {
        modelId: 1,
        revisionId: 1,
        type: "cad",
      },
      asset: {
        space: "space1",
        externalId: "asset1",
        instanceType: "node",
        properties: {
          space1: {
            "view1/v1": {
            },
          },
        },
        version: 1,
        createdTime: 123456789,
        lastUpdatedTime: 123456789,
      },
      mappings: [
        {
          assetInstanceId: {
            externalId: "asset1",
            space: "space1",
          },
          treeIndex: 0,
          subtreeSize: 0,
          nodeId: 0,
          assetId: 0,
        },
      ],
    },
    {
      model: {
        modelId: 2,
        revisionId: 2,
        type: "cad",
      },
      asset: {
        space: "space1",
        externalId: "asset1",
        instanceType: "node",
        properties: {
          space1: {
            "view1/v1": {
            },
          },
        },
        version: 1,
        createdTime: 123456789,
        lastUpdatedTime: 123456789,
      },
      mappings: [
        {
          assetInstanceId: {
            externalId: "asset1",
            space: "space1",
          },
          treeIndex: 0,
          subtreeSize: 0,
          nodeId: 0,
          assetId: 0,
        },
      ],
    },
    {
      model: {
        modelId: 1,
        revisionId: 1,
        type: "cad",
      },
      asset: {
        space: "space2",
        externalId: "asset2",
        instanceType: "node",
        properties: {
          space2: {
            "view2/v1": {
            },
          },
        },
        version: 1,
        createdTime: 123456789,
        lastUpdatedTime: 123456789,
      },
      mappings: [
        {
          assetInstanceId: {
            externalId: "asset2",
            space: "space2",
          },
          treeIndex: 0,
          subtreeSize: 0,
          nodeId: 1,
          assetId: 1,
        },
      ],
    },
    {
      model: {
        modelId: 2,
        revisionId: 2,
        type: "cad",
      },
      asset: {
        space: "space2",
        externalId: "asset2",
        instanceType: "node",
        properties: {
          space2: {
            "view2/v1": {
            },
          },
        },
        version: 1,
        createdTime: 123456789,
        lastUpdatedTime: 123456789,
      },
      mappings: [
        {
          assetInstanceId: {
            externalId: "asset2",
            space: "space2",
          },
          treeIndex: 0,
          subtreeSize: 0,
          nodeId: 1,
          assetId: 1,
        },
      ],
    }
  ];
}
