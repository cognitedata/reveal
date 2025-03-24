import { describe, it, expect, vi, beforeEach, type Mock as viMock } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { type AddModelOptions } from '@cognite/reveal';
import {
  useSearchMappedEquipmentFDM,
  useAllMappedEquipmentFDM,
  type InstancesWithView
} from '../query/useSearchMappedEquipmentFDM';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';
import { useFdm3dDataProvider } from '../components/CacheProvider/CacheProvider';
import { useQuery } from '@tanstack/react-query';
import { cadNodesFixtures } from '#test-utils/fixtures/dm/nodeItems';

vi.mock('../components/RevealCanvas/SDKProvider');
vi.mock('../components/CacheProvider/CacheProvider');

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn()
}));

describe(useSearchMappedEquipmentFDM.name, () => {
  const mockFdmSdk = {
    searchInstances: vi.fn()
  };

  const mockFdmDataProvider = {
    listMappedFdmNodes: vi.fn().mockResolvedValue(cadNodesFixtures),
    filterNodesByMappedTo3d: vi.fn()
  };

  const mockViewsToSearch = [
    { externalId: 'CogniteCADNode', space: 'cdf_cdm', version: 'v1', type: 'view' as const },
    { externalId: 'CogniteCADNode', space: 'cdf_cdm', version: 'v1', type: 'view' as const }
  ];

  const mockModels: AddModelOptions[] = [
    { modelId: 456, revisionId: 789 },
    { modelId: 123, revisionId: 456 }
  ];

  const mockInstancesWithView: InstancesWithView[] = [
    { view: mockViewsToSearch[0], instances: cadNodesFixtures },

    { view: mockViewsToSearch[1], instances: cadNodesFixtures }
  ];

  const mockInstancesFilter = { equals: { property: ['key'], value: 'value' } };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFdmSdk as viMock).mockReturnValue(mockFdmSdk);
    (useFdm3dDataProvider as viMock).mockReturnValue(mockFdmDataProvider);
  });

  it('should return empty results when models are empty', async () => {
    (useQuery as viMock).mockImplementation(({ queryFn }) => {
      return { data: queryFn() };
    });

    const { result } = renderHook(() =>
      useSearchMappedEquipmentFDM('query', mockViewsToSearch, [], mockInstancesFilter, 100)
    );

    const data = await waitFor(() => result.current.data);
    expect(data).toEqual([]);
  });

  it('should call searchInstances for each view when query is not empty', async () => {
    mockFdmSdk.searchInstances
      .mockResolvedValueOnce({
        instances: mockInstancesWithView[0].instances
      })
      .mockResolvedValueOnce({
        instances: mockInstancesWithView[1].instances
      });
    mockFdmDataProvider.filterNodesByMappedTo3d.mockResolvedValueOnce(mockInstancesWithView);

    (useQuery as viMock).mockImplementation(({ queryFn }) => {
      return { data: queryFn() };
    });

    const { result } = renderHook(() =>
      useSearchMappedEquipmentFDM('query', mockViewsToSearch, mockModels, mockInstancesFilter, 100)
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
    mockFdmDataProvider.listMappedFdmNodes.mockResolvedValueOnce([
      mockInstancesWithView[0].instances[0],
      mockInstancesWithView[0].instances[1],
      mockInstancesWithView[0].instances[2]
    ]);

    mockFdmDataProvider.filterNodesByMappedTo3d.mockResolvedValueOnce(mockInstancesWithView);
    (useQuery as viMock).mockImplementation(({ queryFn }) => {
      return { data: queryFn() };
    });

    const { result } = renderHook(() =>
      useSearchMappedEquipmentFDM('', mockViewsToSearch, mockModels, mockInstancesFilter, 100)
    );

    expect(mockFdmDataProvider.listMappedFdmNodes).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(mockFdmDataProvider.listMappedFdmNodes).toHaveBeenCalledWith(
        mockModels,
        mockViewsToSearch,
        mockInstancesFilter,
        100
      );
    });
    const data = await waitFor(() => result.current.data);
    expect(data).toEqual(mockInstancesWithView);
  });
});

describe(useAllMappedEquipmentFDM.name, () => {
  const mockFdmDataProvider = {
    listAllMappedFdmNodes: vi.fn()
  };

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
    (useFdm3dDataProvider as viMock).mockReturnValue(mockFdmDataProvider);
  });

  it('should call listAllMappedFdmNodes with correct parameters', async () => {
    mockFdmDataProvider.listAllMappedFdmNodes.mockResolvedValueOnce([
      { id: 'node1' },
      { id: 'node2' }
    ]);

    (useQuery as viMock).mockImplementation(({ queryFn }) => {
      return { data: queryFn() };
    });

    const { result } = renderHook(() =>
      useAllMappedEquipmentFDM(mockModels, mockViewsToSearch, true)
    );

    const data = await waitFor(() => result.current.data);

    expect(mockFdmDataProvider.listAllMappedFdmNodes).toHaveBeenCalledWith(
      mockModels,
      expect.any(Array),
      expect.any(Object)
    );
    expect(data).toEqual([{ id: 'node1' }, { id: 'node2' }]);
  });

  it('should not call listAllMappedFdmNodes when disabled', async () => {
    (useQuery as viMock).mockImplementation(() => {
      return { data: undefined };
    });

    const { result } = renderHook(() =>
      useAllMappedEquipmentFDM(mockModels, mockViewsToSearch, false)
    );

    const data = await waitFor(() => result.current.data);

    expect(mockFdmDataProvider.listAllMappedFdmNodes).not.toHaveBeenCalled();
    expect(data).toBeUndefined();
  });
});
