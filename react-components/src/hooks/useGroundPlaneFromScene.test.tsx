import { Mock } from 'moq.ts';
import {
  type GroundPlane,
  type Scene,
  type SceneConfiguration
} from '../components/SceneContainer/sceneTypes';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGroundPlaneFromScene } from './useGroundPlaneFromScene';
import {
  GroundPlaneFromSceneContext,
  type GroundPlaneFromSceneDependencies
} from './useGroundPlaneFromScene.context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactElement, type ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { type CogniteClient } from '@cognite/sdk';
import { RepeatWrapping, type Texture, TextureLoader } from 'three';
import { type Cognite3DViewer, type DataSourceType } from '@cognite/reveal';

describe(useGroundPlaneFromScene.name, () => {
  const queryClient = new QueryClient();

  const groundPlaneTextureMock = new Mock<Texture>()
    .setup((texture) => texture.dispose)
    .returns(vi.fn())
    .setup((texture) => texture.repeat)
    .returns(
      new Mock<Texture['repeat']>()
        .setup((repeat) => repeat.set)
        .returns(vi.fn())
        .object()
    )
    .setup((texture) => texture.wrapS)
    .returns(1001)
    .setup((texture) => texture.wrapT)
    .returns(1001)
    .object();

  const groundPlane: GroundPlane = {
    file: 'test-file',
    label: 'test-label',
    wrapping: 'wrapping',
    repeatU: 800,
    repeatV: 800,
    translationX: 1,
    translationY: 1,
    translationZ: 1,
    eulerRotationX: 0,
    eulerRotationY: 0,
    eulerRotationZ: 0,
    scaleX: 1,
    scaleY: 0.05,
    scaleZ: 1
  };

  const groundPlaneRepeat: GroundPlane = {
    ...groundPlane,
    wrapping: 'repeat'
  };

  const oldUpdatedAt = '2024-08-01T10:44:00.000Z';
  const newUpdatedAt = '2025-08-01T10:44:00.000Z';

  const groundPlaneScaleFactor = 10000;

  const mockAddCustomObject = vi.fn();

  const mockViewer = new Mock<Cognite3DViewer<DataSourceType>>()
    .setup((viewer) => viewer.addCustomObject)
    .returns(mockAddCustomObject)
    .setup((viewer) => viewer.removeCustomObject)
    .returns(vi.fn())
    .object();

  const mockSDK = vi.fn<GroundPlaneFromSceneDependencies['useSDK']>();
  const mockSceneConfig = vi.fn<GroundPlaneFromSceneDependencies['useSceneConfig']>();
  const mockReveal = vi.fn<GroundPlaneFromSceneDependencies['useReveal']>();

  const defaultDependencies: GroundPlaneFromSceneDependencies = {
    useSceneConfig: mockSceneConfig,
    useReveal: mockReveal,
    useSDK: mockSDK
  };

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <QueryClientProvider client={queryClient}>
      <GroundPlaneFromSceneContext.Provider value={defaultDependencies}>
        {children}
      </GroundPlaneFromSceneContext.Provider>
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient.clear();
    vi.resetAllMocks();
  });

  it('should create and add custom object with correct properties for old scale format', async () => {
    const sceneMock = createSceneMockWithGroundPlane([groundPlane], oldUpdatedAt);
    mockSceneConfig.mockReturnValue(sceneMock);
    mockSDK.mockReturnValue(createSDKMock());
    mockReveal.mockReturnValue(mockViewer);

    vi.spyOn(TextureLoader.prototype, 'loadAsync').mockResolvedValue(groundPlaneTextureMock);

    renderHook(
      () => {
        useGroundPlaneFromScene('test-id', 'test-space-id');
      },
      { wrapper }
    );

    await waitFor(() => {
      expect(mockAddCustomObject).toHaveBeenCalled();
    });

    const expectedWidth = groundPlane.scaleX * groundPlaneScaleFactor;
    const expectedHeight = groundPlane.scaleY * groundPlaneScaleFactor;
    const callArgs = mockAddCustomObject.mock.calls[0][0];

    expect(callArgs.object.position).toMatchObject({ x: 1, y: 1, z: -1 });
    expect(callArgs.object.rotation).toMatchObject({ _x: expect.any(Number), _y: 0, _z: -0 });
    expect(callArgs.object.geometry.parameters).toMatchObject({
      width: expectedWidth,
      height: expectedHeight
    });
  });

  it('should create and add custom object with correct properties for old scale format if lastUpdatedAt undefined', async () => {
    const sceneMock = createSceneMockWithGroundPlane([groundPlane], undefined);
    mockSceneConfig.mockReturnValue(sceneMock);
    mockSDK.mockReturnValue(createSDKMock());
    mockReveal.mockReturnValue(mockViewer);

    vi.spyOn(TextureLoader.prototype, 'loadAsync').mockResolvedValue(groundPlaneTextureMock);

    renderHook(
      () => {
        useGroundPlaneFromScene('test-id', 'test-space-id');
      },
      { wrapper }
    );

    await waitFor(() => {
      expect(mockAddCustomObject).toHaveBeenCalled();
    });

    const expectedWidth = groundPlane.scaleX * groundPlaneScaleFactor;
    const expectedHeight = groundPlane.scaleY * groundPlaneScaleFactor;
    const callArgs = mockAddCustomObject.mock.calls[0][0];

    expect(callArgs.object.position).toMatchObject({ x: 1, y: 1, z: -1 });
    expect(callArgs.object.rotation).toMatchObject({ _x: expect.any(Number), _y: 0, _z: -0 });
    expect(callArgs.object.geometry.parameters).toMatchObject({
      width: expectedWidth,
      height: expectedHeight
    });
  });

  it('should create and add custom object with correct properties for new scale format', async () => {
    const sceneMock = createSceneMockWithGroundPlane([groundPlane], newUpdatedAt);
    mockSceneConfig.mockReturnValue(sceneMock);
    mockSDK.mockReturnValue(createSDKMock());
    mockReveal.mockReturnValue(mockViewer);

    vi.spyOn(TextureLoader.prototype, 'loadAsync').mockResolvedValue(groundPlaneTextureMock);

    renderHook(
      () => {
        useGroundPlaneFromScene('test-id', 'test-space-id');
      },
      { wrapper }
    );

    await waitFor(() => {
      expect(mockAddCustomObject).toHaveBeenCalled();
    });

    const expectedWidth = groundPlane.scaleX * groundPlaneScaleFactor;
    const expectedHeight = groundPlane.scaleZ * groundPlaneScaleFactor;
    const callArgs = mockAddCustomObject.mock.calls[0][0];

    expect(callArgs.object.position).toMatchObject({ x: 1, y: 1, z: -1 });
    expect(callArgs.object.rotation).toMatchObject({ _x: expect.any(Number), _y: 0, _z: -0 });
    expect(callArgs.object.geometry.parameters).toMatchObject({
      width: expectedWidth,
      height: expectedHeight
    });
  });

  it('should handle texture loading with repeat wrapping', async () => {
    const sceneMock = createSceneMockWithGroundPlane([groundPlaneRepeat], newUpdatedAt);
    mockSceneConfig.mockReturnValue(sceneMock);
    mockSDK.mockReturnValue(createSDKMock());
    mockReveal.mockReturnValue(mockViewer);

    const loadAsyncSpy = vi
      .spyOn(TextureLoader.prototype, 'loadAsync')
      .mockResolvedValue(groundPlaneTextureMock);

    renderHook(
      () => {
        useGroundPlaneFromScene('test-id', 'test-space-id');
      },
      { wrapper }
    );

    await waitFor(() => {
      expect(loadAsyncSpy).toHaveBeenCalled();
    });

    expect(groundPlaneTextureMock.repeat.set).toHaveBeenCalledWith(800, 800);
    expect(groundPlaneTextureMock.wrapS).toBe(RepeatWrapping);
    expect(groundPlaneTextureMock.wrapT).toBe(RepeatWrapping);
  });

  it('should skip object creation if ground plane is missing', () => {
    const sceneMock = createSceneMockWithGroundPlane([], oldUpdatedAt);
    mockSceneConfig.mockReturnValue(sceneMock);

    vi.spyOn(TextureLoader.prototype, 'loadAsync').mockResolvedValue(groundPlaneTextureMock);
    renderHook(
      () => {
        useGroundPlaneFromScene('test-id', 'test-space-id');
      },
      { wrapper }
    );

    expect(mockAddCustomObject).not.toHaveBeenCalled();
  });

  it('should show error if TextureLoader loadAsync rejected', async () => {
    const sceneMock = createSceneMockWithGroundPlane([groundPlane], oldUpdatedAt);
    mockSceneConfig.mockReturnValue(sceneMock);
    mockSDK.mockReturnValue(createSDKMock());
    mockReveal.mockReturnValue(mockViewer);

    vi.spyOn(TextureLoader.prototype, 'loadAsync').mockRejectedValue('Error');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderHook(
      () => {
        useGroundPlaneFromScene('test-id', 'test-space-id');
      },
      { wrapper }
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load groundplane texture');
    });
  });

  it('should cleanup custom objects on unmount', async () => {
    const sceneMock = createSceneMockWithGroundPlane([groundPlane], oldUpdatedAt);
    mockSceneConfig.mockReturnValue(sceneMock);
    mockSDK.mockReturnValue(createSDKMock());
    mockReveal.mockReturnValue(mockViewer);

    vi.spyOn(TextureLoader.prototype, 'loadAsync').mockResolvedValue(groundPlaneTextureMock);

    const { unmount } = renderHook(
      () => {
        useGroundPlaneFromScene('test-id', 'test-space-id');
      },
      {
        wrapper
      }
    );

    await waitFor(() => {
      expect(mockAddCustomObject).toHaveBeenCalled();
    });

    unmount();

    expect(mockViewer.removeCustomObject).toHaveBeenCalled();
    expect(groundPlaneTextureMock.dispose).toHaveBeenCalled();
  });
});

function createSceneMockWithGroundPlane(
  groundPlanes: GroundPlane[],
  updatedAt: string | undefined
): Scene {
  return new Mock<Scene>()
    .setup((s) => s.sceneConfiguration)
    .returns(
      new Mock<SceneConfiguration>()
        .setup((sc) => sc.name)
        .returns('Test Scene')
        .setup((sc) => sc.updatedAt)
        .returns(updatedAt)
        .object()
    )
    .setup((s) => s.groundPlanes)
    .returns(groundPlanes)
    .object();
}

function createSDKMock(): CogniteClient {
  return new Mock<CogniteClient>()
    .setup((sdk) => sdk.files)
    .returns(
      new Mock<CogniteClient['files']>()
        .setup((files) => files.getDownloadUrls)
        .returns(vi.fn().mockResolvedValue([{ downloadUrl: 'test-url', externalId: 'image-1' }]))
        .object()
    )
    .object();
}
