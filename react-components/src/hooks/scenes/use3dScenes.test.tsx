import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, assert } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import { Mock } from 'moq.ts';
import { type CogniteClient } from '@cognite/sdk';
import { type QueryFunction } from '@tanstack/react-query';
import { type SceneNode, type ScenesMap } from './use3dScenes.types';
import { type FdmSDK } from '../../data-providers/FdmSDK';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { createMockQueryContext, createMockQueryResult } from '#test-utils/fixtures/queryResult';
import { Use3dScenesContext, type Use3dScenesDependencies } from './use3dScenes.context';
import { use3dScenes } from './use3dScenes';

describe(use3dScenes.name, () => {
  const mockUseSDK = vi.fn();
  const mockUseQuery = vi.fn();
  const mockCreateFdmSdk = vi.fn();
  const mockQueryNodesAndEdges = vi.fn();

  const mockFdmSdkInstance = new Mock<FdmSDK>()
    .setup((instance) => instance.queryNodesAndEdges)
    .returns(mockQueryNodesAndEdges)
    .object();

  const mockDependencies: Use3dScenesDependencies = {
    useSDK: mockUseSDK,
    useQuery: mockUseQuery,
    createFdmSdk: mockCreateFdmSdk
  };

  const mockContext = createMockQueryContext(['scenes', undefined]);

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <Use3dScenesContext.Provider value={mockDependencies}>{children}</Use3dScenesContext.Provider>
  );

  beforeEach(() => {
    mockUseSDK.mockReturnValue(sdkMock);
    mockUseQuery.mockReturnValue(createMockQueryResult({}));
    mockCreateFdmSdk.mockReturnValue(mockFdmSdkInstance);
  });

  test('should pass correct query parameters and call dependencies', () => {
    renderHook(() => use3dScenes(), { wrapper });

    expect(mockUseSDK).toHaveBeenCalledWith(undefined);
    expect(mockCreateFdmSdk).toHaveBeenCalledWith(sdkMock);
    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ['reveal-react-components', 'cdf', '3d', 'scenes'],
      queryFn: expect.any(Function)
    });
  });

  test('should use custom SDK when provided', () => {
    const customSdk = new Mock<CogniteClient>()
      .setup((sdk) => sdk.getBaseUrl)
      .returns(vi.fn().mockReturnValue('https://custom.cognitedata.com'))
      .object();

    mockUseSDK.mockReturnValueOnce(customSdk);
    renderHook(() => use3dScenes(customSdk), { wrapper });

    expect(mockUseSDK).toHaveBeenCalledWith(customSdk);
    expect(mockCreateFdmSdk).toHaveBeenCalledWith(customSdk);
  });

  test('should handle loading state', () => {
    mockUseQuery.mockReturnValue(createMockQueryResult(undefined, false, true));
    const { result } = renderHook(() => use3dScenes(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  test('should handle error state', () => {
    const testError = new Error('Test error');
    mockUseQuery.mockReturnValue(createMockQueryResult(undefined, false, false, true, testError));
    const { result } = renderHook(() => use3dScenes(), { wrapper });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toEqual(testError);
  });

  test('should return empty data when no scenes', () => {
    mockUseQuery.mockReturnValue(createMockQueryResult({}));
    const { result } = renderHook(() => use3dScenes(), { wrapper });

    expect(result.current.data).toEqual({});
  });

  test('should handle refetch functionality', () => {
    const mockRefetch = vi.fn();
    const resultWithRefetch = createMockQueryResult({});
    resultWithRefetch.refetch = mockRefetch;
    mockUseQuery.mockReturnValue(resultWithRefetch);

    const { result } = renderHook(() => use3dScenes(), { wrapper });
    expect(result.current.refetch).toBe(mockRefetch);
  });

  test('should execute complete scene processing with minimal data', async () => {
    setupMockResponse({
      scenes: [createSceneNode('test-scene-1', 'test-space')]
    });

    const result = await executeQueryFn();

    expect(result).toBeDefined();
    expect(result['test-space']).toBeDefined();
    expect(result['test-space']['test-scene-1']).toBeDefined();
    expect(result['test-space']['test-scene-1'].name).toBe('Scene test-scene-1');
  });

  test('should handle pagination', async () => {
    const createScenes = (count: number, start: number = 0): SceneNode[] =>
      Array.from({ length: count }, (_, i) => createSceneNode(`scene-${start + i}`, 'test-space'));

    mockQueryNodesAndEdges
      .mockResolvedValueOnce({
        items: {
          scenes: createScenes(100, 0),
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
          scenes: createScenes(50, 100),
          sceneModels: [],
          scene360Collections: [],
          sceneGroundPlanes: [],
          sceneGroundPlaneEdges: [],
          sceneSkybox: []
        },
        nextCursor: undefined
      });

    const result = await executeQueryFn();
    const allScenes = Object.values(result).flatMap((spaceScenes) => Object.values(spaceScenes));

    expect(allScenes).toHaveLength(150);
    expect(mockQueryNodesAndEdges).toHaveBeenCalledTimes(2);
  });

  test('should populate scene with models', async () => {
    setupMockResponse({
      scenes: [createSceneNode('scene-with-model', 'test-space')],
      sceneModels: [
        {
          startNode: { externalId: 'scene-with-model', space: 'test-space' },
          endNode: { externalId: 'cog_3d_model_123' },
          properties: {
            scene: {
              'RevisionProperties/v1': {
                revisionId: 1,
                translationX: 10,
                translationY: 20,
                translationZ: 30,
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
      ]
    });

    const result = await executeQueryFn();
    const scene = result['test-space']['scene-with-model'];

    expect(scene.modelOptions).toHaveLength(1);
    expect(scene.modelOptions[0]).toEqual({
      modelId: 123,
      revisionId: 1,
      transform: expect.any(Object)
    });
  });

  test('should populate scene with 360 images', async () => {
    setupMockResponse({
      scenes: [createSceneNode('scene-with-360', 'test-space')],
      scene360Collections: [
        {
          startNode: { externalId: 'scene-with-360', space: 'test-space' },
          properties: {
            scene: {
              'Image360CollectionProperties/v1': {
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
      ]
    });

    const result = await executeQueryFn();
    const scene = result['test-space']['scene-with-360'];

    expect(scene.image360CollectionOptions).toHaveLength(1);
    expect(scene.image360CollectionOptions[0]).toEqual({
      source: 'dm',
      externalId: 'image-collection-1',
      space: 'image-space',
      transform: expect.any(Object)
    });
  });

  test('should populate scene with ground planes', async () => {
    setupMockResponse({
      scenes: [createSceneNode('scene-with-groundplane', 'test-space')],
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
          startNode: { externalId: 'scene-with-groundplane', space: 'test-space' },
          endNode: { externalId: 'ground-plane-1', space: 'test-space' },
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
      ]
    });

    const result = await executeQueryFn();
    const scene = result['test-space']['scene-with-groundplane'];

    expect(scene.groundPlanes).toHaveLength(1);
    expect(scene.groundPlanes[0]).toMatchObject({
      label: 'Ground Plane 1',
      file: 'ground.jpg',
      translationX: 5,
      translationY: 0,
      translationZ: 5
    });
  });

  test('should handle skybox in scenes', async () => {
    setupMockResponse({
      scenes: [
        createSceneNode('scene-with-skybox', 'test-space', {
          properties: {
            scene: {
              'SceneConfiguration/v1': {
                name: 'Scene with Skybox',
                skybox: { externalId: 'skybox-hdr', space: 'test-space' }
              }
            }
          }
        })
      ],
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
    });

    const result = await executeQueryFn();
    const scene = result['test-space']['scene-with-skybox'];

    expect(scene.skybox).toEqual({
      label: 'HDR Skybox',
      isSpherical: true,
      file: 'skybox.hdr'
    });
  });

  test('should handle complex scene with all components', async () => {
    setupMockResponse({
      scenes: [
        createSceneNode('complex-scene', 'test-space', {
          properties: {
            scene: {
              'SceneConfiguration/v1': {
                name: 'Complex Scene',
                cameraTranslationX: 100,
                cameraTranslationY: 200,
                cameraTranslationZ: 300,
                skybox: { externalId: 'complex-skybox', space: 'test-space' }
              }
            }
          }
        })
      ],
      sceneModels: [
        {
          startNode: { externalId: 'complex-scene', space: 'test-space' },
          endNode: { externalId: 'cog_3d_model_456' },
          properties: {
            scene: {
              'RevisionProperties/v1': {
                revisionId: 2,
                translationX: 50,
                translationY: 100,
                translationZ: 150,
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
      scene360Collections: [
        {
          startNode: { externalId: 'complex-scene', space: 'test-space' },
          properties: {
            scene: {
              'Image360CollectionProperties/v1': {
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
          startNode: { externalId: 'complex-scene', space: 'test-space' },
          endNode: { externalId: 'complex-ground', space: 'test-space' },
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
          externalId: 'complex-skybox',
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
    });

    const result = await executeQueryFn();
    const scene = result['test-space']['complex-scene'];

    expect(scene).toBeDefined();
    expect(scene.name).toBe('Complex Scene');
    expect(scene.modelOptions).toHaveLength(1);
    expect(scene.image360CollectionOptions).toHaveLength(1);
    expect(scene.groundPlanes).toHaveLength(1);
    expect(scene.skybox).toBeDefined();

    const firstModel = scene.modelOptions[0];
    expect('modelId' in firstModel && firstModel.modelId).toBe(456);
    expect('revisionId' in firstModel && firstModel.revisionId).toBe(2);

    expect(scene.groundPlanes[0].label).toBe('Complex Ground');
    expect(scene.groundPlanes[0].translationX).toBe(25);

    assert(scene.skybox !== undefined);
    expect(scene.skybox.label).toBe('Complex Skybox');
    expect(scene.skybox.isSpherical).toBe(false);
  });

  const createSceneNode = (
    externalId: string,
    space: string,
    overrides?: Partial<SceneNode>
  ): SceneNode => ({
    externalId,
    space,
    createdTime: Date.now(),
    lastUpdatedTime: Date.now(),
    version: 1,
    instanceType: 'node',
    properties: {
      scene: {
        'SceneConfiguration/v1': {
          name: `Scene ${externalId}`,
          ...overrides?.properties?.scene?.['SceneConfiguration/v1']
        }
      }
    },
    ...overrides
  });

  const executeQueryFn = async (): Promise<ScenesMap> => {
    let capturedQueryFunction!: QueryFunction<ScenesMap>;
    mockUseQuery.mockImplementation((options) => {
      capturedQueryFunction = options.queryFn;
      return createMockQueryResult({});
    });

    renderHook(() => use3dScenes(), { wrapper });
    assert(capturedQueryFunction !== undefined);
    return await capturedQueryFunction(mockContext);
  };

  const setupMockResponse = (responseData: any): void => {
    mockQueryNodesAndEdges.mockResolvedValue({
      items: {
        scenes: [],
        sceneModels: [],
        scene360Collections: [],
        sceneGroundPlanes: [],
        sceneGroundPlaneEdges: [],
        sceneSkybox: [],
        ...responseData
      },
      nextCursor: undefined
    });
  };
});
