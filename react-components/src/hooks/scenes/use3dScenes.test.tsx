import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, assert } from 'vitest';
import { type PropsWithChildren, type ReactElement } from 'react';
import { Mock } from 'moq.ts';
import { type QueryRequest, type CogniteClient } from '@cognite/sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type FdmSDK, type EdgeItem, type NodeItem } from '../../data-providers/FdmSDK';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { defaultUse3dScenesDependencies, Use3dScenesContext } from './use3dScenes.context';
import { use3dScenes } from './use3dScenes';
import {
  type Transformation3d,
  type SceneNode,
  type Use3dScenesQueryResult,
  type GroundPlaneProperties,
  type SkyboxProperties,
  type Cdf3dRevisionProperties,
  type Cdf3dImage360CollectionProperties,
  type Use3dScenesResult,
  type ScenesMap
} from './types';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import { type QueryResult } from '../../data-providers/utils/queryNodesAndEdges';
import { isClassicIdentifier } from '../../components';

describe(use3dScenes.name, () => {
  const MOCK_TIMESTAMP = 1696694400000; // 2023-10-07T12:00:00.000Z
  const TEST_SPACE = 'test-space';
  const EXPECTED_MATRIX_IDENTITY = [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1];
  const EXPECTED_MATRIX_WITH_TRANSLATION = [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 10, 30, -20, 1];

  const mockQueryNodesAndEdges = vi.fn<(request: QueryRequest) => Promise<QueryResult<any, any>>>();

  const mockFdmSdkInstance = new Mock<FdmSDK>()
    .setup((instance) => instance.queryNodesAndEdges)
    .returns(mockQueryNodesAndEdges)
    .object();

  const mockDependencies = getMocksByDefaultDependencies(defaultUse3dScenesDependencies);
  const queryClient = new QueryClient();

  type MockResponseData = Partial<Use3dScenesQueryResult>;

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <QueryClientProvider client={queryClient}>
      <Use3dScenesContext.Provider value={mockDependencies}>{children}</Use3dScenesContext.Provider>
    </QueryClientProvider>
  );

  beforeEach(() => {
    mockDependencies.useSDK.mockReturnValue(sdkMock);
    mockDependencies.createFdmSdk.mockReturnValue(mockFdmSdkInstance);
    queryClient.clear();
  });

  test('should pass correct query parameters and call dependencies', () => {
    renderHook(() => use3dScenes(), { wrapper });

    expect(mockDependencies.useSDK).toHaveBeenCalledWith(undefined);
    expect(mockDependencies.createFdmSdk).toHaveBeenCalledWith(sdkMock);
  });

  test('should use custom SDK when provided', () => {
    const customSdk = new Mock<CogniteClient>()
      .setup((sdk) => sdk.getBaseUrl)
      .returns(vi.fn().mockReturnValue('https://custom.cognitedata.com'))
      .object();

    mockDependencies.useSDK.mockReturnValueOnce(customSdk);
    renderHook(() => use3dScenes(customSdk), { wrapper });

    expect(mockDependencies.useSDK).toHaveBeenCalledWith(customSdk);
    expect(mockDependencies.createFdmSdk).toHaveBeenCalledWith(customSdk);
  });

  test('should handle loading state', () => {
    const { result } = renderHook(() => use3dScenes(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  test('should execute complete scene processing with minimal data', async () => {
    setupMockResponse({
      scenes: [createSceneNode('test-scene-1', 'test-space')]
    });

    const { result } = renderHook(() => use3dScenes(), { wrapper });
    const data = await waitForSuccessAndGetData(result);

    expect(data['test-space']['test-scene-1']).toBeDefined();
    expect(data['test-space']['test-scene-1'].name).toBe('Scene test-scene-1');
  });

  test('should handle pagination', async () => {
    const createScenes = (count: number, start: number = 0): SceneNode[] =>
      Array.from({ length: count }, (_, i) => createSceneNode(`scene-${start + i}`, 'test-space'));
    setupMockResponse({ scenes: createScenes(100, 0) }, 'cursor-token');
    setupMockResponse({ scenes: createScenes(50, 100) }, undefined);

    const { result } = renderHook(() => use3dScenes(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    assert(result.current.data !== undefined);

    expect(mockQueryNodesAndEdges).toHaveBeenCalledTimes(2);
    expect(result.current.data).toBeDefined();

    const allScenes = Object.values(result.current.data).flatMap((spaceScenes) =>
      Object.values(spaceScenes)
    );
    expect(allScenes).toHaveLength(150);
  });

  test('should process model edges and create 3d model options with correct transform matrix', async () => {
    setupMockResponse({
      scenes: [createSceneNode('scene-with-model', TEST_SPACE)],
      sceneModels: [
        createModelEdge('scene-with-model', TEST_SPACE, 'cog_3d_model_123', 'models', 1)
      ]
    });

    const { result } = renderHook(() => use3dScenes(), { wrapper });
    const data = await waitForSuccessAndGetData(result);
    const scene = data[TEST_SPACE]['scene-with-model'];

    expect(scene.modelOptions).toHaveLength(1);
    expect(scene.modelOptions[0]).toEqual({
      modelId: 123,
      revisionId: 1,
      transform: expect.objectContaining({
        elements: expect.arrayContaining(EXPECTED_MATRIX_WITH_TRANSLATION)
      })
    });
  });

  test('should process 360 image collection edges and create image360 options with transform', async () => {
    setupMockResponse({
      scenes: [createSceneNode('scene-with-360', TEST_SPACE)],
      scene360Collections: [
        create360Edge('scene-with-360', TEST_SPACE, 'image-collection-1', 'image-space')
      ]
    });

    const { result } = renderHook(() => use3dScenes(), { wrapper });
    const data = await waitForSuccessAndGetData(result);
    const scene = data[TEST_SPACE]['scene-with-360'];

    expect(scene.image360CollectionOptions).toHaveLength(1);
    expect(scene.image360CollectionOptions[0]).toEqual({
      source: 'dm',
      externalId: 'image-collection-1',
      space: 'image-space',
      transform: expect.objectContaining({
        elements: expect.arrayContaining(EXPECTED_MATRIX_IDENTITY)
      })
    });
  });

  test('should process ground plane nodes and edges to create ground plane options with transforms', async () => {
    setupMockResponse({
      scenes: [createSceneNode('scene-with-groundplane', 'test-space')],
      sceneGroundPlanes: [
        createGroundPlaneNode('ground-plane-1', 'test-space', 'Ground Plane 1', 'ground.jpg')
      ],
      sceneGroundPlaneEdges: [
        createGroundPlaneEdge(
          'scene-with-groundplane',
          'test-space',
          'ground-plane-1',
          'test-space',
          createDefaultTransformation({
            translationX: 5,
            translationZ: 5
          })
        )
      ]
    });

    const { result } = renderHook(() => use3dScenes(), { wrapper });
    const data = await waitForSuccessAndGetData(result);
    const scene = data['test-space']['scene-with-groundplane'];

    expect(scene.groundPlanes).toHaveLength(1);
    expect(scene.groundPlanes[0]).toMatchObject({
      label: 'Ground Plane 1',
      file: 'ground.jpg',
      translationX: 5,
      translationY: 0,
      translationZ: 5
    });
  });

  test('should resolve skybox references and attach skybox data to scenes', async () => {
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
      sceneSkybox: [createSkyboxNode('skybox-hdr', 'test-space', 'HDR Skybox', 'skybox.hdr', true)]
    });

    const { result } = renderHook(() => use3dScenes(), { wrapper });
    const data = await waitForSuccessAndGetData(result);
    const scene = data['test-space']['scene-with-skybox'];

    expect(scene.skybox).toEqual({
      label: 'HDR Skybox',
      isSpherical: true,
      file: 'skybox.hdr'
    });
  });

  test('should process scenes with all component types (3d models, 360 images, ground planes, skybox)', async () => {
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
        createModelEdge('complex-scene', 'test-space', 'cog_3d_model_456', 'models', 2)
      ],
      scene360Collections: [
        create360Edge('complex-scene', 'test-space', 'complex-images', 'image-space')
      ],
      sceneGroundPlanes: [
        createGroundPlaneNode(
          'complex-ground',
          'test-space',
          'Complex Ground',
          'complex_ground.jpg'
        )
      ],
      sceneGroundPlaneEdges: [
        createGroundPlaneEdge(
          'complex-scene',
          'test-space',
          'complex-ground',
          'test-space',
          createDefaultTransformation({
            translationX: 25,
            translationZ: 25,
            eulerRotationY: 45,
            scaleX: 2,
            scaleZ: 2
          })
        )
      ],
      sceneSkybox: [
        createSkyboxNode(
          'complex-skybox',
          'test-space',
          'Complex Skybox',
          'complex_skybox.hdr',
          false
        )
      ]
    });

    const { result } = renderHook(() => use3dScenes(), { wrapper });
    const data = await waitForSuccessAndGetData(result);
    const scene = data['test-space']['complex-scene'];

    expect(scene.name).toBe('Complex Scene');
    expect(scene.modelOptions).toHaveLength(1);
    expect(scene.image360CollectionOptions).toHaveLength(1);
    expect(scene.groundPlanes).toHaveLength(1);
    expect(scene.skybox).toBeDefined();

    const firstModel = scene.modelOptions[0];
    assert(isClassicIdentifier(firstModel));
    expect(firstModel.modelId).toBe(456);
    expect(firstModel.revisionId).toBe(2);

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
    createdTime: MOCK_TIMESTAMP,
    lastUpdatedTime: MOCK_TIMESTAMP,
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

  const createModelEdge = (
    sceneExternalId: string,
    sceneSpace: string,
    modelExternalId: string,
    modelSpace = 'models',
    revisionId?: number
  ): EdgeItem<Record<string, Record<string, Cdf3dRevisionProperties>>> => ({
    startNode: { externalId: sceneExternalId, space: sceneSpace },
    endNode: { externalId: modelExternalId, space: modelSpace },
    instanceType: 'edge' as const,
    version: 1,
    type: { externalId: 'test-edge-type', space: 'test' },
    space: sceneSpace,
    externalId: `${sceneExternalId}-${modelExternalId}`,
    createdTime: MOCK_TIMESTAMP,
    lastUpdatedTime: MOCK_TIMESTAMP,
    properties: {
      scene: {
        'RevisionProperties/v1': {
          revisionId: revisionId ?? parseInt(modelExternalId.replace('cog_3d_model_', '')),
          ...createDefaultTransformation({
            translationX: 10,
            translationY: 20,
            translationZ: 30
          })
        }
      }
    }
  });

  const create360Edge = (
    sceneExternalId: string,
    sceneSpace: string,
    collectionExternalId: string,
    collectionSpace: string
  ): EdgeItem<Record<string, Record<string, Cdf3dImage360CollectionProperties>>> => ({
    startNode: { externalId: sceneExternalId, space: sceneSpace },
    endNode: { externalId: collectionExternalId, space: collectionSpace },
    instanceType: 'edge' as const,
    version: 1,
    type: { externalId: 'test-edge-type', space: 'test' },
    space: sceneSpace,
    externalId: `${sceneExternalId}-${collectionExternalId}`,
    createdTime: MOCK_TIMESTAMP,
    lastUpdatedTime: MOCK_TIMESTAMP,
    properties: {
      scene: {
        'Image360CollectionProperties/v1': {
          image360CollectionExternalId: collectionExternalId,
          image360CollectionSpace: collectionSpace,
          ...createDefaultTransformation()
        }
      }
    }
  });

  const createGroundPlaneNode = (
    externalId: string,
    space: string,
    label: string,
    file: string
  ): NodeItem<GroundPlaneProperties> => ({
    externalId,
    space,
    instanceType: 'node' as const,
    version: 1,
    createdTime: MOCK_TIMESTAMP,
    lastUpdatedTime: MOCK_TIMESTAMP,
    properties: {
      GroundPlane: {
        v1: {
          label,
          file,
          wrapping: 'repeat' as const
        }
      }
    }
  });

  const createGroundPlaneEdge = (
    sceneExternalId: string,
    sceneSpace: string,
    groundPlaneExternalId: string,
    groundPlaneSpace: string,
    transform: Transformation3d
  ): EdgeItem<Record<string, Record<string, Transformation3d>>> => ({
    startNode: { externalId: sceneExternalId, space: sceneSpace },
    endNode: { externalId: groundPlaneExternalId, space: groundPlaneSpace },
    instanceType: 'edge' as const,
    version: 1,
    type: { externalId: 'test-edge-type', space: 'test' },
    space: sceneSpace,
    externalId: `${sceneExternalId}-${groundPlaneExternalId}`,
    createdTime: MOCK_TIMESTAMP,
    lastUpdatedTime: MOCK_TIMESTAMP,
    properties: {
      Transformation3d: {
        v1: {
          ...transform
        }
      }
    }
  });

  const createSkyboxNode = (
    externalId: string,
    space: string,
    label: string,
    file: string,
    isSpherical: boolean
  ): NodeItem<SkyboxProperties> => ({
    externalId,
    space,
    instanceType: 'node' as const,
    version: 1,
    createdTime: MOCK_TIMESTAMP,
    lastUpdatedTime: MOCK_TIMESTAMP,
    properties: {
      EnvironmentMap: {
        v1: {
          label,
          isSpherical,
          file
        }
      }
    }
  });

  const setupMockResponse = (responseData: MockResponseData, nextCursor?: string): void => {
    mockQueryNodesAndEdges.mockResolvedValueOnce({
      items: {
        scenes: [],
        sceneModels: [],
        scene360Collections: [],
        sceneGroundPlanes: [],
        sceneGroundPlaneEdges: [],
        sceneSkybox: [],
        ...responseData
      },
      nextCursor: nextCursor !== undefined ? { scenes: nextCursor } : undefined
    });
  };

  const createDefaultTransformation = (
    overrides?: Partial<Transformation3d>
  ): Transformation3d => ({
    translationX: 0,
    translationY: 0,
    translationZ: 0,
    eulerRotationX: 0,
    eulerRotationY: 0,
    eulerRotationZ: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    ...overrides
  });

  const waitForSuccessAndGetData = async (result: {
    current: Use3dScenesResult;
  }): Promise<ScenesMap> => {
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    assert(result.current.data !== undefined);
    return result.current.data;
  };
});
