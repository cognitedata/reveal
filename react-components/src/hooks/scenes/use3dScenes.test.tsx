import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import { use3dScenes, Use3dScenesProvider } from './use3dScenes';
import { use3dScenesViewModel } from './use3dScenes.viewmodel';
import {
  type Use3dScenesViewModelDependencies,
  Use3dScenesViewModelContext
} from './use3dScenes.context';
import { type Use3dScenesViewModelProps, type ScenesMap } from './use3dScenes.types';
import { type SceneData } from './types';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { createMockQueryResult } from '#test-utils/fixtures/queryResult';

describe('use3dScenes MVVM', () => {
  describe('use3dScenesViewModel', () => {
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
        'test-scene-2': mockSceneData
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

    test('should return scenes data when query is successful', () => {
      const { result } = renderHook(() => use3dScenesViewModel(mockProps), { wrapper });

      expect(result.current.data).toEqual(mockScenesMap);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    test('should call dependencies with correct parameters', () => {
      renderHook(() => use3dScenesViewModel(mockProps), { wrapper });

      expect(mockUseSDK).toHaveBeenCalledWith(mockProps.userSdk);
      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ['reveal-react-components', 'cdf', '3d', 'scenes'],
        queryFn: expect.any(Function)
      });
    });

    test('should pass custom SDK to dependencies', () => {
      const customSdk = sdkMock;
      const propsWithCustomSdk: Use3dScenesViewModelProps = {
        userSdk: customSdk
      };

      renderHook(() => use3dScenesViewModel(propsWithCustomSdk), { wrapper });

      expect(mockUseSDK).toHaveBeenCalledWith(customSdk);
    });
  });

  describe('use3dScenes (main hook)', () => {
    test('should return viewmodel result', () => {
      const mockUseSDK = vi.fn();
      const mockUseQuery = vi.fn();

      const mockDependencies: Use3dScenesViewModelDependencies = {
        useSDK: mockUseSDK,
        useQuery: mockUseQuery
      };

      const mockQueryResult = createMockQueryResult({});

      mockUseSDK.mockReturnValue(sdkMock);
      mockUseQuery.mockReturnValue(mockQueryResult);

      const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
        <Use3dScenesProvider dependencies={mockDependencies}>{children}</Use3dScenesProvider>
      );

      const { result } = renderHook(() => use3dScenes(sdkMock), { wrapper });

      expect(result.current.data).toBe(mockQueryResult.data);
      expect(result.current.isLoading).toBe(false);
    });

    test('should accept userSdk parameter', () => {
      const customSdk = sdkMock;
      const mockUseSDK = vi.fn();
      const mockUseQuery = vi.fn();

      const mockDependencies: Use3dScenesViewModelDependencies = {
        useSDK: mockUseSDK,
        useQuery: mockUseQuery
      };

      mockUseSDK.mockReturnValue(customSdk);
      mockUseQuery.mockReturnValue(createMockQueryResult({}));

      const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
        <Use3dScenesProvider dependencies={mockDependencies}>{children}</Use3dScenesProvider>
      );

      renderHook(() => use3dScenes(customSdk), { wrapper });

      expect(mockUseSDK).toHaveBeenCalledWith(customSdk);
    });
  });

  describe('Use3dScenesProvider', () => {
    test('should provide custom dependencies when specified', () => {
      const mockUseSDK = vi.fn();
      const mockUseQuery = vi.fn();

      const customDependencies: Use3dScenesViewModelDependencies = {
        useSDK: mockUseSDK,
        useQuery: mockUseQuery
      };

      mockUseSDK.mockReturnValue(sdkMock);
      mockUseQuery.mockReturnValue(createMockQueryResult({}));

      const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
        <Use3dScenesProvider dependencies={customDependencies}>{children}</Use3dScenesProvider>
      );

      const { result } = renderHook(() => use3dScenes(sdkMock), { wrapper });
      expect(result.current).toBeDefined();
      expect(result.current.isLoading).toBe(false);
    });
  });
});
