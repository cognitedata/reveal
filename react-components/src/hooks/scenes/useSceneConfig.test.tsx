import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, assert } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import { Mock, type IMock } from 'moq.ts';
import { type Scene } from '../../components/SceneContainer/sceneTypes';
import { type FdmSDK } from '../../data-providers/FdmSDK';
import { type SceneResponse } from '../../components/SceneContainer/SceneFdmTypes';
import { createMockQueryResult } from '#test-utils/fixtures/queryResult';
import { useSceneConfig } from './useSceneConfig';
import { type UseSceneConfigDependencies, UseSceneConfigContext } from './useSceneConfig.context';

describe(useSceneConfig.name, () => {
  const mockProps = {
    sceneExternalId: 'test-scene',
    sceneSpace: 'test-space'
  };

  let fdmSdkMock: IMock<FdmSDK>;
  const mockUseQuery = vi.fn();

  const mockDependencies: UseSceneConfigDependencies = {
    useFdmSdk: () => fdmSdkMock.object(),
    useQuery: mockUseQuery
  };

  // Default scene response
  const createDefaultSceneResponse = (): SceneResponse => ({
    items: {
      myScene: [
        {
          externalId: 'test-scene',
          space: 'test-space',
          version: 1,
          instanceType: 'node',
          properties: {
            scene: {
              'SceneConfiguration/v1': {
                name: 'Test Scene',
                cameraTranslationX: 0,
                cameraTranslationY: 0,
                cameraTranslationZ: 10,
                cameraEulerRotationX: 0,
                cameraEulerRotationY: 0,
                cameraEulerRotationZ: 0,
                cadBudget: 1000000,
                pointCloudBudget: 500000,
                maxRenderResolution: 1920,
                movingCameraResolutionFactor: 0.5,
                pointCloudPointSize: 2,
                pointCloudPointShape: 'Circle',
                pointCloudColor: 'Rgb'
              }
            }
          }
        }
      ],
      skybox: [],
      groundPlanes: [],
      groundPlaneEdges: [],
      sceneModels: [],
      image360CollectionsEdges: []
    }
  });

  // Mock functions for FdmSDK methods
  const mockGetViewsByIds = vi.fn();
  const mockQueryNodesAndEdges = vi.fn();

  const createDefaultFdmSdkMock = (): IMock<FdmSDK> => {
    // Setup mocks to return 5 views (views exist)
    mockGetViewsByIds.mockResolvedValue({ items: new Array(5) });
    mockQueryNodesAndEdges.mockResolvedValue(createDefaultSceneResponse());

    return new Mock<FdmSDK>()
      .setup((sdk) => sdk.getViewsByIds)
      .returns(mockGetViewsByIds)
      .setup((sdk) => sdk.queryNodesAndEdges)
      .returns(mockQueryNodesAndEdges);
  };

  const createViewsNotExistFdmSdkMock = (): IMock<FdmSDK> => {
    // Setup mocks to return empty array (views don't exist)
    mockGetViewsByIds.mockResolvedValue({ items: [] });

    return new Mock<FdmSDK>().setup((sdk) => sdk.getViewsByIds).returns(mockGetViewsByIds);
  };

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <UseSceneConfigContext.Provider value={mockDependencies}>
      {children}
    </UseSceneConfigContext.Provider>
  );

  beforeEach(() => {
    fdmSdkMock = createDefaultFdmSdkMock();
    mockUseQuery.mockReturnValue(createMockQueryResult(null));
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

  test('should return successful query result', () => {
    const mockScene: Scene = {
      sceneConfiguration: {
        name: 'Test Scene',
        cameraTranslationX: 0,
        cameraTranslationY: 0,
        cameraTranslationZ: 10,
        cameraEulerRotationX: 0,
        cameraEulerRotationY: 0,
        cameraEulerRotationZ: 0,
        qualitySettings: {
          cadBudget: 1000000,
          pointCloudBudget: 500000,
          maxRenderResolution: 1920,
          movingCameraResolutionFactor: 0.5,
          pointCloudPointSize: 2,
          pointCloudPointShape: 'Circle',
          pointCloudColor: 'Rgb'
        }
      },
      skybox: undefined,
      groundPlanes: [],
      sceneModels: [],
      image360Collections: []
    };

    mockUseQuery.mockReturnValue(createMockQueryResult(mockScene));

    const { result } = renderHook(
      () => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace),
      { wrapper }
    );

    expect(result.current.data).toEqual(mockScene);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  test('should disable query when any parameters are undefined', () => {
    const propsWithBothUndefined = {
      sceneExternalId: undefined,
      sceneSpace: undefined
    };

    renderHook(
      () =>
        useSceneConfig(propsWithBothUndefined.sceneExternalId, propsWithBothUndefined.sceneSpace),
      { wrapper }
    );

    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ['reveal', 'react-components', 'sync-scene-config', undefined, undefined],
      queryFn: expect.any(Function),
      enabled: false,
      staleTime: Infinity
    });
  });

  test('should handle loading state', () => {
    const loadingResult = createMockQueryResult(undefined, false, true);
    mockUseQuery.mockReturnValue(loadingResult);

    const { result } = renderHook(
      () => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  test('should handle error state', () => {
    const testError = new Error('Test error');
    const errorResult = createMockQueryResult(undefined, false, false, true, testError);
    mockUseQuery.mockReturnValue(errorResult);

    const { result } = renderHook(
      () => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace),
      { wrapper }
    );

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(testError);
  });

  test('should initialize FdmSDK before calling useQuery', () => {
    renderHook(() => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace), { wrapper });

    expect(mockUseQuery).toHaveBeenCalled();
    expect(fdmSdkMock.object()).toBeDefined();
  });

  test('should pass queryFunction to useQuery', () => {
    renderHook(() => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace), { wrapper });

    const callArgs = mockUseQuery.mock.calls[0][0];
    expect(callArgs).toHaveProperty('queryKey');
    expect(callArgs).toHaveProperty('queryFn');
    expect(typeof callArgs.queryFn).toBe('function');
  });

  test('should have correct query key structure', () => {
    renderHook(() => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace), { wrapper });

    const queryKey = mockUseQuery.mock.calls[0][0].queryKey;
    expect(queryKey).toEqual([
      'reveal',
      'react-components',
      'sync-scene-config',
      'test-scene',
      'test-space'
    ]);
  });

  test('should handle different scene configurations', () => {
    const customScene: Scene = {
      sceneConfiguration: {
        name: 'Custom Scene',
        cameraTranslationX: 10,
        cameraTranslationY: 20,
        cameraTranslationZ: 30,
        cameraEulerRotationX: 45,
        cameraEulerRotationY: 90,
        cameraEulerRotationZ: 180,
        cameraTargetX: 5,
        cameraTargetY: 10,
        cameraTargetZ: 15,
        qualitySettings: {
          cadBudget: 2000000,
          pointCloudBudget: 1000000,
          maxRenderResolution: 4096,
          movingCameraResolutionFactor: 0.8,
          pointCloudPointSize: 4,
          pointCloudPointShape: 'Square',
          pointCloudColor: 'Height'
        }
      },
      skybox: {
        label: 'Custom Skybox',
        isSpherical: true,
        file: 'custom_skybox.hdr'
      },
      groundPlanes: [
        {
          label: 'Ground Plane 1',
          file: 'ground.jpg',
          wrapping: 'repeat',
          repeatU: 2,
          repeatV: 3,
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
      sceneModels: [
        {
          modelIdentifier: {
            modelId: 123,
            revisionId: 456
          },
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
      image360Collections: [
        {
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
      ]
    };

    mockUseQuery.mockReturnValue(createMockQueryResult(customScene));

    const { result } = renderHook(
      () => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace),
      { wrapper }
    );

    expect(result.current.data).toEqual(customScene);
    assert(result.current.data !== null && result.current.data !== undefined);
    expect(result.current.data.sceneConfiguration.name).toBe('Custom Scene');
    expect(result.current.data.sceneModels).toHaveLength(1);
    expect(result.current.data.groundPlanes).toHaveLength(1);
    expect(result.current.data.image360Collections).toHaveLength(1);
    expect(result.current.data.skybox).toBeDefined();
  });

  test('should handle null scene data', () => {
    const nullResult = createMockQueryResult(null);
    mockUseQuery.mockReturnValue(nullResult);

    const { result } = renderHook(
      () => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace),
      { wrapper }
    );

    expect(result.current.data).toBeNull();
  });

  test('should handle context changes', () => {
    const customFdmSdkMock = createDefaultFdmSdkMock();
    const customUseQuery = vi.fn();

    const customDependencies: UseSceneConfigDependencies = {
      useFdmSdk: () => customFdmSdkMock.object(),
      useQuery: customUseQuery
    };

    customUseQuery.mockReturnValue(createMockQueryResult(null));

    const customWrapper = ({ children }: { children: ReactNode }): ReactElement => (
      <UseSceneConfigContext.Provider value={customDependencies}>
        {children}
      </UseSceneConfigContext.Provider>
    );

    renderHook(() => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace), {
      wrapper: customWrapper
    });

    expect(customFdmSdkMock.object()).toBeDefined();
    expect(customUseQuery).toHaveBeenCalled();
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

  test('should have infinite staleTime', () => {
    renderHook(() => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace), { wrapper });

    const callArgs = mockUseQuery.mock.calls[0][0];
    expect(callArgs.staleTime).toBe(Infinity);
  });

  test('should handle complex scene with all components', () => {
    const complexScene: Scene = {
      sceneConfiguration: {
        name: 'Complex Scene',
        cameraTranslationX: 100,
        cameraTranslationY: 200,
        cameraTranslationZ: 300,
        cameraEulerRotationX: 10,
        cameraEulerRotationY: 20,
        cameraEulerRotationZ: 30,
        cameraTargetX: 50,
        cameraTargetY: 100,
        cameraTargetZ: 150,
        updatedAt: '2023-12-01T10:00:00Z',
        qualitySettings: {
          cadBudget: 5000000,
          pointCloudBudget: 2500000,
          maxRenderResolution: 8192,
          movingCameraResolutionFactor: 0.9,
          pointCloudPointSize: 8,
          pointCloudPointShape: 'Circle',
          pointCloudColor: 'Rgb'
        }
      },
      skybox: {
        label: 'HDR Skybox',
        isSpherical: false,
        file: 'skybox.hdr'
      },
      groundPlanes: [
        {
          label: 'Main Ground',
          file: 'concrete.jpg',
          wrapping: 'clamp',
          repeatU: 4,
          repeatV: 4,
          translationX: 10,
          translationY: 0,
          translationZ: 10,
          eulerRotationX: 0,
          eulerRotationY: 45,
          eulerRotationZ: 0,
          scaleX: 2,
          scaleY: 1,
          scaleZ: 2
        },
        {
          label: 'Secondary Ground',
          file: 'grass.jpg',
          wrapping: 'repeat',
          repeatU: 1,
          repeatV: 1,
          translationX: -10,
          translationY: 0,
          translationZ: -10,
          eulerRotationX: 0,
          eulerRotationY: 0,
          eulerRotationZ: 0,
          scaleX: 1,
          scaleY: 1,
          scaleZ: 1
        }
      ],
      sceneModels: [
        {
          modelIdentifier: {
            modelId: 123,
            revisionId: 456
          },
          translationX: 0,
          translationY: 0,
          translationZ: 0,
          eulerRotationX: 0,
          eulerRotationY: 0,
          eulerRotationZ: 0,
          scaleX: 1,
          scaleY: 1,
          scaleZ: 1
        },
        {
          modelIdentifier: {
            revisionExternalId: 'dm-model-1',
            revisionSpace: 'dm-space'
          },
          translationX: 10,
          translationY: 20,
          translationZ: 30,
          eulerRotationX: 0,
          eulerRotationY: 45,
          eulerRotationZ: 0,
          scaleX: 2,
          scaleY: 1,
          scaleZ: 2
        }
      ],
      image360Collections: [
        {
          image360CollectionExternalId: 'panorama-collection-1',
          image360CollectionSpace: 'panorama-space',
          translationX: 0,
          translationY: 0,
          translationZ: 0,
          eulerRotationX: 0,
          eulerRotationY: 0,
          eulerRotationZ: 0,
          scaleX: 1,
          scaleY: 1,
          scaleZ: 1
        },
        {
          image360CollectionExternalId: 'panorama-collection-2',
          image360CollectionSpace: 'panorama-space',
          translationX: 5,
          translationY: 0,
          translationZ: 5,
          eulerRotationX: 0,
          eulerRotationY: 90,
          eulerRotationZ: 0,
          scaleX: 1,
          scaleY: 1,
          scaleZ: 1
        }
      ]
    };

    mockUseQuery.mockReturnValue(createMockQueryResult(complexScene));

    const { result } = renderHook(
      () => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace),
      { wrapper }
    );

    expect(result.current.data).toEqual(complexScene);
    assert(result.current.data !== null && result.current.data !== undefined);

    expect(result.current.data.sceneConfiguration.name).toBe('Complex Scene');
    expect(result.current.data.skybox?.label).toBe('HDR Skybox');
    expect(result.current.data.groundPlanes).toHaveLength(2);
    expect(result.current.data.sceneModels).toHaveLength(2);
    expect(result.current.data.image360Collections).toHaveLength(2);

    assert(result.current.data.sceneConfiguration.qualitySettings !== undefined);
    expect(result.current.data.sceneConfiguration.qualitySettings.cadBudget).toBe(5000000);
    expect(result.current.data.sceneConfiguration.qualitySettings.maxRenderResolution).toBe(8192);

    expect(result.current.data.groundPlanes[0].label).toBe('Main Ground');
    expect(result.current.data.groundPlanes[1].label).toBe('Secondary Ground');

    expect(result.current.data.sceneModels[0].modelIdentifier).toHaveProperty('modelId', 123);
    expect(result.current.data.sceneModels[1].modelIdentifier).toHaveProperty(
      'revisionExternalId',
      'dm-model-1'
    );
  });

  test('should handle scene with minimal configuration', () => {
    const minimalScene: Scene = {
      sceneConfiguration: {
        name: 'Minimal Scene',
        cameraTranslationX: 0,
        cameraTranslationY: 0,
        cameraTranslationZ: 0,
        cameraEulerRotationX: 0,
        cameraEulerRotationY: 0,
        cameraEulerRotationZ: 0,
        qualitySettings: {
          cadBudget: 0,
          pointCloudBudget: 0,
          maxRenderResolution: 0,
          movingCameraResolutionFactor: 0,
          pointCloudPointSize: 0,
          pointCloudPointShape: '',
          pointCloudColor: ''
        }
      },
      skybox: undefined,
      groundPlanes: [],
      sceneModels: [],
      image360Collections: []
    };

    mockUseQuery.mockReturnValue(createMockQueryResult(minimalScene));

    const { result } = renderHook(
      () => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace),
      { wrapper }
    );

    expect(result.current.data).toEqual(minimalScene);
    assert(result.current.data !== null && result.current.data !== undefined);
    expect(result.current.data.sceneConfiguration.name).toBe('Minimal Scene');
    expect(result.current.data.skybox).toBeUndefined();
    expect(result.current.data.groundPlanes).toHaveLength(0);
    expect(result.current.data.sceneModels).toHaveLength(0);
    expect(result.current.data.image360Collections).toHaveLength(0);
  });

  // Tests for actual query function execution to cover missing lines
  describe('QueryFunction execution coverage', () => {
    test('should return null when sceneExternalId is undefined', async () => {
      let capturedQueryFunction: any;
      mockUseQuery.mockImplementation((options) => {
        capturedQueryFunction = options.queryFn;
        return createMockQueryResult(null);
      });

      renderHook(() => useSceneConfig(undefined, 'test-space'), { wrapper });

      const result = await capturedQueryFunction();
      expect(result).toBeNull();
    });

    test('should return null when sceneSpace is undefined', async () => {
      let capturedQueryFunction: any;
      mockUseQuery.mockImplementation((options) => {
        capturedQueryFunction = options.queryFn;
        return createMockQueryResult(null);
      });

      renderHook(() => useSceneConfig('test-scene', undefined), { wrapper });

      const result = await capturedQueryFunction();
      expect(result).toBeNull();
    });

    test('should return DefaultScene when scene views do not exist', async () => {
      fdmSdkMock = createViewsNotExistFdmSdkMock();

      let capturedQueryFunction: any;
      mockUseQuery.mockImplementation((options) => {
        capturedQueryFunction = options.queryFn;
        return createMockQueryResult(null);
      });

      renderHook(() => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace), {
        wrapper
      });

      const result = await capturedQueryFunction();
      expect(result).toEqual({
        sceneConfiguration: {
          name: '',
          cameraTranslationX: 0,
          cameraTranslationY: 0,
          cameraTranslationZ: 0,
          cameraEulerRotationX: 0,
          cameraEulerRotationY: 0,
          cameraEulerRotationZ: 0,
          qualitySettings: {
            cadBudget: 0,
            pointCloudBudget: 0,
            maxRenderResolution: 0,
            movingCameraResolutionFactor: 0,
            pointCloudPointSize: 0,
            pointCloudPointShape: '',
            pointCloudColor: ''
          }
        },
        skybox: undefined,
        groundPlanes: [],
        sceneModels: [],
        image360Collections: []
      });
    });

    test('should execute complete scene processing with minimal data', async () => {
      let capturedQueryFunction: any;
      mockUseQuery.mockImplementation((options) => {
        capturedQueryFunction = options.queryFn;
        return createMockQueryResult(null);
      });

      renderHook(() => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace), {
        wrapper
      });

      // Mock context for QueryFunction
      const mockContext = {
        queryKey: ['scenes', mockProps.sceneExternalId, mockProps.sceneSpace],
        signal: new AbortController().signal,
        meta: undefined
      };

      const result = await capturedQueryFunction(mockContext);
      expect(result).toBeDefined();
      expect(result?.sceneConfiguration.name).toBe('Test Scene');
      expect(result?.skybox).toBeUndefined();
      expect(result?.groundPlanes).toHaveLength(0);
      expect(result?.sceneModels).toHaveLength(0);
      expect(result?.image360Collections).toHaveLength(0);
    });
  });
});
