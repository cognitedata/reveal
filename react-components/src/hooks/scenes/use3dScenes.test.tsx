import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, assert } from 'vitest';
import { type PropsWithChildren, type ReactElement } from 'react';
import { Mock } from 'moq.ts';
import { type CogniteClient, type QueryRequest } from '@cognite/sdk';
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
  type ScenesMap,
  SCENE_QUERY_LIMIT
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

  // Add the custom property needed for pagination testing
  const mockDependenciesWithLowLimit = {
    ...mockDependencies,
    sceneRelatedDataLimit: 3
  };

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false // Disable retries to avoid multiple calls in tests
      }
    }
  });

  type MockResponseData = Partial<Use3dScenesQueryResult>;

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <QueryClientProvider client={queryClient}>
      <Use3dScenesContext.Provider value={mockDependenciesWithLowLimit}>
        {children}
      </Use3dScenesContext.Provider>
    </QueryClientProvider>
  );

  beforeEach(() => {
    mockDependenciesWithLowLimit.useSDK.mockReturnValue(sdkMock);
    mockDependenciesWithLowLimit.createFdmSdk.mockReturnValue(mockFdmSdkInstance);
    mockQueryNodesAndEdges.mockClear();
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

  test('should handle scene pagination', async () => {
    const createScenes = (count: number, start: number = 0): SceneNode[] =>
      Array.from({ length: count }, (_, i) => createSceneNode(`scene-${start + i}`, 'test-space'));
    setupMockResponse([
      {
        data: { scenes: createScenes(SCENE_QUERY_LIMIT, 0) },
        nextCursor: { scenes: 'cursor-token' }
      },
      {
        data: { scenes: createScenes(5, SCENE_QUERY_LIMIT) },
        nextCursor: { scenes: 'cursor-token-2' }
      }
    ]);
    const { result } = renderHook(() => use3dScenes(), { wrapper });
    const data = await waitForSuccessAndGetData(result);
    expect(mockQueryNodesAndEdges).toHaveBeenCalledTimes(2);
    const allScenes = Object.values(data).flatMap((spaceScenes) => Object.values(spaceScenes));
    expect(allScenes).toHaveLength(SCENE_QUERY_LIMIT + 5);
  });

  test('should trigger and handle 3d models pagination when limit is reached', async () => {
    const sceneId = 'scene-with-paginated-models';
    const firstBatchOfModels = [
      createModelEdge(sceneId, TEST_SPACE, 'model-1', 'models', 1),
      createModelEdge(sceneId, TEST_SPACE, 'model-2', 'models', 2),
      createModelEdge(sceneId, TEST_SPACE, 'model-3', 'models', 3)
    ]; // Length is 3, which equals the mocked limit

    const secondBatchOfModels = [createModelEdge(sceneId, TEST_SPACE, 'model-4', 'models', 4)]; // Last page

    setupMockResponse([
      {
        data: {
          scenes: [createSceneNode(sceneId, TEST_SPACE)],
          sceneModels: firstBatchOfModels
        },
        nextCursor: { sceneModels: 'model-cursor-1' }
      },
      {
        data: {
          sceneModels: secondBatchOfModels
        },
        nextCursor: { sceneModels: 'model-cursor-2' }
      }
    ]);

    const { result } = renderHook(() => use3dScenes(), { wrapper });
    const data = await waitForSuccessAndGetData(result);

    // Should be 2 calls: initial fetch, and one paginated fetch for models
    expect(mockQueryNodesAndEdges).toHaveBeenCalledTimes(2);

    const scene = data[TEST_SPACE][sceneId];
    expect(scene.modelOptions).toHaveLength(4); // 3 from first call + 1 from second
    const isClassic = scene.modelOptions.every(isClassicIdentifier);
    assert(isClassic);
    const classicModels = scene.modelOptions.filter(isClassicIdentifier);
    expect(classicModels.map((m) => m.revisionId)).toEqual([1, 2, 3, 4]);
  });

  test('should trigger and handle 360 collections pagination when limit is reached', async () => {
    const sceneId = 'scene-with-paginated-360s';
    const firstBatch = [
      create360Edge(sceneId, TEST_SPACE, 'collection-1', 'image-space'),
      create360Edge(sceneId, TEST_SPACE, 'collection-2', 'image-space'),
      create360Edge(sceneId, TEST_SPACE, 'collection-3', 'image-space')
    ]; // Length is 3, equals the mocked limit

    const secondBatch = [create360Edge(sceneId, TEST_SPACE, 'collection-4', 'image-space')];

    setupMockResponse([
      {
        data: {
          scenes: [createSceneNode(sceneId, TEST_SPACE)],
          scene360Collections: firstBatch
        },
        nextCursor: { scene360Collections: '360-cursor-1' }
      },
      {
        data: {
          scene360Collections: secondBatch
        },
        nextCursor: { scene360Collections: '360-cursor-2' }
      }
    ]);

    const { result } = renderHook(() => use3dScenes(), { wrapper });
    const data = await waitForSuccessAndGetData(result);

    expect(mockQueryNodesAndEdges).toHaveBeenCalledTimes(2);

    const scene = data[TEST_SPACE][sceneId];
    expect(scene.image360CollectionOptions).toHaveLength(4);
    expect(scene.image360CollectionOptions.map((c) => c.externalId)).toEqual([
      'collection-1',
      'collection-2',
      'collection-3',
      'collection-4'
    ]);
  });

  test('should handle pagination for both models and 360 collections simultaneously', async () => {
    const sceneId = 'complex-pagination-scene';
    const modelsPage1 = [
      createModelEdge(sceneId, TEST_SPACE, 'model-1', 'models', 1),
      createModelEdge(sceneId, TEST_SPACE, 'model-2', 'models', 2),
      createModelEdge(sceneId, TEST_SPACE, 'model-3', 'models', 3)
    ];
    const collectionsPage1 = [
      create360Edge(sceneId, TEST_SPACE, 'collection-1', 'image-space'),
      create360Edge(sceneId, TEST_SPACE, 'collection-2', 'image-space'),
      create360Edge(sceneId, TEST_SPACE, 'collection-3', 'image-space')
    ];

    const modelsPage2 = [createModelEdge(sceneId, TEST_SPACE, 'model-4', 'models', 4)];
    const collectionsPage2 = [create360Edge(sceneId, TEST_SPACE, 'collection-4', 'image-space')];

    setupMockResponse([
      {
        data: {
          scenes: [createSceneNode(sceneId, TEST_SPACE)],
          sceneModels: modelsPage1,
          scene360Collections: collectionsPage1
        },
        nextCursor: {
          sceneModels: 'model-cursor-1',
          scene360Collections: '360-cursor-1'
        }
      },
      {
        data: {
          sceneModels: modelsPage2,
          scene360Collections: collectionsPage2
        },
        nextCursor: {
          sceneModels: 'model-cursor-2',
          scene360Collections: '360-cursor-2'
        }
      }
    ]);

    const { result } = renderHook(() => use3dScenes(), { wrapper });
    const data = await waitForSuccessAndGetData(result);

    expect(mockQueryNodesAndEdges).toHaveBeenCalledTimes(2);
    const scene = data[TEST_SPACE][sceneId];

    expect(scene.modelOptions).toHaveLength(4);
    expect(scene.image360CollectionOptions).toHaveLength(4);
  });

  test('should use current scene cursor (not next) when paginating related data', async () => {
    const sceneId = 'scene-external-id';
    const modelsPage1 = [
      createModelEdge(sceneId, TEST_SPACE, 'model-1', 'models', 1),
      createModelEdge(sceneId, TEST_SPACE, 'model-2', 'models', 2),
      createModelEdge(sceneId, TEST_SPACE, 'model-3', 'models', 3)
    ];
    const modelsPage2 = [createModelEdge(sceneId, TEST_SPACE, 'model-4', 'models', 4)];

    setupMockResponse([
      {
        data: {
          scenes: [createSceneNode(sceneId, TEST_SPACE)],
          sceneModels: modelsPage1
        },
        nextCursor: {
          sceneModels: 'model-cursor-1',
          scenes: 'scene-cursor-1'
        }
      },
      {
        data: {
          sceneModels: modelsPage2
        },
        nextCursor: {
          sceneModels: 'model-cursor-2',
          scenes: 'scene-cursor-2'
        }
      }
    ]);

    const { result } = renderHook(() => use3dScenes(), { wrapper });
    await waitForSuccessAndGetData(result);

    expect(mockQueryNodesAndEdges).toHaveBeenCalledTimes(2);

    const secondCall = mockQueryNodesAndEdges.mock.calls[1][0];
    expect(secondCall.cursors?.scenes).toBeUndefined();
    expect(secondCall.cursors?.sceneModels).toBe('model-cursor-1');
  });

  test('should process model edges and create 3d model options with correct transform matrix', async () => {
    setupMockResponse({
      scenes: [createSceneNode('scene-with-model', TEST_SPACE)],
      sceneModels: [createModelEdge('scene-with-model', TEST_SPACE, 'model_123', 'models', 1)]
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
    endNode: { externalId: `cog_3d_${modelExternalId}`, space: modelSpace },
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
          revisionId: revisionId ?? 1,
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

  const setupMockResponse = (
    responseData:
      | MockResponseData
      | Array<{ data: MockResponseData; nextCursor?: Record<string, string> }>
  ): void => {
    if (!Array.isArray(responseData)) {
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
        nextCursor: undefined
      });
      return;
    }

    responseData.forEach((response) => {
      mockQueryNodesAndEdges.mockResolvedValueOnce({
        items: {
          scenes: [],
          sceneModels: [],
          scene360Collections: [],
          sceneGroundPlanes: [],
          sceneGroundPlaneEdges: [],
          sceneSkybox: [],
          ...response.data
        },
        nextCursor: response.nextCursor
      });
    });

    // Add a fallback that throws an error if called more times than expected
    mockQueryNodesAndEdges.mockRejectedValue(
      new Error('Mock was called more times than expected - possible infinite loop')
    );
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
});
