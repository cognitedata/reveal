import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAll3dDirectConnectionsWithProperties } from './useAll3dDirectConnectionsWithProperties';
import {
  defaultUseAll3dDirectConnectionsWithPropertiesDependencies,
  UseAll3dDirectConnectionsWithPropertiesContext
} from './useAll3dDirectConnectionsWithProperties.context';
import { type FdmConnectionWithNode } from '../components/CacheProvider/types';
import {
  type ExternalIdsResultList,
  type InspectResultList,
  type NodeItem,
  type FdmSDK
} from '../data-providers/FdmSDK';
import { Mock } from 'moq.ts';
import type { FC, PropsWithChildren } from 'react';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import { FdmSdkContext } from '../components/RevealCanvas/FdmDataProviderContext';
import { createCadNodeMock } from '#test-utils/fixtures/cadNode';
import { type FdmInstanceNodeWithConnectionAndProperties } from '../components/RuleBasedOutputs/types';

describe(useAll3dDirectConnectionsWithProperties.name, () => {
  const queryClient = new QueryClient();

  const ARBITRARY_DATA_SET_SIZE = 1500;
  const ARBITRARY_TREE_INDEX = 789;
  const ARBITRARY_MODEL_ID = 123;
  const ARBITRARY_REVISION_ID = 456;

  const baseDmsUniqueIdentifier = {
    space: 'test-space',
    externalId: 'test-id'
  };

  const node3d1 = createCadNodeMock({
    id: 100,
    treeIndex: ARBITRARY_TREE_INDEX,
    subtreeSize: 1
  });

  const node3d2 = createCadNodeMock({
    id: 101,
    treeIndex: ARBITRARY_TREE_INDEX + 1,
    subtreeSize: 1
  });

  const mockConnectionWithNode: FdmConnectionWithNode = {
    connection: {
      instance: baseDmsUniqueIdentifier,
      modelId: ARBITRARY_MODEL_ID,
      revisionId: ARBITRARY_REVISION_ID,
      treeIndex: ARBITRARY_TREE_INDEX
    },
    cadNode: node3d1,
    views: [{ space: 'view-space', externalId: 'view-id', version: '1', type: 'view' as const }]
  };

  const mockConnectionWithNodeSameInstance: FdmConnectionWithNode = {
    connection: {
      instance: baseDmsUniqueIdentifier,
      modelId: ARBITRARY_MODEL_ID,
      revisionId: ARBITRARY_REVISION_ID,
      treeIndex: ARBITRARY_TREE_INDEX + 1
    },
    cadNode: node3d2,
    views: [{ space: 'view-space', externalId: 'view-id', version: '1', type: 'view' as const }]
  };

  const mockConnectionWithNode2: FdmConnectionWithNode = {
    connection: {
      instance: { space: 'test-space', externalId: 'test-id-2' },
      modelId: ARBITRARY_MODEL_ID,
      revisionId: ARBITRARY_REVISION_ID,
      treeIndex: ARBITRARY_TREE_INDEX + 1
    },
    cadNode: node3d2,
    views: [{ space: 'view-space-2', externalId: 'view-id-2', version: '1', type: 'view' as const }]
  };

  const mockFdmInstanceData = {
    ...baseDmsUniqueIdentifier,
    instanceType: 'node' as const,
    version: 1,
    createdTime: 11111,
    lastUpdatedTime: 11111,
    properties: { testProperty: { value: 'testValue' } }
  };

  const mockInspectResultItem = {
    ...baseDmsUniqueIdentifier,
    instanceType: 'node' as const,
    inspectionResults: {
      involvedViews: [
        { space: 'view-space', externalId: 'view-id', version: '1', type: 'view' as const }
      ],
      involvedContainers: []
    }
  };

  const mockInspectResultList = [mockInspectResultItem];

  const mockFdmSdk = new Mock<FdmSDK>()
    .setup((p) => p.getByExternalIds)
    .returns(vi.fn<() => Promise<ExternalIdsResultList<any>>>())
    .setup((p) => p.inspectInstances)
    .returns(vi.fn<() => Promise<InspectResultList>>())
    .object();

  const mockDependencies = getMocksByDefaultDependencies(
    defaultUseAll3dDirectConnectionsWithPropertiesDependencies
  );

  const wrapper: FC<PropsWithChildren<unknown>> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <FdmSdkContext.Provider value={{ fdmSdk: mockFdmSdk }}>
        <UseAll3dDirectConnectionsWithPropertiesContext.Provider value={mockDependencies}>
          {children}
        </UseAll3dDirectConnectionsWithPropertiesContext.Provider>
      </FdmSdkContext.Provider>
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient.clear();

    mockDependencies.useFdmSdk.mockReturnValue(mockFdmSdk);

    vi.mocked(mockFdmSdk.getByExternalIds).mockResolvedValue({
      items: [mockFdmInstanceData],
      typing: {}
    });

    vi.mocked(mockFdmSdk.inspectInstances).mockResolvedValue({
      items: mockInspectResultList
    });
  });

  it('should return empty result when no connections provided', async () => {
    const { result } = renderHook(() => useAll3dDirectConnectionsWithProperties([]), { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should process connections and return multiple instance data', async () => {
    const { result } = renderHook(
      () =>
        useAll3dDirectConnectionsWithProperties([
          mockConnectionWithNode,
          mockConnectionWithNodeSameInstance
        ]),
      { wrapper }
    );

    const expectedData = [
      createFdmInstanceNodeWithConnectionDataMock(mockConnectionWithNode, mockFdmInstanceData),
      createFdmInstanceNodeWithConnectionDataMock(
        mockConnectionWithNodeSameInstance,
        mockFdmInstanceData
      )
    ];

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFdmSdk.getByExternalIds).toHaveBeenCalled();
    expect(mockFdmSdk.inspectInstances).toHaveBeenCalled();
    expect(result.current.data).toEqual(expectedData);
  });

  it('should handle empty instance data response', async () => {
    vi.mocked(mockFdmSdk.getByExternalIds).mockResolvedValue({
      items: [],
      typing: {}
    });

    vi.mocked(mockFdmSdk.inspectInstances).mockResolvedValue({
      items: []
    });

    const { result } = renderHook(
      () => useAll3dDirectConnectionsWithProperties([mockConnectionWithNode]),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it('should try to fetch fdm nodes without views', async () => {
    const connectionWithoutViews: FdmConnectionWithNode = {
      ...mockConnectionWithNode,
      views: undefined
    };

    const { result } = renderHook(
      () => useAll3dDirectConnectionsWithProperties([connectionWithoutViews]),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFdmSdk.getByExternalIds).toHaveBeenCalledWith(expect.any(Array), undefined);
  });

  it('should chunk large datasets correctly', async () => {
    const connections = Array.from({ length: ARBITRARY_DATA_SET_SIZE }, (_, i) => ({
      ...mockConnectionWithNode,
      connection: {
        ...mockConnectionWithNode.connection,
        instance: { space: 'space', externalId: `id${i}` },
        treeIndex: ARBITRARY_TREE_INDEX + i
      }
    }));

    vi.mocked(mockFdmSdk.getByExternalIds).mockResolvedValue({
      items: [],
      typing: {}
    });

    vi.mocked(mockFdmSdk.inspectInstances).mockResolvedValue({
      items: []
    });

    const { result } = renderHook(() => useAll3dDirectConnectionsWithProperties(connections), {
      wrapper
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should call getByExternalIds multiple times due to chunking
    expect(mockFdmSdk.getByExternalIds).toHaveBeenCalledTimes(2); // 2 chunks of 1000 each
  });

  it('should refetch when connections change', async () => {
    const initialCallCount = 1; // Initial call to getByExternalIds
    const extraCallCount = 3; // After rerender with new connections

    const { result, rerender } = renderHook(
      ({ connections }) => useAll3dDirectConnectionsWithProperties(connections),
      {
        wrapper,
        initialProps: { connections: [mockConnectionWithNode] }
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(vi.mocked(mockFdmSdk.getByExternalIds)).toHaveBeenCalledTimes(initialCallCount);

    rerender({ connections: [mockConnectionWithNode, mockConnectionWithNode2] });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(vi.mocked(mockFdmSdk.getByExternalIds)).toHaveBeenCalledTimes(extraCallCount);
  });
});

function createFdmInstanceNodeWithConnectionDataMock(
  connection: FdmConnectionWithNode,
  mockFdmInstanceData: NodeItem<unknown>
): FdmInstanceNodeWithConnectionAndProperties {
  return {
    ...connection,
    items: [mockFdmInstanceData],
    instanceType: 'node' as const,
    typing: {}
  };
}
