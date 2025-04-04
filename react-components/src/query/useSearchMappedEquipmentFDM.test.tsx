import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { type AddModelOptions } from '@cognite/reveal';
import {
  useSearchMappedEquipmentFDM,
  useAllMappedEquipmentFDM,
  type InstancesWithView
} from '../query/useSearchMappedEquipmentFDM';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cadNodesFixtures } from '#test-utils/fixtures/dm/nodeItems';
import {
  type FdmSDK,
  type SimpleSource,
  type ViewItem,
  type ViewItemListResponse
} from '../data-providers/FdmSDK';
import { Mock } from 'moq.ts';
import { type RevealRenderTarget } from '../architecture';
import type { FC, PropsWithChildren } from 'react';
import { type Fdm3dDataProvider } from '../data-providers/Fdm3dDataProvider';
import { ViewerContext } from '../components/RevealCanvas/ViewerContext';
import { FdmSdkContext } from '../components/RevealCanvas/FdmDataProviderContext';

const queryClient = new QueryClient();

const mockFdmSdk = new Mock<FdmSDK>()
  .setup((p) => p.searchInstances)
  .returns(vi.fn())
  .setup((p) => p.getViewsByIds)
  .returns(vi.fn())
  .object();

const mockListMappedFdmNodes = vi.fn();
const mockFilterNodesByMappedTo3d = vi.fn();
const mockListAllMappedFdmNodes = vi.fn();

const mockFdmDataProvider = new Mock<Fdm3dDataProvider>()
  .setup((p) => p.listMappedFdmNodes)
  .returns(mockListMappedFdmNodes)
  .setup((p) => p.filterNodesByMappedTo3d)
  .returns(mockFilterNodesByMappedTo3d)
  .setup((p) => p.listAllMappedFdmNodes)
  .returns(mockListAllMappedFdmNodes)
  .object();

const fdmSdkMock = new Mock<FdmSDK>()
  .setup((sdk) => sdk.searchInstances)
  .returns(mockFdmSdk.searchInstances)
  .setup((sdk) => sdk.getViewsByIds)
  .returns(mockFdmSdk.getViewsByIds)
  .object();

const renderTargetMock = new Mock<RevealRenderTarget>()
  .setup((p) => p.cdfCaches.fdm3dDataProvider)
  .returns(mockFdmDataProvider)
  .object();

const wrapper: FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <ViewerContext.Provider value={renderTargetMock}>
      <FdmSdkContext.Provider value={{ fdmSdk: fdmSdkMock }}>{children}</FdmSdkContext.Provider>
    </ViewerContext.Provider>
  </QueryClientProvider>
);

