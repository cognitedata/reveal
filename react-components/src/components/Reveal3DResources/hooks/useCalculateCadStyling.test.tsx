import type { PropsWithChildren, ReactElement } from 'react';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { renderHook, waitFor } from '@testing-library/react';

import {
  useCalculateCadStyling,
  defaultUseCalculateCadStylingDependencies,
  UseCalculateCadStylingContext
} from './useCalculateCadStyling';

import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import { createInstanceKey, createModelRevisionKey } from '../../CacheProvider/idAndKeyTranslation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createCadNodeMock } from '#test-utils/fixtures/cadNode';
import { IndexSet } from '@cognite/reveal';
import { type ClassicModelIdentifier } from '../../SceneContainer/sceneTypes';
import {
  type CadInstanceMappingsCache,
  type CadModelMappingsWithNodes,
  type CadModelMappings
} from '../../CacheProvider/cad/CadInstanceMappingsCache';
import { type DmsUniqueIdentifier } from '../../../data-providers/FdmSDK';
import { type InstanceId } from '../../../utilities/instanceIds';

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
  const DM_TREE_INDEX = 456;
  const INSTANCE_ID: DmsUniqueIdentifier = {
    externalId: 'default-external-id1',
    space: 'default-space'
  };

  beforeEach(() => {
    queryClient.clear();
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
      value: CadModelMappings | PromiseLike<CadModelMappings>
    ) => void = () => {};
    const allMappingsPromise = new Promise<CadModelMappings>((resolve) => {
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
    mockGetMappingsForModelsAndInstances.mockResolvedValue(
      createModelToAssetMappingsMap(MODEL, ASSET_ID, TREE_INDEX)
    );

    const { result } = renderHook(() => useCalculateCadStyling([MODEL], []), { wrapper });

    await waitFor(() => {
      expect(result.current.isModelMappingsLoading).toBeFalsy();
    });

    expect(result.current).toEqual({
      styledModels: [{ model: MODEL, styleGroups: [] }],
      isModelMappingsLoading: false
    });
  });

  test('returns empty style groups when no mappings exist', async () => {
    mockGetMappingsForModelsAndInstances.mockResolvedValue(new Map());

    const { result } = renderHook(
      () =>
        useCalculateCadStyling(
          [MODEL],
          [{ fdmAssetExternalIds: [INSTANCE_ID], style: { cad: { renderGhosted: true } } }]
        ),
      { wrapper }
    );

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

  test('returns loading state for DM instance style group', async () => {
    mockGetMappingsForModelsAndInstances.mockResolvedValue(new Map());

    const { result } = renderHook(
      () =>
        useCalculateCadStyling(
          [MODEL],
          [{ fdmAssetExternalIds: [INSTANCE_ID], style: { cad: { renderGhosted: true } } }]
        ),
      { wrapper }
    );

    expect(result.current).toEqual({
      styledModels: [{ model: MODEL, styleGroups: [] }],
      isModelMappingsLoading: true
    });
  });

  test('returns objects with models and style groups for DM instance after loading', async () => {
    mockGetMappingsForModelsAndInstances.mockResolvedValue(
      createModelToAssetMappingsMap(MODEL, INSTANCE_ID, DM_TREE_INDEX)
    );

    const { result } = renderHook(
      () =>
        useCalculateCadStyling(
          [MODEL],
          [{ fdmAssetExternalIds: [INSTANCE_ID], style: { cad: { renderGhosted: true } } }]
        ),
      { wrapper }
    );

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

  test('combines style groups from both FDM and hybrid/classic mappings', async () => {
    mockGetMappingsForModelsAndInstances.mockResolvedValue(
      new Map([
        [
          createModelRevisionKey(MODEL.modelId, MODEL.revisionId),
          new Map([
            [createInstanceKey(INSTANCE_ID), [createCadNodeMock({ treeIndex: TREE_INDEX })]],
            [createInstanceKey(ASSET_ID), [createCadNodeMock({ treeIndex: DM_TREE_INDEX })]]
          ])
        ]
      ])
    );

    const { result } = renderHook(
      () =>
        useCalculateCadStyling(
          [MODEL],
          [
            { assetIds: [ASSET_ID], style: { cad: { renderGhosted: true } } },
            { fdmAssetExternalIds: [INSTANCE_ID], style: { cad: { renderInFront: true } } }
          ]
        ),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isModelMappingsLoading).toBeFalsy();
    });

    expect(result.current.styledModels).toHaveLength(1);
    expect(result.current.styledModels[0].model).toEqual(MODEL);
    expect(result.current.styledModels[0].styleGroups).toHaveLength(2);

    expect(result.current.styledModels[0].styleGroups).toEqual([
      { style: { renderGhosted: true }, treeIndexSet: expect.any(IndexSet) },
      { style: { renderInFront: true }, treeIndexSet: expect.any(IndexSet) }
    ]);
  });
  test('processes multiple models with separate FDM and hybrid mappings', async () => {
    const MODEL2 = { modelId: 456, revisionId: 567, type: 'cad' } as const;

    mockGetMappingsForModelsAndInstances.mockResolvedValue(
      new Map([
        [
          createModelRevisionKey(MODEL.modelId, MODEL.revisionId),
          new Map([
            [createInstanceKey(ASSET_ID), [createCadNodeMock({ treeIndex: TREE_INDEX })]],
            [createInstanceKey(INSTANCE_ID), [createCadNodeMock({ treeIndex: DM_TREE_INDEX })]]
          ])
        ],
        [
          createModelRevisionKey(MODEL2.modelId, MODEL2.revisionId),
          new Map([
            [createInstanceKey(INSTANCE_ID), [createCadNodeMock({ treeIndex: DM_TREE_INDEX })]]
          ])
        ]
      ])
    );

    const { result } = renderHook(
      () =>
        useCalculateCadStyling(
          [MODEL, MODEL2],
          [
            { assetIds: [ASSET_ID], style: { cad: { renderGhosted: true } } },
            { fdmAssetExternalIds: [INSTANCE_ID], style: { cad: { renderInFront: true } } }
          ]
        ),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isModelMappingsLoading).toBeFalsy();
    });

    expect(result.current.styledModels).toHaveLength(2);

    expect(result.current.styledModels[0].model).toEqual(MODEL);
    expect(result.current.styledModels[0].styleGroups).toHaveLength(2);

    expect(result.current.styledModels[1].model).toEqual(MODEL2);
    expect(result.current.styledModels[1].styleGroups).toHaveLength(1);
    expect(result.current.styledModels[1].styleGroups[0]).toEqual({
      style: { renderInFront: true },
      treeIndexSet: expect.any(IndexSet)
    });
  });
});

function createModelToAssetMappingsMap(
  model: ClassicModelIdentifier,
  instanceId: InstanceId,
  treeIndex: number
): CadModelMappingsWithNodes {
  return new Map([
    [
      createModelRevisionKey(model.modelId, model.revisionId),
      new Map([[createInstanceKey(instanceId), [createCadNodeMock({ treeIndex })]]])
    ]
  ]);
}
