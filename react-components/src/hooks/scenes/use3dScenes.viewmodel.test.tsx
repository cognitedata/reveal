import { renderHook, type RenderHookResult } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import { type CogniteClient } from '@cognite/sdk';
import { Matrix4 } from 'three';
import { use3dScenesViewModel } from './use3dScenes.viewmodel';
import {
  defaultUse3dScenesViewModelDependencies,
  Use3dScenesViewModelContext
} from './use3dScenes.context';
import {
  type Use3dScenesViewModelProps,
  type Use3dScenesViewModelResult,
  type ScenesMap
} from './use3dScenes.types';
import { type SceneData } from './types';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import { sdkMock } from '#test-utils/fixtures/sdk';

describe(use3dScenesViewModel.name, () => {
  const mockProps: Use3dScenesViewModelProps = {
    userSdk: undefined
  };

  const defaultDependencies = getMocksByDefaultDependencies(
    defaultUse3dScenesViewModelDependencies
  );

  const mockSceneData: SceneData = {
    name: 'Test Scene',
    cameraTranslationX: 0,
    cameraTranslationY: 0,
    cameraTranslationZ: 10,
    cameraEulerRotationX: 0,
    cameraEulerRotationY: 0,
    cameraEulerRotationZ: 0,
    modelOptions: [
      {
        modelId: 123456,
        revisionId: 1,
        transformation: new Matrix4()
      }
    ],
    image360CollectionOptions: [],
    groundPlanes: [],
    skybox: undefined,
    qualitySettings: {
      cadBudget: 1000000,
      pointCloudBudget: 500000,
      maxRenderResolution: 1920
    }
  };

  const mockScenesMap: ScenesMap = {
    'test-space': {
      'test-scene-1': mockSceneData,
      'test-scene-2': { ...mockSceneData, name: 'Test Scene 2' }
    }
  };

  const mockFdmSdk = {
    queryNodesAndEdges: vi.fn()
  };

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <Use3dScenesViewModelContext.Provider value={defaultDependencies}>
      {children}
    </Use3dScenesViewModelContext.Provider>
  );

  const renderHookWithViewModel = (
    props: Use3dScenesViewModelProps = mockProps
  ): RenderHookResult<Use3dScenesViewModelResult, [Use3dScenesViewModelProps]> => {
    return renderHook(() => use3dScenesViewModel(props), { wrapper });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    defaultDependencies.useSDK.mockReturnValue(sdkMock);
    defaultDependencies.FdmSDK.mockImplementation(() => mockFdmSdk);
    defaultDependencies.tryGetModelIdFromExternalId.mockImplementation((externalId) => {
      const match = externalId.match(/(\d+)/);
      return match !== null ? parseInt(match[1], 10) : undefined;
    });

    // Mock successful query result by default
    defaultDependencies.useQuery.mockReturnValue({
      data: mockScenesMap,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      status: 'success',
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      fetchStatus: 'idle',
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isInitialLoading: false,
      isLoadingError: false,
      isPaused: false,
      isPending: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      remove: vi.fn()
    } satisfies Use3dScenesViewModelResult);
  });

  test('should initialize FdmSDK with correct SDK', () => {
    renderHookWithViewModel();

    expect(defaultDependencies.useSDK).toHaveBeenCalledWith(mockProps.userSdk);
    expect(defaultDependencies.FdmSDK).toHaveBeenCalledWith(sdkMock);
  });

  test('should pass correct query parameters to useQuery', () => {
    renderHookWithViewModel();

    expect(defaultDependencies.useQuery).toHaveBeenCalledWith({
      queryKey: ['reveal-react-components', 'cdf', '3d', 'scenes'],
      queryFn: expect.any(Function)
    });
  });

  test('should return successful query result', () => {
    const { result } = renderHookWithViewModel();

    expect(result.current.data).toEqual(mockScenesMap);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should handle loading state correctly', () => {
    defaultDependencies.useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      isSuccess: false,
      status: 'pending',
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      fetchStatus: 'fetching',
      isFetched: false,
      isFetchedAfterMount: false,
      isFetching: true,
      isInitialLoading: true,
      isLoadingError: false,
      isPaused: false,
      isPending: true,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: true,
      refetch: vi.fn(),
      remove: vi.fn()
    } satisfies Use3dScenesViewModelResult);

    const { result } = renderHookWithViewModel();

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSuccess).toBe(false);
  });

  test('should handle error state correctly', () => {
    const mockError = new Error('Failed to fetch scenes');
    defaultDependencies.useQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: mockError,
      isSuccess: false,
      status: 'error',
      dataUpdatedAt: 0,
      errorUpdatedAt: Date.now(),
      failureCount: 1,
      failureReason: mockError,
      fetchStatus: 'idle',
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isInitialLoading: false,
      isLoadingError: true,
      isPaused: false,
      isPending: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      remove: vi.fn()
    } satisfies Use3dScenesViewModelResult);

    const { result } = renderHookWithViewModel();

    expect(result.current.data).toBeUndefined();
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(mockError);
    expect(result.current.isSuccess).toBe(false);
  });

  test('should use custom SDK when provided', () => {
    const customSdk = { ...sdkMock, project: 'custom-project' } satisfies CogniteClient;
    const customProps: Use3dScenesViewModelProps = {
      userSdk: customSdk
    };

    defaultDependencies.useSDK.mockReturnValue(customSdk);

    renderHookWithViewModel(customProps);

    expect(defaultDependencies.useSDK).toHaveBeenCalledWith(customSdk);
    expect(defaultDependencies.FdmSDK).toHaveBeenCalledWith(customSdk);
  });

  test('should handle FdmSDK creation correctly', () => {
    const mockFdmInstance = {
      queryNodesAndEdges: vi.fn().mockResolvedValue({
        items: {
          scenes: [],
          sceneModels: [],
          scene360Collections: [],
          sceneGroundPlanes: [],
          sceneGroundPlaneEdges: [],
          sceneSkybox: []
        },
        nextCursor: undefined
      })
    };

    defaultDependencies.FdmSDK.mockImplementation(() => mockFdmInstance);

    renderHookWithViewModel();

    expect(defaultDependencies.FdmSDK).toHaveBeenCalledWith(sdkMock);
  });

  test('should handle query function execution with mock data', async () => {
    const mockQueryResponse = {
      items: {
        scenes: [
          {
            space: 'test-space',
            externalId: 'test-scene',
            properties: {
              scene: {
                'SceneConfiguration/v1': {
                  name: 'Test Scene',
                  cameraTranslationX: 0,
                  cameraTranslationY: 0,
                  cameraTranslationZ: 10
                }
              }
            }
          }
        ],
        sceneModels: [],
        scene360Collections: [],
        sceneGroundPlanes: [],
        sceneGroundPlaneEdges: [],
        sceneSkybox: []
      },
      nextCursor: undefined
    };

    mockFdmSdk.queryNodesAndEdges.mockResolvedValue(mockQueryResponse);

    // Extract and test the query function
    renderHookWithViewModel();

    const queryCall = defaultDependencies.useQuery.mock.calls[0];
    const queryFn = queryCall[0].queryFn;

    const result = await queryFn({} as any);

    expect(mockFdmSdk.queryNodesAndEdges).toHaveBeenCalled();
    expect(result).toEqual(
      expect.objectContaining({
        'test-space': expect.objectContaining({
          'test-scene': expect.objectContaining({
            name: 'Test Scene',
            cameraTranslationX: 0,
            cameraTranslationY: 0,
            cameraTranslationZ: 10
          })
        })
      })
    );
  });

  test('should handle pagination with multiple query calls', async () => {
    // Create array of 100 scenes to trigger pagination (SCENE_QUERY_LIMIT = 100)
    const firstPageScenes = Array.from({ length: 100 }, (_, i) => ({
      space: 'test-space',
      externalId: `scene-${i + 1}`,
      properties: {
        scene: {
          'SceneConfiguration/v1': {
            name: `Scene ${i + 1}`
          }
        }
      }
    }));

    const secondPageScenes = [
      {
        space: 'test-space',
        externalId: 'scene-101',
        properties: {
          scene: {
            'SceneConfiguration/v1': {
              name: 'Scene 101'
            }
          }
        }
      }
    ];

    const firstResponse = {
      items: {
        scenes: firstPageScenes,
        sceneModels: [],
        scene360Collections: [],
        sceneGroundPlanes: [],
        sceneGroundPlaneEdges: [],
        sceneSkybox: []
      },
      nextCursor: { scenes: 'cursor-123' }
    };

    const secondResponse = {
      items: {
        scenes: secondPageScenes,
        sceneModels: [],
        scene360Collections: [],
        sceneGroundPlanes: [],
        sceneGroundPlaneEdges: [],
        sceneSkybox: []
      },
      nextCursor: undefined
    };

    mockFdmSdk.queryNodesAndEdges
      .mockResolvedValueOnce(firstResponse)
      .mockResolvedValueOnce(secondResponse);

    // Extract and test the query function with pagination
    renderHookWithViewModel();

    const queryCall = defaultDependencies.useQuery.mock.calls[0];
    const queryFn = queryCall[0].queryFn;

    const result = await queryFn({} as any);

    expect(mockFdmSdk.queryNodesAndEdges).toHaveBeenCalledTimes(2);
    expect(result).toEqual(
      expect.objectContaining({
        'test-space': expect.objectContaining({
          'scene-1': expect.objectContaining({
            name: 'Scene 1'
          }),
          'scene-100': expect.objectContaining({
            name: 'Scene 100'
          }),
          'scene-101': expect.objectContaining({
            name: 'Scene 101'
          })
        })
      })
    );
  });

  test('should call tryGetModelIdFromExternalId for model processing', async () => {
    const mockQueryResponse = {
      items: {
        scenes: [
          {
            space: 'test-space',
            externalId: 'test-scene',
            properties: {
              scene: {
                'SceneConfiguration/v1': {
                  name: 'Test Scene'
                }
              }
            }
          }
        ],
        sceneModels: [
          {
            startNode: { space: 'test-space', externalId: 'test-scene' },
            endNode: { externalId: 'model-123456' },
            properties: {
              'transformation-source': {
                'Transformation3d/v1': {
                  revisionId: '1',
                  translationX: 0,
                  translationY: 0,
                  translationZ: 0,
                  eulerRotationX: 0,
                  eulerRotationY: 0,
                  eulerRotationZ: 0,
                  scaleX: 1,
                  scaleY: 1,
                  scaleZ: 1
                }
              }
            }
          }
        ],
        scene360Collections: [],
        sceneGroundPlanes: [],
        sceneGroundPlaneEdges: [],
        sceneSkybox: []
      },
      nextCursor: undefined
    };

    mockFdmSdk.queryNodesAndEdges.mockResolvedValue(mockQueryResponse);

    // Extract and test the query function
    renderHookWithViewModel();

    const queryCall = defaultDependencies.useQuery.mock.calls[0];
    const queryFn = queryCall[0].queryFn;

    await queryFn({} as any);

    expect(defaultDependencies.tryGetModelIdFromExternalId).toHaveBeenCalledWith('model-123456');
  });
});