describe(useSearchMappedEquipmentFDM.name, () => {
  const mockModels: AddModelOptions[] = [
    { modelId: 456, revisionId: 789 },
    { modelId: 123, revisionId: 456 }
  ];

  const mockInstancesFilter = { equals: { property: ['key'], value: 'value' } };

  const mockViewsToSearch = [
    { externalId: 'CogniteCADNode', space: 'cdf_cdm', version: 'v1', type: 'view' as const },
    { externalId: 'CogniteCADNode', space: 'cdf_cdm', version: 'v1', type: 'view' as const }
  ];

  const mockInstancesWithView: InstancesWithView[] = [
    { view: mockViewsToSearch[0], instances: cadNodesFixtures },

    { view: mockViewsToSearch[1], instances: cadNodesFixtures }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();

    mockListMappedFdmNodes.mockResolvedValue(cadNodesFixtures);
    mockFilterNodesByMappedTo3d.mockResolvedValue(mockInstancesWithView);
  });

  it('should return empty results when models are empty', async () => {
    const { result } = renderHook(
      () => useSearchMappedEquipmentFDM('query', mockViewsToSearch, [], mockInstancesFilter, 100),
      {
        wrapper
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual([]);
    });
  });

  it('should call searchInstances for each view when query is not empty', async () => {
    vi.mocked(mockFdmSdk.searchInstances)
      .mockResolvedValueOnce({
        instances: mockInstancesWithView[0].instances
      })
      .mockResolvedValueOnce({
        instances: mockInstancesWithView[1].instances
      });

    vi.mocked(mockFdmSdk.getViewsByIds).mockResolvedValueOnce(
      getMockViewByIdResponse(mockViewsToSearch)
    );

    const { result } = renderHook(
      () =>
        useSearchMappedEquipmentFDM(
          'query',
          mockViewsToSearch,
          mockModels,
          mockInstancesFilter,
          100
        ),
      { wrapper }
    );

    await waitFor(() => {
      expect(mockFdmSdk.searchInstances).toHaveBeenCalledTimes(2);
    });
    await waitFor(() => {
      expect(mockFdmSdk.searchInstances).toHaveBeenCalledWith(
        mockViewsToSearch[0],
        'query',
        'node',
        100,
        mockInstancesFilter
      );
    });
    await waitFor(() => {
      expect(mockFdmSdk.searchInstances).toHaveBeenCalledWith(
        mockViewsToSearch[1],
        'query',
        'node',
        100,
        mockInstancesFilter
      );
    });

    const data = await waitFor(() => result.current.data);
    expect(data).toEqual(mockInstancesWithView);
  });

  it('should call listMappedFdmNodes when query is empty', async () => {
    mockListMappedFdmNodes.mockResolvedValueOnce([
      mockInstancesWithView[0].instances[0],
      mockInstancesWithView[0].instances[1],
      mockInstancesWithView[0].instances[2]
    ]);

    mockFilterNodesByMappedTo3d.mockResolvedValueOnce(mockInstancesWithView);

    vi.mocked(mockFdmSdk.getViewsByIds).mockResolvedValueOnce(
      getMockViewByIdResponse(mockViewsToSearch)
    );

    const { result } = renderHook(
      () =>
        useSearchMappedEquipmentFDM('', mockViewsToSearch, mockModels, mockInstancesFilter, 100),
      { wrapper }
    );

    await waitFor(() => {
      expect(mockFdmDataProvider.listMappedFdmNodes).toHaveBeenCalledTimes(1);
      expect(mockFdmDataProvider.listMappedFdmNodes).toHaveBeenCalledWith(
        mockModels,
        mockViewsToSearch.map((view) => getMockViewItemFromSimpleSource(view)),
        mockInstancesFilter,
        100
      );
      expect(result.current.data).toEqual(mockInstancesWithView);
    });
  });
});

describe(useAllMappedEquipmentFDM.name, () => {
  const mockViewsToSearch = [
    { externalId: 'view1', space: 'space1', version: 'v1' },
    { externalId: 'view2', space: 'space2', version: 'v1' }
  ];

  const mockModels: AddModelOptions[] = [
    { modelId: 456, revisionId: 789 },
    { modelId: 123, revisionId: 456 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('should call listAllMappedFdmNodes with correct parameters', async () => {
    const mockResult = [{ id: 'node1' }, { id: 'node2' }];
    mockListAllMappedFdmNodes.mockResolvedValueOnce(mockResult);

    vi.mocked(mockFdmSdk.getViewsByIds).mockResolvedValueOnce(
      getMockViewByIdResponse(mockViewsToSearch)
    );

    const { result } = renderHook(
      () => useAllMappedEquipmentFDM(mockModels, mockViewsToSearch, true),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
    const data = result.current.data;

    expect(mockListAllMappedFdmNodes).toHaveBeenCalledWith(
      mockModels,
      expect.any(Array),
      expect.any(Object)
    );
    expect(data).toEqual(mockResult);
  });

  it('should not call listAllMappedFdmNodes when disabled', async () => {
    const { result } = renderHook(
      () => useAllMappedEquipmentFDM(mockModels, mockViewsToSearch, false),
      { wrapper }
    );

    // Assert that the result from the hook remains undefined
    await expect(
      waitFor(() => {
        expect(result.current.data).toBeDefined();
      })
    ).rejects.toThrow();

    expect(mockListAllMappedFdmNodes).not.toHaveBeenCalled();
  });
});

function getMockViewByIdResponse(sources: SimpleSource[]): ViewItemListResponse {
  return {
    items: sources.map((source) => getMockViewItemFromSimpleSource(source))
  };
}

function getMockViewItemFromSimpleSource(source: SimpleSource): ViewItem {
  return {
    externalId: source.externalId,
    version: source.version,
    space: source.space,
    createdTime: 123,
    lastUpdatedTime: 124,
    writable: true,
    usedFor: 'usedFor',
    isGlobal: true,
    properties: {},
    name: 'name',
    implements: []
  };
}
