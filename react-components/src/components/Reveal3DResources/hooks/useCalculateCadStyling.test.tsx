import type { PropsWithChildren, ReactElement } from 'react';

import { beforeEach, describe, expect, test } from 'vitest';

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
import { type FdmConnectionWithNode, type ModelRevisionKey } from '../../CacheProvider/types';
import { type ClassicModelIdentifier } from '../../SceneContainer/sceneTypes';
import { type DmsUniqueIdentifier } from '../../../data-providers';
import { type CadModelOptions } from '..';
import { type ModelWithAssetMappings } from '../../../hooks/cad/ModelWithAssetMappings';
import { type CadModelMappings } from '../../CacheProvider/cad/CadInstanceMappingsCache';

describe(useCalculateCadStyling.name, () => {
  const dependencies = getMocksByDefaultDependencies(defaultUseCalculateCadStylingDependencies);

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
    dependencies.useMappedEdgesForRevisions.mockImplementation((models) => ({
      data: new Map(
        models.map((model) => [createModelRevisionKey(model.modelId, model.revisionId), []])
      ),
      isLoading: false,
      isFetched: true,
      isError: false
    }));
    dependencies.useAssetMappedNodesForRevisions.mockImplementation((models) => ({
      data: models.map((model) => ({ model, assetMappings: [] })),
      isLoading: false,
      isFetched: true,
      isError: false
    }));
  });

  test('returns empty style groups when no styling group is provided', async () => {
    dependencies.useCadMappingsCache.mockReturnValue({
      getMappingsForModelsAndInstances: async (_instances, models) =>
        await Promise.resolve(
          new Map(
            models.map((model) => [
              createModelRevisionKey(model.modelId, model.revisionId),
              new Map()
            ])
          )
        )
    });

    const { result } = renderHook(() => useCalculateCadStyling([MODEL], []), { wrapper });

    expect(result.current).toEqual({
      styledModels: [{ model: MODEL, styleGroups: [] }],
      isModelMappingsLoading: true
    });

    await waitFor(() => {
      expect(result.current.isModelMappingsLoading).toBeFalsy();
    });

    expect(result.current).toEqual({
      styledModels: [{ model: MODEL, styleGroups: [] }],
      isModelMappingsLoading: false
    });
  });

  test('returns objects with models and applicable style groups for classic asset', async () => {
    dependencies.useCadMappingsCache.mockReturnValue({
      getMappingsForModelsAndInstances: async () =>
        await Promise.resolve(createModelToAssetMappingsMap(MODEL, ASSET_ID, TREE_INDEX))
    });

    dependencies.useAssetMappedNodesForRevisions.mockReturnValue({
      data: createModelWithClassicAssetMappingList(MODEL, ASSET_ID, TREE_INDEX),
      isLoading: false,
      isFetched: true,
      isError: false
    });

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
    const someInstance = { externalId: 'external-id', space: 'space' };

    dependencies.useCadMappingsCache.mockReturnValue({
      getMappingsForModelsAndInstances: async () =>
        await Promise.resolve(createModelToAssetMappingsMap(MODEL, 0, TREE_INDEX))
    });

    dependencies.useMappedEdgesForRevisions.mockReturnValue({
      data: createModelToDmConnectionMap(MODEL, someInstance, TREE_INDEX),
      isLoading: false,
      isFetched: true,
      isError: false
    });

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

function createModelWithClassicAssetMappingList(
  model: CadModelOptions,
  assetId: number,
  treeIndex: number
): ModelWithAssetMappings[] {
  return [
    {
      model,
      assetMappings: [{ assetId, treeIndex, subtreeSize: 23, nodeId: 42 }]
    }
  ];
}

function createModelToAssetMappingsMap(
  model: ClassicModelIdentifier,
  assetId: number,
  treeIndex: number
): CadModelMappings {
  return new Map([
    [
      createModelRevisionKey(model.modelId, model.revisionId),
      new Map([[assetId, [createCadNodeMock({ treeIndex })]]])
    ]
  ]);
}

function createModelToDmConnectionMap(
  model: ClassicModelIdentifier,
  instance: DmsUniqueIdentifier,
  treeIndex: number
): Map<ModelRevisionKey, FdmConnectionWithNode[]> {
  return new Map<ModelRevisionKey, FdmConnectionWithNode[]>([
    [
      createModelRevisionKey(model.modelId, model.revisionId),
      [
        {
          connection: {
            instance,
            modelId: model.modelId,
            revisionId: model.revisionId,
            treeIndex
          },
          cadNode: createCadNodeMock({ treeIndex })
        }
      ]
    ]
  ]);
}
