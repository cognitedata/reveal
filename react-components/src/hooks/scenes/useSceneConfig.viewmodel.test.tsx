import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, assert } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import { UseSceneConfigViewModel } from './useSceneConfig.viewmodel';
import {
  type UseSceneConfigViewModelDependencies,
  UseSceneConfigViewModelContext
} from './useSceneConfig.viewmodel.context';
import { type UseSceneConfigViewModelProps } from './useSceneConfig.types';
import { type Scene } from '../../components/SceneContainer/sceneTypes';
import { createMockQueryResult } from '#test-utils/fixtures/queryResult';

describe(UseSceneConfigViewModel.name, () => {
  const mockProps: UseSceneConfigViewModelProps = {
    sceneExternalId: 'test-scene',
    sceneSpace: 'test-space'
  };

  const mockUseFdmSdk = vi.fn();
  const mockUseQuery = vi.fn();

  const mockDependencies: UseSceneConfigViewModelDependencies = {
    useFdmSdk: mockUseFdmSdk,
    useQuery: mockUseQuery
  };

  const mockFdmSdk = {
    queryNodesAndEdges: vi.fn()
  };

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <UseSceneConfigViewModelContext.Provider value={mockDependencies}>
      {children}
    </UseSceneConfigViewModelContext.Provider>
  );

  beforeEach(() => {
    mockUseFdmSdk.mockReturnValue(mockFdmSdk);
    mockUseQuery.mockReturnValue(createMockQueryResult(null));
  });

  test('should call useFdmSdk', () => {
    renderHook(() => UseSceneConfigViewModel(mockProps), { wrapper });

    expect(mockUseFdmSdk).toHaveBeenCalled();
  });

  test('should pass correct query parameters to useQuery', () => {
    renderHook(() => UseSceneConfigViewModel(mockProps), { wrapper });

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
          pointCloudPointShape: 'circle',
          pointCloudColor: 'rgb'
        }
      },
      skybox: undefined,
      groundPlanes: [],
      sceneModels: [],
      image360Collections: []
    };

    mockUseQuery.mockReturnValue(createMockQueryResult(mockScene));

    const { result } = renderHook(() => UseSceneConfigViewModel(mockProps), { wrapper });

    expect(result.current.data).toEqual(mockScene);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  test('should disable query when sceneExternalId is undefined', () => {
    const propsWithUndefinedExternalId: UseSceneConfigViewModelProps = {
      sceneExternalId: undefined,
      sceneSpace: 'test-space'
    };

    renderHook(() => UseSceneConfigViewModel(propsWithUndefinedExternalId), { wrapper });

    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ['reveal', 'react-components', 'sync-scene-config', undefined, 'test-space'],
      queryFn: expect.any(Function),
      enabled: false,
      staleTime: Infinity
    });
  });

  test('should disable query when sceneSpace is undefined', () => {
    const propsWithUndefinedSpace: UseSceneConfigViewModelProps = {
      sceneExternalId: 'test-scene',
      sceneSpace: undefined
    };

    renderHook(() => UseSceneConfigViewModel(propsWithUndefinedSpace), { wrapper });

    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ['reveal', 'react-components', 'sync-scene-config', 'test-scene', undefined],
      queryFn: expect.any(Function),
      enabled: false,
      staleTime: Infinity
    });
  });

  test('should disable query when both parameters are undefined', () => {
    const propsWithBothUndefined: UseSceneConfigViewModelProps = {
      sceneExternalId: undefined,
      sceneSpace: undefined
    };

    renderHook(() => UseSceneConfigViewModel(propsWithBothUndefined), { wrapper });

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

    const { result } = renderHook(() => UseSceneConfigViewModel(mockProps), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  test('should handle error state', () => {
    const testError = new Error('Test error');
    const errorResult = createMockQueryResult(undefined, false, false, true, testError);
    mockUseQuery.mockReturnValue(errorResult);

    const { result } = renderHook(() => UseSceneConfigViewModel(mockProps), { wrapper });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(testError);
  });

  test('should create FdmSDK instance correctly', () => {
    renderHook(() => UseSceneConfigViewModel(mockProps), { wrapper });

    expect(mockUseFdmSdk).toHaveBeenCalled();
  });

  test('should call useFdmSdk before useQuery', () => {
    renderHook(() => UseSceneConfigViewModel(mockProps), { wrapper });

    expect(mockUseFdmSdk).toHaveBeenCalledBefore(mockUseQuery);
  });

  test('should pass queryFunction to useQuery', () => {
    renderHook(() => UseSceneConfigViewModel(mockProps), { wrapper });

    const callArgs = mockUseQuery.mock.calls[0][0];
    expect(callArgs).toHaveProperty('queryKey');
    expect(callArgs).toHaveProperty('queryFn');
    expect(typeof callArgs.queryFn).toBe('function');
  });

  test('should have correct query key structure', () => {
    renderHook(() => UseSceneConfigViewModel(mockProps), { wrapper });

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
          pointCloudPointShape: 'square',
          pointCloudColor: 'height'
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
            modelId: 123456,
            revisionId: 1
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

    const { result } = renderHook(() => UseSceneConfigViewModel(mockProps), { wrapper });

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

    const { result } = renderHook(() => UseSceneConfigViewModel(mockProps), { wrapper });

    expect(result.current.data).toBeNull();
  });

  test('should handle context changes', () => {
    const customUseFdmSdk = vi.fn();
    const customUseQuery = vi.fn();

    const customDependencies: UseSceneConfigViewModelDependencies = {
      useFdmSdk: customUseFdmSdk,
      useQuery: customUseQuery
    };

    customUseFdmSdk.mockReturnValue(mockFdmSdk);
    customUseQuery.mockReturnValue(createMockQueryResult(null));

    const customWrapper = ({ children }: { children: ReactNode }): ReactElement => (
      <UseSceneConfigViewModelContext.Provider value={customDependencies}>
        {children}
      </UseSceneConfigViewModelContext.Provider>
    );

    renderHook(() => UseSceneConfigViewModel(mockProps), { wrapper: customWrapper });

    expect(customUseFdmSdk).toHaveBeenCalled();
    expect(customUseQuery).toHaveBeenCalled();
  });

  test('should handle refetch functionality', () => {
    const mockRefetch = vi.fn();
    const resultWithRefetch = createMockQueryResult(null);
    resultWithRefetch.refetch = mockRefetch;

    mockUseQuery.mockReturnValue(resultWithRefetch);

    const { result } = renderHook(() => UseSceneConfigViewModel(mockProps), { wrapper });

    expect(result.current.refetch).toBe(mockRefetch);
  });

  test('should have infinite staleTime', () => {
    renderHook(() => UseSceneConfigViewModel(mockProps), { wrapper });

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
          pointCloudPointShape: 'circle',
          pointCloudColor: 'rgb'
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
            modelId: 111111,
            revisionId: 1
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

    const { result } = renderHook(() => UseSceneConfigViewModel(mockProps), { wrapper });

    expect(result.current.data).toEqual(complexScene);
    assert(result.current.data !== null && result.current.data !== undefined);

    // Verify all components are present
    expect(result.current.data.sceneConfiguration.name).toBe('Complex Scene');
    expect(result.current.data.skybox?.label).toBe('HDR Skybox');
    expect(result.current.data.groundPlanes).toHaveLength(2);
    expect(result.current.data.sceneModels).toHaveLength(2);
    expect(result.current.data.image360Collections).toHaveLength(2);

    // Verify quality settings
    assert(result.current.data.sceneConfiguration.qualitySettings !== undefined);
    expect(result.current.data.sceneConfiguration.qualitySettings.cadBudget).toBe(5000000);
    expect(result.current.data.sceneConfiguration.qualitySettings.maxRenderResolution).toBe(8192);

    // Verify ground planes
    expect(result.current.data.groundPlanes[0].label).toBe('Main Ground');
    expect(result.current.data.groundPlanes[1].label).toBe('Secondary Ground');

    // Verify models
    expect(result.current.data.sceneModels[0].modelIdentifier).toHaveProperty('modelId', 111111);
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

    const { result } = renderHook(() => UseSceneConfigViewModel(mockProps), { wrapper });

    expect(result.current.data).toEqual(minimalScene);
    assert(result.current.data !== null && result.current.data !== undefined);
    expect(result.current.data.sceneConfiguration.name).toBe('Minimal Scene');
    expect(result.current.data.skybox).toBeUndefined();
    expect(result.current.data.groundPlanes).toHaveLength(0);
    expect(result.current.data.sceneModels).toHaveLength(0);
    expect(result.current.data.image360Collections).toHaveLength(0);
  });
});
