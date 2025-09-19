import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import { use3dScenesViewModel } from './use3dScenes.viewmodel';
import {
  type Use3dScenesViewModelDependencies,
  Use3dScenesViewModelContext
} from './use3dScenes.context';
import { type Use3dScenesViewModelProps, type ScenesMap } from './use3dScenes.types';
import { type SceneData } from './types';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { createMockQueryResult } from '#test-utils/fixtures/queryResult';

describe(use3dScenesViewModel.name, () => {
  const mockProps: Use3dScenesViewModelProps = {
    userSdk: undefined
  };

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

  const mockScenesMap: ScenesMap = {
    'test-space': {
      'test-scene-1': mockSceneData,
      'test-scene-2': { ...mockSceneData, name: 'Test Scene 2' }
    }
  };

  const mockUseSDK = vi.fn();
  const mockUseQuery = vi.fn();

  const mockDependencies: Use3dScenesViewModelDependencies = {
    useSDK: mockUseSDK,
    useQuery: mockUseQuery
  };

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <Use3dScenesViewModelContext.Provider value={mockDependencies}>
      {children}
    </Use3dScenesViewModelContext.Provider>
  );

  beforeEach(() => {
    mockUseSDK.mockReturnValue(sdkMock);
    mockUseQuery.mockReturnValue(createMockQueryResult(mockScenesMap));
  });

  test('should call useSDK with correct parameters', () => {
    renderHook(() => use3dScenesViewModel(mockProps), { wrapper });

    expect(mockUseSDK).toHaveBeenCalledWith(mockProps.userSdk);
  });

  test('should pass correct query parameters to useQuery', () => {
    renderHook(() => use3dScenesViewModel(mockProps), { wrapper });

    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ['reveal-react-components', 'cdf', '3d', 'scenes'],
      queryFn: expect.any(Function)
    });
  });

  test('should return successful query result', () => {
    const { result } = renderHook(() => use3dScenesViewModel(mockProps), { wrapper });

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

    renderHook(() => use3dScenesViewModel(customProps), { wrapper });

    expect(mockUseSDK).toHaveBeenCalledWith(customSdk);
  });
});
