import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useHybridAssetMappings } from './useHybridAssetMappings';
import { QueryClient, QueryClientProvider, UseQueryResult } from '@tanstack/react-query';
import { FC, PropsWithChildren } from 'react';
import { Mock } from 'moq.ts';
import { viewerMock } from '#test-utils/fixtures/viewer';
import { AssetMappingAndNode3DCache, CadModelOptions } from '../../components';
import { ViewerContext } from '../../components/RevealCanvas/ViewerContext';
import { CogniteExternalId, Node3D } from '@cognite/sdk';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { ModelWithAssetMappings } from './ModelWithAssetMappings';
import { AssetMappingsContext } from '../AssetMappings.context';
import { cdfCachesMock, commandsControllerMock } from '#test-utils/fixtures/renderTarget';
import { RevealRenderTarget, RootDomainObject } from '../../architecture';

describe(useHybridAssetMappings.name, () => {

  const mockHybridNodesForMappingsData: Map<CogniteExternalId, Node3D[]> = new Map(
    [
      ['externalId1', [{ id: 1, treeIndex: 1, parentId: 0, depth: 0, name: 'Node1', subtreeSize: 1 }]],
      ['externalId2', [{ id: 2, treeIndex: 2, parentId: 0, depth: 0, name: 'Node2', subtreeSize: 1 }]]
    ]
  );

  const mockGetNodesForAssetInstancesInHybridMappings = vi.fn().mockResolvedValue(mockHybridNodesForMappingsData);
  const assetMappingAndNode3DCacheMock = new Mock<AssetMappingAndNode3DCache>()
    .setup((p) => p.getNodesForAssetInstancesInHybridMappings)
    .returns(mockGetNodesForAssetInstancesInHybridMappings);

  const cdfCachesMockOverride = cdfCachesMock
    .setup((p) => p.assetMappingAndNode3dCache)
    .returns(assetMappingAndNode3DCacheMock.object());

  const mockBaseRenderTarget = new Mock<RevealRenderTarget>()
    .setup((p) => p.viewer)
    .returns(viewerMock)
    .setup((p) => p.cdfCaches)
    .returns(cdfCachesMockOverride.object())
    .setup((p) => p.commandsController)
    .returns(commandsControllerMock.object())
    .setup((p) => p.invalidate.bind(p))
    .returns(vi.fn());

  const root = new RootDomainObject(mockBaseRenderTarget.object(), sdkMock);
  const renderTargetMock = mockBaseRenderTarget
    .setup((p) => p.rootDomainObject)
    .returns(root)
    .object();

  const mockUseAssetMappedNodesForRevisions = vi.fn();
  const queryClient = new QueryClient();

  const wrapper: FC<PropsWithChildren> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <ViewerContext.Provider value={renderTargetMock}>
        <AssetMappingsContext.Provider value={
          {
            useAssetMappedNodesForRevisions: mockUseAssetMappedNodesForRevisions,
            useHybridAssetMappings: vi.fn(),
            useMappedEdgesForRevisions: vi.fn(),
          }
        }>
          {children}
        </AssetMappingsContext.Provider>
      </ViewerContext.Provider>
    </QueryClientProvider>
  );

  const mockHybridFdmAssetExternalIds = [
    { externalId: 'externalId1', space: 'space1' },
    { externalId: 'externalId2', space: 'space2' }
  ];

  const mockModels = [
    { modelId: 1, revisionId: 1, type: 'cad' } as unknown as CadModelOptions,
    { modelId: 2, revisionId: 2, type: 'cad' } as unknown as CadModelOptions
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return hybrid asset mappings when data is available', async () => {
    const mockModelWithAssetMappings = [
      {
        model: mockModels[0],
        assetMappings: [
          { assetInstanceId: { externalId: 'externalId1', space: 'space1' } }
        ]
      },
      {
        model: mockModels[1],
        assetMappings: [
          { assetInstanceId: { externalId: 'externalId2', space: 'space2' } }
        ]
      }
    ];

    mockUseAssetMappedNodesForRevisions.mockReturnValue({
      data: mockModelWithAssetMappings,
      isLoading: false
    } as UseQueryResult<ModelWithAssetMappings[]>);

    const { result } = renderHook(
      () => useHybridAssetMappings(mockHybridFdmAssetExternalIds, mockModels),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([
        {
          modelId: 1,
          revisionId: 1,
          mappings: mockHybridNodesForMappingsData
        },
        {
          modelId: 2,
          revisionId: 2,
          mappings: mockHybridNodesForMappingsData
        }
      ]);
    });
  });

  it('should handle loading state when data is not yet available', async () => {
    mockUseAssetMappedNodesForRevisions.mockReturnValue({
      data: undefined,
      isLoading: true
    } as UseQueryResult<ModelWithAssetMappings[]>);

    const { result } = renderHook(
      () => useHybridAssetMappings(mockHybridFdmAssetExternalIds, mockModels),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
    });

  });

  it('should return empty data when no hybrid asset external IDs are provided', async () => {
    const { result } = renderHook(() => useHybridAssetMappings([], mockModels), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

});
