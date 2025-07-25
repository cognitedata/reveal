import type { PropsWithChildren, ReactElement } from 'react';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { renderHook, waitFor } from '@testing-library/react';

import {
  useCalculateCadStyling,
  defaultUseCalculateCadStylingDependencies,
  UseCalculateCadStylingContext
} from './useCalculateCadStyling';

import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import { createModelRevisionKey } from '../../CacheProvider/idAndKeyTranslation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createCadNodeMock } from '#test-utils/fixtures/cadNode';
import { IndexSet } from '@cognite/reveal';
import { type ClassicModelIdentifier } from '../../SceneContainer/sceneTypes';
import {
  type CadModelTreeIndexMappings,
  type CadInstanceMappingsCache,
  type CadModelMappingsWithNodes
} from '../../CacheProvider/cad/CadInstanceMappingsCache';

describe(useCalculateCadStyling.name, () => {
  const dependencies = getMocksByDefaultDependencies(defaultUseCalculateCadStylingDependencies);

  const mockGetMappingsForModelsAndInstances =
    vi.fn<CadInstanceMappingsCache['getMappingsForModelsAndInstances']>();
  const mockGetAllModelMappings = vi.fn<CadInstanceMappingsCache['getAllModelMappings']>();

  const queryClient = new QueryClient();

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <QueryClientProvider client={queryClient}>
      <UseCalculateCadStylingContext.Provider value={dependencies}>
        {children}
      </UseCalculateCadStylingContext.Provider>
    </QueryClientProvider>
  );

  const MODEL = {
    modelId: 123,
    revisionId: 234,
    type: 'cad'
  } as const;

  const ASSET_ID = 987;
  const TREE_INDEX = 123;

  beforeEach(() => {
    dependencies.useCadMappingsCache.mockReturnValue({
      getMappingsForModelsAndInstances: mockGetMappingsForModelsAndInstances,
      getAllModelMappings: mockGetAllModelMappings
    });

    mockGetAllModelMappings.mockResolvedValue(new Map());
  });

  test('indicates that loading is not finished when `isLoading` is true for request', async () => {
    mockGetMappingsForModelsAndInstances.mockResolvedValue(
      createModelToAssetMappingsMap(MODEL, ASSET_ID, TREE_INDEX)
    );
    const mappinsgFromCache = new Map([
      [createModelRevisionKey(MODEL.modelId, MODEL.revisionId), new Map()]
    ]);

    const modelStyleGroupsResult = [
      {
        model: {
          modelId: 123,
          revisionId: 234,
          type: 'cad'
        },
        styleGroups: []
      }
    ];

    let allMappingsPromiseResolver: (
      value: CadModelTreeIndexMappings | PromiseLike<CadModelTreeIndexMappings>
    ) => void = () => {};
    const allMappingsPromise = new Promise<CadModelTreeIndexMappings>((resolve) => {
      allMappingsPromiseResolver = resolve;
    });

    mockGetAllModelMappings.mockReturnValue(allMappingsPromise);

    const { result } = renderHook(() => useCalculateCadStyling([MODEL], []), { wrapper });

    expect(result.current.isModelMappingsLoading).toBe(true);
    expect(result.current.styledModels).toEqual(modelStyleGroupsResult);

    allMappingsPromiseResolver(mappinsgFromCache);

    await waitFor(() => {
      expect(result.current.isModelMappingsLoading).toBe(false);
    });
    expect(result.current.styledModels).toEqual(modelStyleGroupsResult);
  });

  test('returns empty style groups when no styling group is provided', async () => {
    mockGetMappingsForModelsAndInstances.mockResolvedValue(new Map());

    const { result } = renderHook(() => useCalculateCadStyling([MODEL], []), { wrapper });

    await waitFor(() => {
      expect(result.current.isModelMappingsLoading).toBeFalsy();
    });

    expect(result.current).toEqual({
      styledModels: [{ model: MODEL, styleGroups: [] }],
      isModelMappingsLoading: false
    });
  });

  test('returns objects with models and applicable style groups for classic asset', async () => {
    mockGetMappingsForModelsAndInstances.mockResolvedValue(
      createModelToAssetMappingsMap(MODEL, ASSET_ID, TREE_INDEX)
    );

    const { result } = renderHook(
      () =>
        useCalculateCadStyling(
          [MODEL],
          [{ assetIds: [ASSET_ID], style: { cad: { renderGhosted: true } } }]
        ),
      { wrapper }
    );

    expect(result.current).toEqual({
      styledModels: [{ model: MODEL, styleGroups: [] }],
      isModelMappingsLoading: true
    });

    await waitFor(() => {
      expect(result.current.isModelMappingsLoading).toBeFalsy();
    });
    expect(result.current).toEqual({
      styledModels: [
        {
          model: MODEL,
          styleGroups: [{ style: { renderGhosted: true }, treeIndexSet: expect.any(IndexSet) }]
        }
      ],
      isModelMappingsLoading: false
    });
  });

  test('returns objects with models and applicable style groups for DM instance', async () => {
    mockGetMappingsForModelsAndInstances.mockResolvedValue(
      createModelToAssetMappingsMap(MODEL, ASSET_ID, TREE_INDEX)
    );

    const { result } = renderHook(
      () =>
        useCalculateCadStyling(
          [MODEL],
          [{ assetIds: [ASSET_ID], style: { cad: { renderGhosted: true } } }]
        ),
      { wrapper }
    );

    expect(result.current).toEqual({
      styledModels: [
        {
          model: MODEL,
          styleGroups: [{ style: { renderGhosted: true }, treeIndexSet: expect.any(IndexSet) }]
        }
      ],
      isModelMappingsLoading: false
    });
  });
});

function createModelToAssetMappingsMap(
  model: ClassicModelIdentifier,
  assetId: number,
  treeIndex: number
): CadModelMappingsWithNodes {
  return new Map([
    [
      createModelRevisionKey(model.modelId, model.revisionId),
      new Map([[assetId, [createCadNodeMock({ treeIndex })]]])
    ]
  ]);
}
