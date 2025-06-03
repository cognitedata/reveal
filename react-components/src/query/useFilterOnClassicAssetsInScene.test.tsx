import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import type { Asset, CogniteClient, DirectRelationReference } from '@cognite/sdk';
import {
  FilterOnClassicAssetsInSceneContext,
  type FilterOnClassicAssetsInSceneDependencies
} from './FilterOnClassicAssetsInScene.context';
import { useFilterOnClassicAssetsInScene } from './useFilterOnClassicAssetsInScene';
import { Mock } from 'moq.ts';

describe(useFilterOnClassicAssetsInScene.name, () => {
  let sdk: CogniteClient;
  let scene: DirectRelationReference;
  let mockDependencies: FilterOnClassicAssetsInSceneDependencies;

  const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
    <FilterOnClassicAssetsInSceneContext.Provider value={mockDependencies}>
      {children}
    </FilterOnClassicAssetsInSceneContext.Provider>
  );

  beforeEach(() => {
    vi.resetAllMocks();
    sdk = new Mock<CogniteClient>().object();
    scene = { externalId: 'scene1', space: 'space1' };

    mockDependencies = {
      useReveal3dResourcesFromScene: vi.fn().mockReturnValue([]),
      useAllMappedEquipmentAssetMappings: vi.fn().mockReturnValue({
        data: { pages: [{ assets: [createMockAsset(1), createMockAsset(2)] }] },
        isFetching: false,
        hasNextPage: false,
        fetchNextPage: vi.fn()
      }),
      useAllAssetsMapped360Annotations: vi.fn().mockReturnValue({
        data: [{ asset: createMockAsset(3) }],
        isLoading: false
      }),
      useAllAssetsMappedPointCloudAnnotations: vi.fn().mockReturnValue({
        data: [createMockAsset(4)],
        isLoading: false
      })
    };
  });

  it('returns a filter function that filters assets present in the asset map', () => {
    const { result } = renderHook(() => useFilterOnClassicAssetsInScene(sdk, scene), { wrapper });

    expect(result.current).toBeTypeOf('function');

    const filterFn = result.current!;
    const inputAssets = [createMockAsset(1), createMockAsset(3), createMockAsset(5)];
    const filtered = filterFn(inputAssets);

    // Only assets with id 1 and 3 are in the mocked asset map
    expect(filtered.map((a) => a.id)).toEqual([1, 3]);
  });

  it('returns undefined if asset map is not ready', () => {
    mockDependencies.useAllMappedEquipmentAssetMappings = vi.fn().mockReturnValue({
      data: undefined,
      isFetching: true,
      hasNextPage: true,
      fetchNextPage: vi.fn()
    });

    const { result } = renderHook(() => useFilterOnClassicAssetsInScene(sdk, scene), { wrapper });

    expect(result.current).toBeUndefined();
  });
});

const createMockAsset = (id: number): Asset => ({
  id,
  name: `Asset ${id}`,
  rootId: 0,
  lastUpdatedTime: new Date(),
  createdTime: new Date()
});
