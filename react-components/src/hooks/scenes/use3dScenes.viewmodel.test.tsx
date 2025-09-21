import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, assert } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import { Mock } from 'moq.ts';
import { type CogniteClient } from '@cognite/sdk';
import { type QueryFunction, QueryClient } from '@tanstack/react-query';
import { type SceneNode, Use3dScenesViewModel } from './use3dScenes.viewmodel';
import {
  type Use3dScenesViewModelDependencies,
  Use3dScenesViewModelContext
} from './use3dScenes.viewmodel.context';
import { type Use3dScenesViewModelProps, type ScenesMap } from './use3dScenes.types';
import { type FdmSDK } from '../../data-providers/FdmSDK';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { createMockQueryResult } from '#test-utils/fixtures/queryResult';

describe(Use3dScenesViewModel.name, () => {
  const mockProps: Use3dScenesViewModelProps = {
    userSdk: undefined
  };

  const mockUseSDK = vi.fn();
  const mockUseQuery = vi.fn();
  const mockCreateFdmSdk = vi.fn();
  const mockQueryNodesAndEdges = vi.fn();

  const mockFdmSdkInstance = new Mock<FdmSDK>()
    .setup((instance) => instance.queryNodesAndEdges)
    .returns(mockQueryNodesAndEdges)
    .object();

  const mockDependencies: Use3dScenesViewModelDependencies = {
    useSDK: mockUseSDK,
    useQuery: mockUseQuery,
    createFdmSdk: mockCreateFdmSdk
  };

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <Use3dScenesViewModelContext.Provider value={mockDependencies}>
      {children}
    </Use3dScenesViewModelContext.Provider>
  );

  beforeEach(() => {
    mockUseSDK.mockReturnValue(sdkMock);
    mockUseQuery.mockReturnValue(createMockQueryResult({}));
    mockCreateFdmSdk.mockReturnValue(mockFdmSdkInstance);
  });

  test('should call useSDK with correct parameters', () => {
    renderHook(() => Use3dScenesViewModel(mockProps), { wrapper });

    expect(mockUseSDK).toHaveBeenCalledWith(mockProps.userSdk);
  });

  test('should create FdmSDK with SDK from useSDK', () => {
    renderHook(() => Use3dScenesViewModel(mockProps), { wrapper });

    expect(mockCreateFdmSdk).toHaveBeenCalledWith(sdkMock);
  });

  test('should create FdmSDK with custom SDK when provided', () => {
    const customSdkMock = new Mock<CogniteClient>()
      .setup((sdk) => sdk.getBaseUrl)
      .returns(vi.fn().mockReturnValue('https://custom.cognitedata.com'))
      .object();

    mockUseSDK.mockReturnValueOnce(customSdkMock);

    const customProps: Use3dScenesViewModelProps = {
      userSdk: customSdkMock
    };

    renderHook(() => Use3dScenesViewModel(customProps), { wrapper });

    expect(mockUseSDK).toHaveBeenCalledWith(customProps.userSdk);
    expect(mockCreateFdmSdk).toHaveBeenCalledWith(customSdkMock);
  });

  test('should pass correct query parameters to useQuery', () => {
    renderHook(() => Use3dScenesViewModel(mockProps), { wrapper });

    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ['reveal-react-components', 'cdf', '3d', 'scenes'],
      queryFn: expect.any(Function)
    });
  });

  test('should return successful query result', () => {
    const mockScenesMap: ScenesMap = {
      'test-space': {
        'test-scene': {
          name: 'Test Scene',
          cameraTranslationX: 0,
          cameraTranslationY: 0,
          cameraTranslationZ: 0,
          cameraEulerRotationX: 0,
          cameraEulerRotationY: 0,
          cameraEulerRotationZ: 0,
          modelOptions: [],
          image360CollectionOptions: [],
          groundPlanes: [],
          skybox: undefined,
          qualitySettings: {
            cadBudget: 1000000,
            pointCloudBudget: 500000,
            maxRenderResolution: 1920
          }
        }
      }
    };

    mockUseQuery.mockReturnValue(createMockQueryResult(mockScenesMap));

    const { result } = renderHook(() => Use3dScenesViewModel(mockProps), { wrapper });

    expect(result.current.data).toEqual(mockScenesMap);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  test('should use custom SDK when provided', () => {
    const customSdk = sdkMock;
    const customProps: Use3dScenesViewModelProps = {
      userSdk: customSdk
    };

    mockUseSDK.mockReturnValue(customSdk);

    renderHook(() => Use3dScenesViewModel(customProps), { wrapper });

    expect(mockUseSDK).toHaveBeenCalledWith(customSdk);
  });

  test('should handle loading state', () => {
    const loadingResult = createMockQueryResult(undefined, false, true);
    mockUseQuery.mockReturnValue(loadingResult);

    const { result } = renderHook(() => Use3dScenesViewModel(mockProps), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  test('should handle error state', () => {
    const testError = new Error('Test error');
    const errorResult = createMockQueryResult(undefined, false, false, true, testError);
    mockUseQuery.mockReturnValue(errorResult);

    const { result } = renderHook(() => Use3dScenesViewModel(mockProps), { wrapper });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(testError);
  });

  test('should create FdmSDK instance with correct SDK', () => {
    renderHook(() => Use3dScenesViewModel(mockProps), { wrapper });

    expect(mockUseSDK).toHaveBeenCalledWith(mockProps.userSdk);
  });

  test('should pass queryFunction to useQuery', () => {
    renderHook(() => Use3dScenesViewModel(mockProps), { wrapper });

    const callArgs = mockUseQuery.mock.calls[0][0];
    expect(callArgs).toHaveProperty('queryKey');
    expect(callArgs).toHaveProperty('queryFn');
    expect(typeof callArgs.queryFn).toBe('function');
  });

  test('should have correct query key structure', () => {
    renderHook(() => Use3dScenesViewModel(mockProps), { wrapper });

    const queryKey = mockUseQuery.mock.calls[0][0].queryKey;
    expect(queryKey).toEqual(['reveal-react-components', 'cdf', '3d', 'scenes']);
  });

  test('should handle different SDK configurations', () => {
    const customSdkMock = sdkMock;
    customSdkMock.getBaseUrl = vi.fn().mockReturnValue('https://custom.cognitedata.com');

    mockUseSDK.mockReturnValue(customSdkMock);

    const propsWithCustomSdk: Use3dScenesViewModelProps = {
      userSdk: customSdkMock
    };

    renderHook(() => Use3dScenesViewModel(propsWithCustomSdk), { wrapper });

    expect(mockUseSDK).toHaveBeenCalledWith(customSdkMock);
  });

  test('should return empty data when no scenes', () => {
    const emptyResult = createMockQueryResult({});
    mockUseQuery.mockReturnValue(emptyResult);

    const { result } = renderHook(() => Use3dScenesViewModel(mockProps), { wrapper });

    expect(result.current.data).toEqual({});
  });

  test('should handle complex scenes map structure', () => {
    const complexScenesMap: ScenesMap = {
      'space-1': {
        'scene-1': {
          name: 'Scene 1',
          cameraTranslationX: 1,
          cameraTranslationY: 2,
          cameraTranslationZ: 3,
          cameraEulerRotationX: 0,
          cameraEulerRotationY: 90,
          cameraEulerRotationZ: 0,
          modelOptions: [
            {
              modelId: 123,
              revisionId: 1
            }
          ],
          image360CollectionOptions: [],
          groundPlanes: [],
          skybox: {
            label: 'Sky 1',
            isSpherical: true,
            file: 'sky1.jpg'
          },
          qualitySettings: {
            cadBudget: 1000000,
            pointCloudBudget: 500000,
            maxRenderResolution: 1920
          }
        },
        'scene-2': {
          name: 'Scene 2',
          cameraTranslationX: 4,
          cameraTranslationY: 5,
          cameraTranslationZ: 6,
          cameraEulerRotationX: 0,
          cameraEulerRotationY: 0,
          cameraEulerRotationZ: 0,
          modelOptions: [],
          image360CollectionOptions: [
            {
              source: 'dm',
              externalId: 'image-1',
              space: 'image-space'
            }
          ],
          groundPlanes: [
            {
              label: 'Ground 1',
              file: 'ground1.jpg',
              wrapping: 'repeat',
              repeatU: 2,
              repeatV: 2,
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
          ],
          skybox: undefined,
          qualitySettings: {
            cadBudget: 500000,
            pointCloudBudget: 250000,
            maxRenderResolution: 1080
          }
        }
      },
      'space-2': {
        'scene-3': {
          name: 'Scene 3',
          cameraTranslationX: 0,
          cameraTranslationY: 0,
          cameraTranslationZ: 0,
          cameraEulerRotationX: 0,
          cameraEulerRotationY: 0,
          cameraEulerRotationZ: 0,
          modelOptions: [],
          image360CollectionOptions: [],
          groundPlanes: [],
          skybox: undefined,
          qualitySettings: {
            cadBudget: 2000000,
            pointCloudBudget: 1000000,
            maxRenderResolution: 4096
          }
        }
      }
    };

    mockUseQuery.mockReturnValue(createMockQueryResult(complexScenesMap));

    const { result } = renderHook(() => Use3dScenesViewModel(mockProps), { wrapper });

    expect(result.current.data).toEqual(complexScenesMap);
    expect(result.current.data).toBeDefined();
    assert(result.current.data !== undefined);
    expect(Object.keys(result.current.data)).toHaveLength(2);
    expect(Object.keys(result.current.data['space-1'])).toHaveLength(2);
    expect(Object.keys(result.current.data['space-2'])).toHaveLength(1);
  });

  test('should handle context changes', () => {
    const customUseSDK = vi.fn();
    const customUseQuery = vi.fn();
    const customCreateFdmSdk = vi.fn();

    const customDependencies: Use3dScenesViewModelDependencies = {
      useSDK: customUseSDK,
      useQuery: customUseQuery,
      createFdmSdk: customCreateFdmSdk
    };

    customUseSDK.mockReturnValue(sdkMock);
    customUseQuery.mockReturnValue(createMockQueryResult({}));
    customCreateFdmSdk.mockReturnValue(mockFdmSdkInstance);

    const customWrapper = ({ children }: { children: ReactNode }): ReactElement => (
      <Use3dScenesViewModelContext.Provider value={customDependencies}>
        {children}
      </Use3dScenesViewModelContext.Provider>
    );

    renderHook(() => Use3dScenesViewModel(mockProps), { wrapper: customWrapper });

    expect(customUseSDK).toHaveBeenCalledWith(mockProps.userSdk);
    expect(customUseQuery).toHaveBeenCalled();
    expect(customCreateFdmSdk).toHaveBeenCalled();
  });

  test('should handle refetch functionality', () => {
    const mockRefetch = vi.fn();
    const resultWithRefetch = createMockQueryResult({});
    resultWithRefetch.refetch = mockRefetch;

    mockUseQuery.mockReturnValue(resultWithRefetch);

    const { result } = renderHook(() => Use3dScenesViewModel(mockProps), { wrapper });

    expect(result.current.refetch).toBe(mockRefetch);
  });

  test('should execute complete scene processing with minimal data', async () => {
    mockQueryNodesAndEdges.mockResolvedValue({
      items: {
        scenes: [
          {
            externalId: 'test-scene-1',
            space: 'test-space',
            properties: {
              scene: {
                'SceneConfiguration/v1': {
                  name: 'Test Scene 1'
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
    });

    let capturedQueryFunction: QueryFunction<ScenesMap> | undefined;
    mockUseQuery.mockImplementation((options) => {
      capturedQueryFunction = options.queryFn;
      return createMockQueryResult({});
    });

    renderHook(() => Use3dScenesViewModel(mockProps), { wrapper });

    const mockContext = {
      client: new QueryClient(),
      queryKey: ['scenes', undefined],
      signal: new AbortController().signal,
      meta: undefined
    };

    assert(capturedQueryFunction !== undefined);
    const result = await capturedQueryFunction(mockContext);

    // Verify the result structure (covers createMapOfScenes execution)
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
    expect(result['test-space']).toBeDefined();
    expect(result['test-space']['test-scene-1']).toBeDefined();
    expect(result['test-space']['test-scene-1'].name).toBe('Test Scene 1');
  });

  test('should handle pagination', async () => {
    // Create 100+ scenes to trigger pagination
    const createMockScenes = (count: number, startIndex: number = 0): SceneNode[] =>
      Array.from({ length: count }, (_, i) => ({
        externalId: `scene-${startIndex + i}`,
        space: 'test-space',
        createdTime: Date.now(),
        lastUpdatedTime: Date.now(),
        version: 1,
        instanceType: 'node',
        properties: {
          scene: {
            'SceneConfiguration/v1': {
              name: `Scene ${startIndex + i}`
            }
          }
        }
      }));

    // Mock first call returns 100 scenes with cursor
    // Mock second call returns remaining scenes without cursor
    mockQueryNodesAndEdges
      .mockResolvedValueOnce({
        items: {
          scenes: createMockScenes(100, 0),
          sceneModels: [],
          scene360Collections: [],
          sceneGroundPlanes: [],
          sceneGroundPlaneEdges: [],
          sceneSkybox: []
        },
        nextCursor: { scenes: 'cursor-token' }
      })
      .mockResolvedValueOnce({
        items: {
          scenes: createMockScenes(50, 100),
          sceneModels: [],
          scene360Collections: [],
          sceneGroundPlanes: [],
          sceneGroundPlaneEdges: [],
          sceneSkybox: []
        },
        nextCursor: undefined
      });

    let capturedQueryFunction: QueryFunction<ScenesMap> | undefined;
    mockUseQuery.mockImplementation((options) => {
      capturedQueryFunction = options.queryFn;
      return createMockQueryResult({});
    });

    renderHook(() => Use3dScenesViewModel(mockProps), { wrapper });

    // Mock context for QueryFunction
    const mockContext = {
      client: new QueryClient(),
      queryKey: ['scenes', undefined],
      signal: new AbortController().signal,
      meta: undefined
    };

    assert(capturedQueryFunction !== undefined);
    const result = await capturedQueryFunction(mockContext);

    // Verify pagination worked - should have 150 scenes total
    const allScenes = Object.values(result).flatMap((spaceScenes) => Object.values(spaceScenes));
    expect(allScenes).toHaveLength(150);
    expect(mockQueryNodesAndEdges).toHaveBeenCalledTimes(2);
  });

  test('should populate scene map with models', async () => {
    mockQueryNodesAndEdges.mockResolvedValue({
      items: {
        scenes: [
          {
            externalId: 'scene-with-model',
            space: 'test-space',
            properties: {
              scene: {
                'SceneConfiguration/v1': {
                  name: 'Scene with Model'
                }
              }
            }
          }
        ],
        sceneModels: [
          {
            startNode: {
              externalId: 'scene-with-model',
              space: 'test-space'
            },
            endNode: {
              externalId: 'cog_3d_model_123'
            },
            properties: {
              'SceneModels/v1': {
                'SceneModels/v1': {
                  revisionId: 1,
                  translationX: 10,
                  translationY: 20,
                  translationZ: 30
                }
              }
            }
          }
        ],
        scene360Collections: [],
        sceneGroundPlanes: [],
        sceneGroundPlaneEdges: [],
        sceneSkybox: []
      }
    });

    let capturedQueryFunction: QueryFunction<ScenesMap> | undefined;
    mockUseQuery.mockImplementation((options) => {
      capturedQueryFunction = options.queryFn;
      return createMockQueryResult({});
    });

    renderHook(() => Use3dScenesViewModel(mockProps), { wrapper });

    // Mock context for QueryFunction
    const mockContext = {
      client: new QueryClient(),
      queryKey: ['scenes', undefined],
      signal: new AbortController().signal,
      meta: undefined
    };

    assert(capturedQueryFunction !== undefined);
    const result = await capturedQueryFunction(mockContext);

    // Verify model was added to scene
    expect(result['test-space']['scene-with-model'].modelOptions).toBeDefined();
    expect(result['test-space']['scene-with-model'].modelOptions).toHaveLength(1);
    expect(result['test-space']['scene-with-model'].modelOptions[0]).toEqual({
      modelId: 123,
      revisionId: 1,
      transformation: expect.any(Object)
    });
  });

  test('should populate scene map with 360 images', async () => {
    mockQueryNodesAndEdges.mockResolvedValue({
      items: {
        scenes: [
          {
            externalId: 'scene-with-360',
            space: 'test-space',
            properties: {
              scene: {
                'SceneConfiguration/v1': {
                  name: 'Scene with 360 Images'
                }
              }
            }
          }
        ],
        sceneModels: [],
        scene360Collections: [
          {
            startNode: {
              externalId: 'scene-with-360',
              space: 'test-space'
            },
            properties: {
              'Scene360ImageCollection/v1': {
                'Scene360ImageCollection/v1': {
                  image360CollectionExternalId: 'image-collection-1',
                  image360CollectionSpace: 'image-space',
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
        sceneGroundPlanes: [],
        sceneGroundPlaneEdges: [],
        sceneSkybox: []
      }
    });

    let capturedQueryFunction: QueryFunction<ScenesMap> | undefined;
    mockUseQuery.mockImplementation((options) => {
      capturedQueryFunction = options.queryFn;
      return createMockQueryResult({});
    });

    renderHook(() => Use3dScenesViewModel(mockProps), { wrapper });

    // Mock context for QueryFunction
    const mockContext = {
      client: new QueryClient(),
      queryKey: ['scenes', undefined],
      signal: new AbortController().signal,
      meta: undefined
    };

    assert(capturedQueryFunction !== undefined);
    const result = await capturedQueryFunction(mockContext);

    // Verify 360 image collection was added to scene
    expect(result['test-space']['scene-with-360'].image360CollectionOptions).toBeDefined();
    expect(result['test-space']['scene-with-360'].image360CollectionOptions).toHaveLength(1);
    expect(result['test-space']['scene-with-360'].image360CollectionOptions[0]).toEqual({
      source: 'dm',
      externalId: 'image-collection-1',
      space: 'image-space',
      transform: expect.any(Object)
    });
  });

  test('should populate scene map with ground planes', async () => {
    mockQueryNodesAndEdges.mockResolvedValue({
      items: {
        scenes: [
          {
            externalId: 'scene-with-groundplane',
            space: 'test-space',
            properties: {
              scene: {
                'SceneConfiguration/v1': {
                  name: 'Scene with Ground Plane'
                }
              }
            }
          }
        ],
        sceneModels: [],
        scene360Collections: [],
        sceneGroundPlanes: [
          {
            externalId: 'ground-plane-1',
            space: 'test-space',
            properties: {
              'GroundPlane/v1': {
                'GroundPlane/v1': {
                  label: 'Ground Plane 1',
                  file: 'ground.jpg'
                }
              }
            }
          }
        ],
        sceneGroundPlaneEdges: [
          {
            startNode: {
              externalId: 'scene-with-groundplane',
              space: 'test-space'
            },
            endNode: {
              externalId: 'ground-plane-1',
              space: 'test-space'
            },
            properties: {
              'Transformation3d/v1': {
                'Transformation3d/v1': {
                  translationX: 5,
                  translationY: 0,
                  translationZ: 5,
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
        sceneSkybox: []
      }
    });

    let capturedQueryFunction: QueryFunction<ScenesMap> | undefined;
    mockUseQuery.mockImplementation((options) => {
      capturedQueryFunction = options.queryFn;
      return createMockQueryResult({});
    });

    renderHook(() => Use3dScenesViewModel(mockProps), { wrapper });

    // Mock context for QueryFunction
    const mockContext = {
      client: new QueryClient(),
      queryKey: ['scenes', undefined],
      signal: new AbortController().signal,
      meta: undefined
    };

    assert(capturedQueryFunction !== undefined);
    const result = await capturedQueryFunction(mockContext);

    // Verify ground plane was added to scene
    expect(result['test-space']['scene-with-groundplane'].groundPlanes).toBeDefined();
    expect(result['test-space']['scene-with-groundplane'].groundPlanes).toHaveLength(1);
    expect(result['test-space']['scene-with-groundplane'].groundPlanes[0]).toEqual({
      label: 'Ground Plane 1',
      file: 'ground.jpg',
      translationX: 5,
      translationY: 0,
      translationZ: 5,
      eulerRotationX: 0,
      eulerRotationY: 0,
      eulerRotationZ: 0,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
      repeatU: 1,
      repeatV: 1,
      wrapping: undefined
    });
  });

  test('should handle skybox in scenes', async () => {
    mockQueryNodesAndEdges.mockResolvedValue({
      items: {
        scenes: [
          {
            externalId: 'scene-with-skybox',
            space: 'test-space',
            properties: {
              scene: {
                'SceneConfiguration/v1': {
                  name: 'Scene with Skybox',
                  skybox: {
                    externalId: 'skybox-hdr',
                    space: 'test-space'
                  }
                }
              }
            }
          }
        ],
        sceneModels: [],
        scene360Collections: [],
        sceneGroundPlanes: [],
        sceneGroundPlaneEdges: [],
        sceneSkybox: [
          {
            externalId: 'skybox-hdr',
            space: 'test-space',
            properties: {
              'EnvironmentMap/v1': {
                'EnvironmentMap/v1': {
                  label: 'HDR Skybox',
                  isSpherical: true,
                  file: 'skybox.hdr'
                }
              }
            }
          }
        ]
      }
    });

    let capturedQueryFunction: QueryFunction<ScenesMap> | undefined;
    mockUseQuery.mockImplementation((options) => {
      capturedQueryFunction = options.queryFn;
      return createMockQueryResult({});
    });

    renderHook(() => Use3dScenesViewModel(mockProps), { wrapper });

    // Mock context for QueryFunction
    const mockContext = {
      client: new QueryClient(),
      queryKey: ['scenes', undefined],
      signal: new AbortController().signal,
      meta: undefined
    };

    assert(capturedQueryFunction !== undefined);
    const result = await capturedQueryFunction(mockContext);

    // Verify skybox was added to scene
    expect(result['test-space']['scene-with-skybox'].skybox).toBeDefined();
    expect(result['test-space']['scene-with-skybox'].skybox).toEqual({
      label: 'HDR Skybox',
      isSpherical: true,
      file: 'skybox.hdr'
    });
  });

  test('should handle complex scene with all components', async () => {
    mockQueryNodesAndEdges.mockResolvedValue({
      items: {
        scenes: [
          {
            externalId: 'complex-scene',
            space: 'test-space',
            properties: {
              scene: {
                'SceneConfiguration/v1': {
                  name: 'Complex Scene',
                  cameraTranslationX: 100,
                  cameraTranslationY: 200,
                  cameraTranslationZ: 300,
                  skybox: {
                    externalId: 'complex-skybox-hdr',
                    space: 'test-space'
                  }
                }
              }
            }
          }
        ],
        sceneModels: [
          {
            startNode: {
              externalId: 'complex-scene',
              space: 'test-space'
            },
            endNode: {
              externalId: 'cog_3d_model_456'
            },
            properties: {
              'SceneModels/v1': {
                'SceneModels/v1': {
                  revisionId: 2,
                  translationX: 50,
                  translationY: 100,
                  translationZ: 150
                }
              }
            }
          }
        ],
        scene360Collections: [
          {
            startNode: {
              externalId: 'complex-scene',
              space: 'test-space'
            },
            properties: {
              'Scene360ImageCollection/v1': {
                'Scene360ImageCollection/v1': {
                  image360CollectionExternalId: 'complex-images',
                  image360CollectionSpace: 'image-space',
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
        sceneGroundPlanes: [
          {
            externalId: 'complex-ground',
            space: 'test-space',
            properties: {
              'GroundPlane/v1': {
                'GroundPlane/v1': {
                  label: 'Complex Ground',
                  file: 'complex_ground.jpg'
                }
              }
            }
          }
        ],
        sceneGroundPlaneEdges: [
          {
            startNode: {
              externalId: 'complex-scene',
              space: 'test-space'
            },
            endNode: {
              externalId: 'complex-ground',
              space: 'test-space'
            },
            properties: {
              'Transformation3d/v1': {
                'Transformation3d/v1': {
                  translationX: 25,
                  translationY: 0,
                  translationZ: 25,
                  eulerRotationX: 0,
                  eulerRotationY: 45,
                  eulerRotationZ: 0,
                  scaleX: 2,
                  scaleY: 1,
                  scaleZ: 2
                }
              }
            }
          }
        ],
        sceneSkybox: [
          {
            externalId: 'complex-skybox-hdr',
            space: 'test-space',
            properties: {
              'EnvironmentMap/v1': {
                'EnvironmentMap/v1': {
                  label: 'Complex Skybox',
                  isSpherical: false,
                  file: 'complex_skybox.hdr'
                }
              }
            }
          }
        ]
      }
    });

    let capturedQueryFunction: QueryFunction<ScenesMap> | undefined;
    mockUseQuery.mockImplementation((options) => {
      capturedQueryFunction = options.queryFn;
      return createMockQueryResult({});
    });

    renderHook(() => Use3dScenesViewModel(mockProps), { wrapper });

    // Mock context for QueryFunction
    const mockContext = {
      client: new QueryClient(),
      queryKey: ['scenes', undefined],
      signal: new AbortController().signal,
      meta: undefined
    };

    assert(capturedQueryFunction !== undefined);
    const result = await capturedQueryFunction(mockContext);
    const complexScene = result['test-space']['complex-scene'];

    // Verify all components were processed
    expect(complexScene).toBeDefined();
    expect(complexScene.name).toBe('Complex Scene');
    expect(complexScene.modelOptions).toHaveLength(1);
    expect(complexScene.image360CollectionOptions).toHaveLength(1);
    expect(complexScene.groundPlanes).toHaveLength(1);
    expect(complexScene.skybox).toBeDefined();

    // Verify model processing
    const firstModel = complexScene.modelOptions[0];
    expect('modelId' in firstModel && firstModel.modelId).toBe(456);
    expect('revisionId' in firstModel && firstModel.revisionId).toBe(2);

    // Verify ground plane processing
    expect(complexScene.groundPlanes[0].label).toBe('Complex Ground');
    expect(complexScene.groundPlanes[0].translationX).toBe(25);

    // Verify skybox processing
    assert(complexScene.skybox !== undefined);
    expect(complexScene.skybox.label).toBe('Complex Skybox');
    expect(complexScene.skybox.isSpherical).toBe(false);
  });
});
