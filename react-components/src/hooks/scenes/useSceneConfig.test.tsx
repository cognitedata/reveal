import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import { type QueryFunction } from '@tanstack/react-query';
import { type Scene } from '../../components/SceneContainer/sceneTypes';
import { createMockQueryContext, createMockQueryResult } from '#test-utils/fixtures/queryResult';
import { useSceneConfig } from './useSceneConfig';
import { type UseSceneConfigDependencies, UseSceneConfigContext } from './useSceneConfig.context';
import { type ScenesMap, type SceneData } from './types';

describe(useSceneConfig.name, () => {
  const mockProps = {
    sceneExternalId: 'test-scene',
    sceneSpace: 'test-space'
  };

  const mockUseQuery = vi.fn();
  const mockUse3dScenes = vi.fn<UseSceneConfigDependencies['use3dScenes']>();

  const mockDependencies: UseSceneConfigDependencies = {
    use3dScenes: mockUse3dScenes,
    useQuery: mockUseQuery
  };

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <UseSceneConfigContext.Provider value={mockDependencies}>
      {children}
    </UseSceneConfigContext.Provider>
  );

  const createSceneData = (overrides?: Partial<SceneData>): SceneData => ({
    name: 'Test Scene',
    cameraTranslationX: 0,
    cameraTranslationY: 0,
    cameraTranslationZ: 0,
    cameraEulerRotationX: 0,
    cameraEulerRotationY: 0,
    cameraEulerRotationZ: 0,
    cameraTargetX: 0,
    cameraTargetY: 0,
    cameraTargetZ: 0,
    modelOptions: [],
    image360CollectionOptions: [],
    groundPlanes: [],
    skybox: undefined,
    qualitySettings: {
      cadBudget: 1000000,
      pointCloudBudget: 500000,
      maxRenderResolution: 1920
    },
    ...overrides
  });

  const mockScenesMap: ScenesMap = {
    'test-space': {
      'test-scene': createSceneData()
    }
  };

  // Helper: Execute queryFn and return result
  const executeQueryFn = async (): Promise<Scene | null | undefined> => {
    let capturedQueryFunction!: QueryFunction<Scene | null>;
    mockUseQuery.mockImplementation((options) => {
      capturedQueryFunction = options.queryFn;
      return createMockQueryResult(null);
    });

    renderHook(() => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace), { wrapper });

    return await capturedQueryFunction(
      createMockQueryContext([
        'reveal',
        'react-components',
        'sync-scene-config',
        mockProps.sceneExternalId,
        mockProps.sceneSpace
      ])
    );
  };

  beforeEach(() => {
    mockUseQuery.mockReturnValue(createMockQueryResult(null));
    mockUse3dScenes.mockReturnValue(createMockQueryResult(mockScenesMap));
  });

  test('should pass correct query parameters to useQuery', () => {
    renderHook(() => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace), { wrapper });

    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ['reveal', 'react-components', 'sync-scene-config', 'test-scene', 'test-space'],
      queryFn: expect.any(Function),
      enabled: true,
      staleTime: Infinity
    });
  });

  test('should disable query when parameters are undefined', () => {
    renderHook(() => useSceneConfig(undefined, undefined), { wrapper });

    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ['reveal', 'react-components', 'sync-scene-config', undefined, undefined],
      queryFn: expect.any(Function),
      enabled: false,
      staleTime: Infinity
    });
  });

  test('should handle loading state', () => {
    mockUseQuery.mockReturnValue(createMockQueryResult(undefined, false, true));

    const { result } = renderHook(
      () => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  test('should handle error state', () => {
    const testError = new Error('Test error');
    mockUseQuery.mockReturnValue(createMockQueryResult(undefined, false, false, true, testError));

    const { result } = renderHook(
      () => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace),
      { wrapper }
    );

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(testError);
  });

  test('should call use3dScenes and pass queryFunction', () => {
    renderHook(() => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace), { wrapper });

    expect(mockUse3dScenes).toHaveBeenCalled();
    const callArgs = mockUseQuery.mock.calls[0][0];
    expect(callArgs).toHaveProperty('queryFn');
    expect(typeof callArgs.queryFn).toBe('function');
  });

  test('should handle refetch functionality', () => {
    const mockRefetch = vi.fn();
    const resultWithRefetch = createMockQueryResult(null);
    resultWithRefetch.refetch = mockRefetch;
    mockUseQuery.mockReturnValue(resultWithRefetch);

    const { result } = renderHook(
      () => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace),
      { wrapper }
    );

    expect(result.current.refetch).toBe(mockRefetch);
  });

  test('should return null when scene data does not exist', async () => {
    mockUse3dScenes.mockReturnValue(createMockQueryResult({}));
    const result = await executeQueryFn();
    expect(result).toBeNull();
  });

  test('should execute complete scene processing with minimal data', async () => {
    mockUse3dScenes.mockReturnValue(
      createMockQueryResult({
        [mockProps.sceneSpace]: {
          [mockProps.sceneExternalId]: createSceneData()
        }
      })
    );

    const result = await executeQueryFn();
    expect(result).toBeDefined();
    expect(result?.sceneConfiguration.name).toBe('Test Scene');
    expect(result?.sceneModels).toHaveLength(0);
    expect(result?.image360Collections).toHaveLength(0);
  });

  test('should transform classic model identifiers correctly', async () => {
    mockUse3dScenes.mockReturnValue(
      createMockQueryResult({
        [mockProps.sceneSpace]: {
          [mockProps.sceneExternalId]: createSceneData({
            modelOptions: [
              { modelId: 12345, revisionId: 67890, defaultVisible: true },
              { modelId: 54321, revisionId: 98765, defaultVisible: false }
            ]
          })
        }
      })
    );

    const result = await executeQueryFn();
    expect(result?.sceneModels).toHaveLength(2);
    expect(result?.sceneModels[0].modelIdentifier).toHaveProperty('modelId', 12345);
    expect(result?.sceneModels[0].modelIdentifier).toHaveProperty('revisionId', 67890);
    expect(result?.sceneModels[0].defaultVisible).toBe(true);
    expect(result?.sceneModels[1].modelIdentifier).toHaveProperty('modelId', 54321);
    expect(result?.sceneModels[1].defaultVisible).toBe(false);
  });

  test('should transform datamodels model identifiers correctly', async () => {
    mockUse3dScenes.mockReturnValue(
      createMockQueryResult({
        [mockProps.sceneSpace]: {
          [mockProps.sceneExternalId]: createSceneData({
            modelOptions: [
              {
                revisionExternalId: 'dm-revision-1',
                revisionSpace: 'dm-space-1',
                defaultVisible: true
              },
              {
                revisionExternalId: 'dm-revision-2',
                revisionSpace: 'dm-space-2',
                defaultVisible: false
              }
            ]
          })
        }
      })
    );

    const result = await executeQueryFn();
    expect(result?.sceneModels).toHaveLength(2);
    expect(result?.sceneModels[0].modelIdentifier).toHaveProperty(
      'revisionExternalId',
      'dm-revision-1'
    );
    expect(result?.sceneModels[0].modelIdentifier).toHaveProperty('revisionSpace', 'dm-space-1');
    expect(result?.sceneModels[1].defaultVisible).toBe(false);
  });

  test('should transform image360 collection options correctly', async () => {
    mockUse3dScenes.mockReturnValue(
      createMockQueryResult({
        [mockProps.sceneSpace]: {
          [mockProps.sceneExternalId]: createSceneData({
            image360CollectionOptions: [
              {
                source: 'dm',
                externalId: 'image-collection-1',
                space: 'image-space-1',
                defaultVisible: true
              },
              {
                source: 'dm',
                externalId: 'image-collection-2',
                space: 'image-space-2',
                defaultVisible: false
              }
            ]
          })
        }
      })
    );

    const result = await executeQueryFn();
    expect(result?.image360Collections).toHaveLength(2);
    expect(result?.image360Collections[0].image360CollectionExternalId).toBe('image-collection-1');
    expect(result?.image360Collections[0].image360CollectionSpace).toBe('image-space-1');
    expect(result?.image360Collections[0].defaultVisible).toBe(true);
    expect(result?.image360Collections[1].defaultVisible).toBe(false);
  });

  test('should transform mixed model types correctly', async () => {
    mockUse3dScenes.mockReturnValue(
      createMockQueryResult({
        [mockProps.sceneSpace]: {
          [mockProps.sceneExternalId]: createSceneData({
            modelOptions: [
              { modelId: 11111, revisionId: 22222, defaultVisible: true },
              {
                revisionExternalId: 'dm-revision-mixed',
                revisionSpace: 'dm-space-mixed',
                defaultVisible: false
              }
            ],
            image360CollectionOptions: [
              {
                source: 'dm',
                externalId: 'mixed-image-collection',
                space: 'mixed-image-space',
                defaultVisible: true
              }
            ]
          })
        }
      })
    );

    const result = await executeQueryFn();
    expect(result?.sceneModels).toHaveLength(2);
    expect(result?.sceneModels[0].modelIdentifier).toHaveProperty('modelId', 11111);
    expect(result?.sceneModels[1].modelIdentifier).toHaveProperty(
      'revisionExternalId',
      'dm-revision-mixed'
    );
    expect(result?.image360Collections).toHaveLength(1);
    expect(result?.image360Collections[0].image360CollectionExternalId).toBe(
      'mixed-image-collection'
    );
  });
});
