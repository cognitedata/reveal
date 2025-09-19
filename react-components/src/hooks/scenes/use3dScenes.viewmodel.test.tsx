import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, assert } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import { Use3dScenesViewModel } from './use3dScenes.viewmodel';
import {
  type Use3dScenesViewModelDependencies,
  Use3dScenesViewModelContext
} from './use3dScenes.viewmodel.context';
import { type Use3dScenesViewModelProps, type ScenesMap } from './use3dScenes.types';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { createMockQueryResult } from '#test-utils/fixtures/queryResult';

describe(Use3dScenesViewModel.name, () => {
  const mockProps: Use3dScenesViewModelProps = {
    userSdk: undefined
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
    mockUseQuery.mockReturnValue(createMockQueryResult({}));
    sdkMock.getBaseUrl = vi.fn().mockReturnValue('https://test.cognitedata.com');
  });

  test('should call useSDK with correct parameters', () => {
    renderHook(() => Use3dScenesViewModel(mockProps), { wrapper });

    expect(mockUseSDK).toHaveBeenCalledWith(mockProps.userSdk);
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

  test('should call useSDK before creating FdmSDK', () => {
    renderHook(() => Use3dScenesViewModel(mockProps), { wrapper });

    expect(mockUseSDK).toHaveBeenCalledBefore(mockUseQuery);
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

    const customDependencies: Use3dScenesViewModelDependencies = {
      useSDK: customUseSDK,
      useQuery: customUseQuery
    };

    customUseSDK.mockReturnValue(sdkMock);
    customUseQuery.mockReturnValue(createMockQueryResult({}));

    const customWrapper = ({ children }: { children: ReactNode }): ReactElement => (
      <Use3dScenesViewModelContext.Provider value={customDependencies}>
        {children}
      </Use3dScenesViewModelContext.Provider>
    );

    renderHook(() => Use3dScenesViewModel(mockProps), { wrapper: customWrapper });

    expect(customUseSDK).toHaveBeenCalledWith(mockProps.userSdk);
    expect(customUseQuery).toHaveBeenCalled();
  });

  test('should handle refetch functionality', () => {
    const mockRefetch = vi.fn();
    const resultWithRefetch = createMockQueryResult({});
    resultWithRefetch.refetch = mockRefetch;

    mockUseQuery.mockReturnValue(resultWithRefetch);

    const { result } = renderHook(() => Use3dScenesViewModel(mockProps), { wrapper });

    expect(result.current.refetch).toBe(mockRefetch);
  });
});
