import { describe, expect, test, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { useCameraNavigation } from '../../../src/hooks/useCameraNavigation';
import { viewerMock, viewerModelsMock } from '../fixtures/viewer';
import { cadMock, nodeBoundingBox } from '../fixtures/cadModel';
import { act, renderHook } from '@testing-library/react';
import { fdmNodeCacheContentMock } from '../fixtures/fdmNodeCache';
import { Vector3 } from 'three';
import { renderTargetMock } from '../fixtures/renderTarget';

vi.mock('../../../src/components/RevealCanvas/ViewerContext', () => ({
  useReveal: () => viewerMock,
  useRenderTarget: () => renderTargetMock
}));

vi.mock('../../../src/components/CacheProvider/NodeCacheProvider', () => ({
  useFdmNodeCache: () => fdmNodeCacheContentMock
}));

describe('useCameraNavigation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    viewerMock.cameraManager.setCameraState = vi.fn();
    viewerMock.cameraManager.fitCameraToBoundingBox = vi.fn();
  });

  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test('fitCameraToVisualSceneBoundingBox calls viewer method', () => {
    const { result } = renderHook(() => useCameraNavigation());

    act(() => {
      result.current.fitCameraToVisualSceneBoundingBox(1000);
    });

    expect(viewerMock.fitCameraToVisualSceneBoundingBox).toHaveBeenCalledWith(1000);
  });

  test('fitCameraToAllModels calls viewer method with models', () => {
    const mockModels = [cadMock, cadMock];
    viewerModelsMock.mockReturnValue(mockModels);

    const { result } = renderHook(() => useCameraNavigation());

    act(() => {
      result.current.fitCameraToAllModels(1000);
    });

    expect(viewerMock.fitCameraToModels).toHaveBeenCalledWith(mockModels, 1000, true);
  });

  test('fitCameraToModelNodes calls viewer method with bounding box', async () => {
    const mockModels = [cadMock, cadMock];
    viewerModelsMock.mockReturnValue(mockModels);

    const { result } = renderHook(() => useCameraNavigation());
    const fitCameraToModelNodesSpy = vi.spyOn(result.current, 'fitCameraToModelNodes');

    await act(async () => {
      await result.current.fitCameraToModelNodes(456, [1, 2]);
    });

    expect(fitCameraToModelNodesSpy).toHaveBeenCalledWith(456, [1, 2]);

    expect(viewerMock.cameraManager.fitCameraToBoundingBox).toHaveBeenCalledWith(nodeBoundingBox);
  });

  test('fitCameraToModelNode calls fitCameraToModelNodes with single node', async () => {
    const mockModels = [cadMock, cadMock];
    viewerModelsMock.mockReturnValue(mockModels);

    const { result } = renderHook(() => useCameraNavigation());
    const fitCameraToModelNodeSpy = vi.spyOn(result.current, 'fitCameraToModelNode');

    await act(async () => {
      await result.current.fitCameraToModelNode(456, 1);
    });

    expect(fitCameraToModelNodeSpy).toHaveBeenCalledWith(456, 1);
  });

  test('fitCameraToInstances calls fitCameraToModelNodes with node ids', async () => {
    const mockModels = [cadMock, cadMock];
    viewerModelsMock.mockReturnValue(mockModels);
    const mockMappings = {
      revisionId: 456,
      mappings: new Map([['model1', [{ id: 1 }, { id: 2 }]]])
    };

    fdmNodeCacheContentMock.getMappingsForFdmInstances = vi.fn().mockResolvedValue([mockMappings]);

    const { result } = renderHook(() => useCameraNavigation());

    await act(async () => {
      await result.current.fitCameraToInstances([{ externalId: 'ext1', space: 'space1' }]);
    });

    expect(viewerMock.cameraManager.fitCameraToBoundingBox).toHaveBeenCalled();
  });

  test('fitCameraToInstance calls fitCameraToInstances with single instance', async () => {
    const mockModels = [cadMock, cadMock];
    const mockMappings = {
      revisionId: 456,
      mappings: new Map([['model1', [{ id: 1 }]]])
    };
    viewerModelsMock.mockReturnValue(mockModels);

    fdmNodeCacheContentMock.getMappingsForFdmInstances = vi.fn().mockResolvedValue([mockMappings]);

    const { result } = renderHook(() => useCameraNavigation());

    await act(async () => {
      await result.current.fitCameraToInstance('ext1', 'space1');
    });

    expect(viewerMock.cameraManager.fitCameraToBoundingBox).toHaveBeenCalled();
  });

  test('fitCameraToState calls viewer method with camera state', () => {
    const mockCameraState = {
      position: new Vector3(0, 0, 0),
      target: new Vector3(1, 1, 1)
    };

    const { result } = renderHook(() => useCameraNavigation());

    act(() => {
      result.current.fitCameraToState(mockCameraState);
    });

    expect(viewerMock.cameraManager.setCameraState).toHaveBeenCalledWith(mockCameraState);
  });
});
