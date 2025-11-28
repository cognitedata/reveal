import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { Asset, CogniteClient, DirectRelationReference } from '@cognite/sdk';
import type { ReactElement, ReactNode } from 'react';
import {
  FilterOnClassicAssetsInSceneContext,
  type FilterOnClassicAssetsInSceneDependencies
} from './FilterOnClassicAssetsInScene.context';
import { useFilterOnClassicAssetsInScene } from './useFilterOnClassicAssetsInScene';
import { Mock } from 'moq.ts';
import assert from 'assert';
import { type AddResourceOptions } from '../components/Reveal3DResources/types';

describe(useFilterOnClassicAssetsInScene.name, () => {
  let sdk: CogniteClient;
  let scene: DirectRelationReference;
  let mockDependencies: FilterOnClassicAssetsInSceneDependencies;

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <FilterOnClassicAssetsInSceneContext.Provider value={mockDependencies}>
      {children}
    </FilterOnClassicAssetsInSceneContext.Provider>
  );

  beforeEach(() => {
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
        isInitialLoading: false
      }),
      useAllAssetsMappedPointCloudAnnotations: vi.fn().mockReturnValue({
        data: [createMockAsset(4)],
        isInitialLoading: false
      })
    };
  });

  it('returns a filter function that filters assets present in the asset map', () => {
    const {
      result: { current: filterFn }
    } = renderHook(() => useFilterOnClassicAssetsInScene(sdk, scene), { wrapper });

    assert(filterFn !== undefined, 'Expected a filter function to be returned');

    const inputAssets = [createMockAsset(1), createMockAsset(3), createMockAsset(5)];
    const filtered = filterFn(inputAssets);

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

  it('calls useAllAssetsMapped360Annotations with siteIds when 360 image identifier is found', () => {
    const mockResources: AddResourceOptions[] = [
      { source: 'events', siteId: 'siteid-1' }, // events based 360 image resource
      { source: 'dm', externalId: 'externalid-1', space: 'space1' }, // dm based 360 image resource
      { modelId: 123, revisionId: 456 } // CAD resource (should be ignored)
    ];

    mockDependencies.useReveal3dResourcesFromScene = vi
      .fn<FilterOnClassicAssetsInSceneDependencies['useReveal3dResourcesFromScene']>()
      .mockReturnValue(mockResources);

    renderHook(() => useFilterOnClassicAssetsInScene(sdk, scene), { wrapper });

    expect(mockDependencies.useAllAssetsMapped360Annotations).toHaveBeenCalledWith(sdk, [
      'siteid-1',
      'externalid-1'
    ]);
  });
});

const createMockAsset = (id: number): Asset => ({
  id,
  name: `Asset ${id}`,
  rootId: 0,
  lastUpdatedTime: new Date(),
  createdTime: new Date()
});
