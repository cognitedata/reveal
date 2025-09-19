import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import { useSceneConfig } from './useSceneConfig';
import {
  type UseSceneConfigViewDependencies,
  UseSceneConfigViewContext
} from './useSceneConfig.context';
import { type Scene } from '../../components/SceneContainer/sceneTypes';
import { createMockQueryResult } from '#test-utils/fixtures/queryResult';

describe(useSceneConfig.name, () => {
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

  const mockUseSceneConfigViewModel = vi.fn();

  const mockViewDependencies: UseSceneConfigViewDependencies = {
    UseSceneConfigViewModel: mockUseSceneConfigViewModel
  };

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <UseSceneConfigViewContext.Provider value={mockViewDependencies}>
      {children}
    </UseSceneConfigViewContext.Provider>
  );

  beforeEach(() => {
    mockUseSceneConfigViewModel.mockReturnValue(createMockQueryResult(mockScene));
  });

  test('should call UseSceneConfigViewModel with correct parameters', () => {
    renderHook(() => useSceneConfig('test-scene', 'test-space'), { wrapper });

    expect(mockUseSceneConfigViewModel).toHaveBeenCalledWith({
      sceneExternalId: 'test-scene',
      sceneSpace: 'test-space'
    });
  });

  test('should call UseSceneConfigViewModel with undefined parameters', () => {
    renderHook(() => useSceneConfig(undefined, undefined), { wrapper });

    expect(mockUseSceneConfigViewModel).toHaveBeenCalledWith({
      sceneExternalId: undefined,
      sceneSpace: undefined
    });
  });

  test('should return viewmodel result', () => {
    const mockResult = createMockQueryResult(mockScene);
    mockUseSceneConfigViewModel.mockReturnValue(mockResult);

    const { result } = renderHook(() => useSceneConfig('test-scene', 'test-space'), { wrapper });

    expect(result.current.data).toBe(mockResult.data);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  test('should return loading state from viewmodel', () => {
    const loadingResult = createMockQueryResult(undefined, false, true);
    mockUseSceneConfigViewModel.mockReturnValue(loadingResult);

    const { result } = renderHook(() => useSceneConfig('test-scene', 'test-space'), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  test('should return error state from viewmodel', () => {
    const testError = new Error('Test error');
    const errorResult = createMockQueryResult(undefined, false, false, true, testError);
    mockUseSceneConfigViewModel.mockReturnValue(errorResult);

    const { result } = renderHook(() => useSceneConfig('test-scene', 'test-space'), { wrapper });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(testError);
  });

  test('should use context to get UseSceneConfigViewModel', () => {
    const mockResult = createMockQueryResult(mockScene);
    const customViewModel = vi.fn();
    customViewModel.mockReturnValue(mockResult);

    const customViewDependencies: UseSceneConfigViewDependencies = {
      UseSceneConfigViewModel: customViewModel
    };

    const customWrapper = ({ children }: { children: ReactNode }): ReactElement => (
      <UseSceneConfigViewContext.Provider value={customViewDependencies}>
        {children}
      </UseSceneConfigViewContext.Provider>
    );

    const { result } = renderHook(() => useSceneConfig('custom-scene', 'custom-space'), {
      wrapper: customWrapper
    });

    expect(customViewModel).toHaveBeenCalledWith({
      sceneExternalId: 'custom-scene',
      sceneSpace: 'custom-space'
    });
    expect(result.current.data).toBe(mockResult.data);
  });

  test('should handle null scene data', () => {
    const nullResult = createMockQueryResult(null);
    mockUseSceneConfigViewModel.mockReturnValue(nullResult);

    const { result } = renderHook(() => useSceneConfig('test-scene', 'test-space'), { wrapper });

    expect(result.current.data).toBeNull();
  });

  test('should handle complex scene data', () => {
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
        qualitySettings: {
          cadBudget: 5000000,
          pointCloudBudget: 2500000,
          maxRenderResolution: 8192,
          movingCameraResolutionFactor: 0.9,
          pointCloudPointSize: 8,
          pointCloudPointShape: 'circle',
          pointCloudColor: 'height'
        }
      },
      skybox: {
        label: 'HDR Skybox',
        isSpherical: true,
        file: 'skybox.hdr'
      },
      groundPlanes: [
        {
          label: 'Ground',
          file: 'ground.jpg',
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
          image360CollectionExternalId: 'image-collection',
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

    const complexResult = createMockQueryResult(complexScene);
    mockUseSceneConfigViewModel.mockReturnValue(complexResult);

    const { result } = renderHook(() => useSceneConfig('complex-scene', 'complex-space'), {
      wrapper
    });

    expect(result.current.data).toEqual(complexScene);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  test('should handle partial scene external ID', () => {
    renderHook(() => useSceneConfig('partial-scene', undefined), { wrapper });

    expect(mockUseSceneConfigViewModel).toHaveBeenCalledWith({
      sceneExternalId: 'partial-scene',
      sceneSpace: undefined
    });
  });

  test('should handle partial scene space', () => {
    renderHook(() => useSceneConfig(undefined, 'partial-space'), { wrapper });

    expect(mockUseSceneConfigViewModel).toHaveBeenCalledWith({
      sceneExternalId: undefined,
      sceneSpace: 'partial-space'
    });
  });

  test('should maintain query state consistency', () => {
    const consistentResult = createMockQueryResult(mockScene);
    Object.assign(consistentResult, {
      isLoading: false,
      isError: false,
      isSuccess: true
    });
    mockUseSceneConfigViewModel.mockReturnValue(consistentResult);

    const { result } = renderHook(() => useSceneConfig('test-scene', 'test-space'), { wrapper });

    expect(result.current.data).toBe(mockScene);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(true);
  });
});
