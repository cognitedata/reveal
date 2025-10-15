import { renderHook } from '@testing-library/react';
import { describe, expect, test, beforeEach } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import {
  createMockQueryResult,
  createMockQueryResultNoData
} from '#test-utils/fixtures/queryResult';
import { useSceneConfig } from './useSceneConfig';
import { defaultUseSceneConfigDependencies, UseSceneConfigContext } from './useSceneConfig.context';
import { type ScenesMap, type SceneData } from './types';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';

describe(useSceneConfig.name, () => {
  const mockProps = {
    sceneExternalId: 'test-scene',
    sceneSpace: 'test-space'
  };

  const mockDependencies = getMocksByDefaultDependencies(defaultUseSceneConfigDependencies);

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <UseSceneConfigContext.Provider value={mockDependencies}>
      {children}
    </UseSceneConfigContext.Provider>
  );

  const createSceneData = (overrides?: Partial<SceneData>): SceneData => ({
    name: 'Test Scene',
    cameraTranslationX: 0,
    cameraTranslationY: 0,
    cameraTranslationZ: 0,
    cameraEulerRotationX: 0,
    cameraEulerRotationY: 0,
    cameraEulerRotationZ: 0,
    cameraTargetX: 0,
    cameraTargetY: 0,
    cameraTargetZ: 0,
    modelOptions: [],
    image360CollectionOptions: [],
    groundPlanes: [],
    skybox: undefined,
    qualitySettings: {
      cadBudget: 1000000,
      pointCloudBudget: 500000,
      maxRenderResolution: 1920
    },
    ...overrides
  });

  const mockScenesMap: ScenesMap = {
    'test-space': {
      'test-scene': createSceneData()
    }
  };

  beforeEach(() => {
    mockDependencies.use3dScenes.mockReturnValue(createMockQueryResult(mockScenesMap));
  });

  test('should call use3dScenes', () => {
    renderHook(() => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace), { wrapper });

    expect(mockDependencies.use3dScenes).toHaveBeenCalled();
  });

  test('should return undefined when scene data does not exist', () => {
    mockDependencies.use3dScenes.mockReturnValue(createMockQueryResultNoData());
    const { result } = renderHook(
      () => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace),
      { wrapper }
    );
    expect(result.current).toBeUndefined();
  });

  test('should execute complete scene processing with minimal data', () => {
    mockDependencies.use3dScenes.mockReturnValue(
      createMockQueryResult({
        [mockProps.sceneSpace]: {
          [mockProps.sceneExternalId]: createSceneData()
        }
      })
    );

    const { result } = renderHook(
      () => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace),
      { wrapper }
    );

    const data = result.current;
    expect(data).not.toBeNull();
    expect(data?.sceneConfiguration.name).toBe('Test Scene');
    expect(data?.sceneModels).toHaveLength(0);
    expect(data?.image360Collections).toHaveLength(0);
  });

  test('should transform classic model identifiers correctly', () => {
    mockDependencies.use3dScenes.mockReturnValue(
      createMockQueryResult({
        [mockProps.sceneSpace]: {
          [mockProps.sceneExternalId]: createSceneData({
            modelOptions: [
              { modelId: 12345, revisionId: 67890, defaultVisible: true },
              { modelId: 54321, revisionId: 98765, defaultVisible: false }
            ]
          })
        }
      })
    );

    const { result } = renderHook(
      () => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace),
      { wrapper }
    );

    const data = result.current;
    expect(data).not.toBeNull();
    expect(data?.sceneModels).toHaveLength(2);
    expect(data?.sceneModels[0].modelIdentifier).toHaveProperty('modelId', 12345);
    expect(data?.sceneModels[0].modelIdentifier).toHaveProperty('revisionId', 67890);
    expect(data?.sceneModels[0].defaultVisible).toBe(true);
    expect(data?.sceneModels[1].modelIdentifier).toHaveProperty('modelId', 54321);
    expect(data?.sceneModels[1].defaultVisible).toBe(false);
  });

  test('should transform datamodels model identifiers correctly', () => {
    mockDependencies.use3dScenes.mockReturnValue(
      createMockQueryResult({
        [mockProps.sceneSpace]: {
          [mockProps.sceneExternalId]: createSceneData({
            modelOptions: [
              {
                revisionExternalId: 'dm-revision-1',
                revisionSpace: 'dm-space-1',
                defaultVisible: true
              },
              {
                revisionExternalId: 'dm-revision-2',
                revisionSpace: 'dm-space-2',
                defaultVisible: false
              }
            ]
          })
        }
      })
    );

    const { result } = renderHook(
      () => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace),
      { wrapper }
    );

    const data = result.current;
    expect(data).not.toBeNull();
    expect(data?.sceneModels).toHaveLength(2);
    expect(data?.sceneModels[0].modelIdentifier).toHaveProperty(
      'revisionExternalId',
      'dm-revision-1'
    );
    expect(data?.sceneModels[0].modelIdentifier).toHaveProperty('revisionSpace', 'dm-space-1');
    expect(data?.sceneModels[1].defaultVisible).toBe(false);
  });

  test('should transform image360 collection options correctly', () => {
    mockDependencies.use3dScenes.mockReturnValue(
      createMockQueryResult({
        [mockProps.sceneSpace]: {
          [mockProps.sceneExternalId]: createSceneData({
            image360CollectionOptions: [
              {
                source: 'dm',
                externalId: 'image-collection-1',
                space: 'image-space-1',
                defaultVisible: true
              },
              {
                source: 'dm',
                externalId: 'image-collection-2',
                space: 'image-space-2',
                defaultVisible: false
              }
            ]
          })
        }
      })
    );

    const { result } = renderHook(
      () => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace),
      { wrapper }
    );

    const data = result.current;
    expect(data).not.toBeNull();
    expect(data?.image360Collections).toHaveLength(2);
    expect(data?.image360Collections[0].image360CollectionExternalId).toBe('image-collection-1');
    expect(data?.image360Collections[0].image360CollectionSpace).toBe('image-space-1');
    expect(data?.image360Collections[0].defaultVisible).toBe(true);
    expect(data?.image360Collections[1].defaultVisible).toBe(false);
  });

  test('should transform mixed model types correctly', () => {
    mockDependencies.use3dScenes.mockReturnValue(
      createMockQueryResult({
        [mockProps.sceneSpace]: {
          [mockProps.sceneExternalId]: createSceneData({
            modelOptions: [
              { modelId: 11111, revisionId: 22222, defaultVisible: true },
              {
                revisionExternalId: 'dm-revision-mixed',
                revisionSpace: 'dm-space-mixed',
                defaultVisible: false
              }
            ],
            image360CollectionOptions: [
              {
                source: 'dm',
                externalId: 'mixed-image-collection',
                space: 'mixed-image-space',
                defaultVisible: true
              }
            ]
          })
        }
      })
    );

    const { result } = renderHook(
      () => useSceneConfig(mockProps.sceneExternalId, mockProps.sceneSpace),
      { wrapper }
    );

    const data = result.current;
    expect(data).not.toBeNull();
    expect(data?.sceneModels).toHaveLength(2);
    expect(data?.sceneModels[0].modelIdentifier).toHaveProperty('modelId', 11111);
    expect(data?.sceneModels[1].modelIdentifier).toHaveProperty(
      'revisionExternalId',
      'dm-revision-mixed'
    );
    expect(data?.image360Collections).toHaveLength(1);
    expect(data?.image360Collections[0].image360CollectionExternalId).toBe(
      'mixed-image-collection'
    );
  });
});
