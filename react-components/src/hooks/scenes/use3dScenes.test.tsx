import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import { use3dScenes } from './use3dScenes';
import { type Use3dScenesViewDependencies, Use3dScenesViewContext } from './use3dScenes.context';
import { type SceneData } from './types';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { createMockQueryResult } from '#test-utils/fixtures/queryResult';

describe(use3dScenes.name, () => {
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
        revisionId: 1
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

  const mockScenesMap = {
    'test-space': {
      'test-scene-1': mockSceneData,
      'test-scene-2': mockSceneData
    }
  };

  const mockUse3dScenesViewModel = vi.fn();

  const mockViewDependencies: Use3dScenesViewDependencies = {
    Use3dScenesViewModel: mockUse3dScenesViewModel
  };

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <Use3dScenesViewContext.Provider value={mockViewDependencies}>
      {children}
    </Use3dScenesViewContext.Provider>
  );

  beforeEach(() => {
    mockUse3dScenesViewModel.mockReturnValue(createMockQueryResult(mockScenesMap));
  });

  test('should call Use3dScenesViewModel with correct parameters', () => {
    renderHook(() => use3dScenes(), { wrapper });

    expect(mockUse3dScenesViewModel).toHaveBeenCalledWith({ userSdk: undefined });
  });

  test('should call Use3dScenesViewModel with custom SDK', () => {
    const customSdk = sdkMock;

    renderHook(() => use3dScenes(customSdk), { wrapper });

    expect(mockUse3dScenesViewModel).toHaveBeenCalledWith({ userSdk: customSdk });
  });

  test('should return viewmodel result', () => {
    const mockResult = createMockQueryResult(mockScenesMap);
    mockUse3dScenesViewModel.mockReturnValue(mockResult);

    const { result } = renderHook(() => use3dScenes(), { wrapper });

    expect(result.current.data).toBe(mockResult.data);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  test('should return loading state from viewmodel', () => {
    const loadingResult = createMockQueryResult(undefined, false, true);
    mockUse3dScenesViewModel.mockReturnValue(loadingResult);

    const { result } = renderHook(() => use3dScenes(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  test('should return error state from viewmodel', () => {
    const testError = new Error('Test error');
    const errorResult = createMockQueryResult(undefined, false, false, true, testError);
    mockUse3dScenesViewModel.mockReturnValue(errorResult);

    const { result } = renderHook(() => use3dScenes(), { wrapper });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(testError);
  });

  test('should use context to get Use3dScenesViewModel', () => {
    const mockResult = createMockQueryResult(mockScenesMap);
    const customViewModel = vi.fn();
    customViewModel.mockReturnValue(mockResult);

    const customViewDependencies: Use3dScenesViewDependencies = {
      Use3dScenesViewModel: customViewModel
    };

    const customWrapper = ({ children }: { children: ReactNode }): ReactElement => (
      <Use3dScenesViewContext.Provider value={customViewDependencies}>
        {children}
      </Use3dScenesViewContext.Provider>
    );

    const { result } = renderHook(() => use3dScenes(), { wrapper: customWrapper });

    expect(customViewModel).toHaveBeenCalledWith({ userSdk: undefined });
    expect(result.current.data).toBe(mockResult.data);
  });
});
