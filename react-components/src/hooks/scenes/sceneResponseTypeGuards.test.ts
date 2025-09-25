import { describe, it, expect } from 'vitest';

import {
  type Transformation3d,
  type Cdf3dImage360CollectionProperties,
  type Cdf3dRevisionProperties,
  type SceneConfigurationProperties
} from './types';

import {
  isScene360CollectionEdge,
  isScene3dModelEdge,
  isSceneConfigurationProperties
} from './sceneResponseTypeGuards';
import { type EdgeItem } from '../../data-providers/FdmSDK';

describe('sceneResponseTypeGuards', () => {
  // Data factory functions for test data generation
  const createValidSceneConfig = (
    overrides: Partial<SceneConfigurationProperties> = {}
  ): SceneConfigurationProperties => ({
    name: 'Test Scene',
    cameraTranslationX: 1.0,
    cameraTranslationY: 2.0,
    cameraTranslationZ: 3.0,
    cameraEulerRotationX: 0.1,
    cameraEulerRotationY: 0.2,
    cameraEulerRotationZ: 0.3,
    ...overrides
  });

  const createValidTransformation = (
    overrides: Partial<Transformation3d> = {}
  ): Transformation3d => ({
    translationX: 0.0,
    translationY: 0.0,
    translationZ: 0.0,
    eulerRotationX: 0.0,
    eulerRotationY: 0.0,
    eulerRotationZ: 0.0,
    scaleX: 1.0,
    scaleY: 1.0,
    scaleZ: 1.0,
    ...overrides
  });

  const createValidSceneModel = (
    overrides: Partial<Cdf3dRevisionProperties> = {}
  ): Cdf3dRevisionProperties => ({
    ...createValidTransformation(),
    revisionId: 123,
    ...overrides
  });

  const createValid360Collection = (
    overrides: Partial<Cdf3dImage360CollectionProperties> = {}
  ): Cdf3dImage360CollectionProperties => ({
    ...createValidTransformation(),
    image360CollectionExternalId: 'collection-123',
    image360CollectionSpace: 'space-123',
    ...overrides
  });

  const createValid3dRevisionEdgeItem = (
    overrides: Partial<Cdf3dRevisionProperties> = {}
  ): EdgeItem<{ scene: { ['RevisionProperties/v1']: Cdf3dRevisionProperties } }> => {
    return createValidEdgeItem({
      scene: { 'RevisionProperties/v1': createValidSceneModel(overrides) }
    });
  };

  const createValid360CollectionEdgeItem = (
    overrides: Partial<Cdf3dImage360CollectionProperties> = {}
  ): EdgeItem<{
    scene: { ['Image360CollectionProperties/v1']: Cdf3dImage360CollectionProperties };
  }> => {
    return createValidEdgeItem({
      scene: { 'Image360CollectionProperties/v1': createValid360Collection(overrides) }
    });
  };

  const createValidEdgeItem = <T>(properties: T): EdgeItem<T> => {
    return {
      instanceType: 'edge',
      externalId: 'external-id',
      space: 'space',
      version: 1,
      type: { externalId: 'type-external-id', space: 'type-space' },
      createdTime: 0,
      lastUpdatedTime: 0,
      startNode: { externalId: 'start-external-id', space: 'start-space' },
      endNode: { externalId: 'end-external-id', space: 'end-space' },
      properties
    };
  };

  // Common test cases
  const invalidInputs = [null, undefined, 'string', 123, true, [], {}];

  describe('shared behavior', () => {
    it('isSceneConfigurationProperties should return false for invalid inputs', () => {
      invalidInputs.forEach((input) => {
        expect(isSceneConfigurationProperties(input)).toBe(false);
      });
    });
  });

  describe(isSceneConfigurationProperties.name, () => {
    it('should return true for valid scene configuration', () => {
      expect(isSceneConfigurationProperties(createValidSceneConfig())).toBe(true);

      expect(
        isSceneConfigurationProperties(
          createValidSceneConfig({
            cameraTargetX: 10.0,
            cameraTargetY: 20.0,
            cameraTargetZ: 30.0
          })
        )
      ).toBe(true);

      expect(
        isSceneConfigurationProperties(
          createValidSceneConfig({
            cadBudget: 1,
            pointCloudBudget: 2,
            maxRenderResolution: 3,
            movingCameraResolutionFactor: 4,
            pointCloudPointSize: 2.0,
            pointCloudPointShape: 'Circle',
            pointCloudColor: 'Rgb'
          })
        )
      ).toBe(true);
    });

    it.each([
      ['missing name', { name: undefined }],
      ['wrong name type', { name: 123 }],
      ['missing camera translation', { cameraTranslationX: undefined }],
      ['wrong camera translation type', { cameraTranslationX: 'not a number' }],
      ['missing camera rotation', { cameraEulerRotationX: undefined }],
      ['wrong camera rotation type', { cameraEulerRotationY: 'not a number' }],
      ['wrong optional description type', { description: 123 }],
      ['wrong optional camera target X type', { cameraTargetX: 'not a number' }],
      ['wrong optional camera target Y type', { cameraTargetY: 'not a number' }],
      ['wrong optional camera target Z type', { cameraTargetZ: 'not a number' }],
      ['wrong cad budget type', { cadBudget: 'not a number' }],
      ['wrong point cloud budget type', { pointCloudBudget: 'not a number' }],
      ['wrong max render resolution type', { maxRenderResolution: 'not a number' }],
      [
        'wrong moving camera resolution factor type',
        { movingCameraResolutionFactor: 'not a number' }
      ],
      ['wrong point size type', { pointCloudPointSize: 'not a number' }],
      ['wrong point shape type', { pointCloudPointShape: 999 }],
      ['wrong point color type', { pointCloudColor: 999 }]
    ])('should return false for %s', (_, overrides: Record<string, unknown>) => {
      expect(isSceneConfigurationProperties(createValidSceneConfig(overrides))).toBe(false);
    });

    it('should validate pointCloudPointSize, pointCloudShape, and pointCloudColor types', () => {
      // Valid cases
      expect(
        isSceneConfigurationProperties(
          createValidSceneConfig({
            pointCloudPointSize: 2,
            pointCloudPointShape: 'Circle',
            pointCloudColor: 'Rgb'
          })
        )
      ).toBe(true);

      expect(
        isSceneConfigurationProperties({
          ...createValidSceneConfig(),
          pointCloudPointSize: undefined // undefined is valid for optional properties
        })
      ).toBe(true);

      // Invalid cases
      expect(
        isSceneConfigurationProperties({
          ...createValidSceneConfig(),
          pointCloudPointShape: 'NotAValidShape' // Invalid enum value --- IGNORE ---
        })
      ).toBe(false);

      expect(
        isSceneConfigurationProperties({
          ...createValidSceneConfig(),
          pointCloudColor: 'NotAValidColor' // Invalid enum value --- IGNORE ---
        })
      ).toBe(false);
    });

    it('should allow all individual quality settings properties to be undefined', () => {
      const qualitySettingsProperties = [
        'cadBudget',
        'pointCloudBudget',
        'maxRenderResolution',
        'movingCameraResolutionFactor',
        'pointCloudPointSize',
        'pointCloudPointShape',
        'pointCloudColor'
      ];

      // Test each quality setting property can be undefined individually
      qualitySettingsProperties.forEach((prop) => {
        expect(
          isSceneConfigurationProperties({
            ...createValidSceneConfig(),
            [prop]: undefined
          })
        ).toBe(true);
      });

      // Test all quality settings properties can be undefined at once
      const allUndefinedOverrides: Record<string, undefined> = {};
      qualitySettingsProperties.forEach((prop) => {
        allUndefinedOverrides[prop] = undefined;
      });

      expect(
        isSceneConfigurationProperties({
          ...createValidSceneConfig(),
          ...allUndefinedOverrides
        })
      ).toBe(true);
    });

    it('should validate quality settings properties with valid values', () => {
      expect(
        isSceneConfigurationProperties(
          createValidSceneConfig({
            cadBudget: 1000000,
            pointCloudBudget: 2000000,
            maxRenderResolution: 1920,
            movingCameraResolutionFactor: 0.5,
            pointCloudPointSize: 3.5,
            pointCloudPointShape: 'Square',
            pointCloudColor: 'Height'
          })
        )
      ).toBe(true);
    });
  });

  describe(isScene3dModelEdge.name, () => {
    it('should return true for valid scene model properties', () => {
      expect(isScene3dModelEdge(createValid3dRevisionEdgeItem())).toBe(true);
    });

    it('should return true for valid scene model properties with defaultVisible', () => {
      expect(isScene3dModelEdge(createValid3dRevisionEdgeItem({ defaultVisible: true }))).toBe(
        true
      );
      expect(isScene3dModelEdge(createValid3dRevisionEdgeItem({ defaultVisible: false }))).toBe(
        true
      );
    });

    it('should return true when defaultVisible is undefined', () => {
      expect(isScene3dModelEdge(createValid3dRevisionEdgeItem({ defaultVisible: undefined }))).toBe(
        true
      );
    });

    it.each([
      ['missing revision ID', { revisionId: undefined }],
      ['wrong revision ID type', { revisionId: 'not a number' }],
      ['missing transformation', { translationX: undefined }],
      ['wrong transformation type', { scaleX: 'not a number' }],
      ['wrong defaultVisible type', { defaultVisible: 'not a boolean' }],
      ['wrong defaultVisible type (number)', { defaultVisible: 1 }],
      ['wrong defaultVisible type (object)', { defaultVisible: {} }]
    ])('should return false for %s', (_, overrides: Record<string, unknown>) => {
      expect(
        isScene3dModelEdge(createValid3dRevisionEdgeItem(createValidSceneModel(overrides)))
      ).toBe(false);
    });
  });

  describe(isScene360CollectionEdge.name, () => {
    it('should return true for valid 360 collection properties', () => {
      expect(
        isScene360CollectionEdge(createValid360CollectionEdgeItem(createValid360Collection()))
      ).toBe(true);
    });

    it('should return true for valid 360 collection properties with defaultVisible', () => {
      expect(
        isScene360CollectionEdge(createValid360CollectionEdgeItem({ defaultVisible: true }))
      ).toBe(true);
      expect(
        isScene360CollectionEdge(createValid360CollectionEdgeItem({ defaultVisible: false }))
      ).toBe(true);
    });

    it('should return true when defaultVisible is undefined', () => {
      expect(
        isScene360CollectionEdge(createValid360CollectionEdgeItem({ defaultVisible: undefined }))
      ).toBe(true);
    });

    it.each([
      ['missing collection external ID', { image360CollectionExternalId: undefined }],
      ['wrong collection external ID type', { image360CollectionExternalId: 123 }],
      ['missing collection space', { image360CollectionSpace: undefined }],
      ['wrong collection space type', { image360CollectionSpace: 123 }],
      ['wrong defaultVisible type', { defaultVisible: 'not a boolean' }],
      ['wrong defaultVisible type (number)', { defaultVisible: 1 }],
      ['wrong defaultVisible type (object)', { defaultVisible: {} }]
    ])('should return false for %s', (_, overrides: Record<string, unknown>) => {
      expect(isScene360CollectionEdge(createValid360CollectionEdgeItem(overrides))).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle extra properties gracefully', () => {
      expect(
        isSceneConfigurationProperties({
          ...createValidSceneConfig(),
          extra: 'ignored'
        } as any)
      ).toBe(true);

      expect(
        isScene3dModelEdge(
          createValid3dRevisionEdgeItem({
            ...createValidSceneModel(),
            extra: 'ignored',
            another: 42
          } as any)
        )
      ).toBe(true);

      expect(
        isScene360CollectionEdge(
          createValid360CollectionEdgeItem({
            ...createValid360Collection(),
            extra: 'ignored',
            another: 42
          } as any)
        )
      ).toBe(true);
    });

    it('should reject invalid transformation properties', () => {
      const invalidTransformations = [
        {
          ...createValidTransformation(),
          translationX: null,
          translationY: null
        },
        {
          ...createValidTransformation(),
          eulerRotationX: 'invalid',
          eulerRotationY: 'invalid'
        },
        {
          ...createValidTransformation(),
          scaleX: {},
          scaleY: [],
          scaleZ: false
        }
      ];

      invalidTransformations.forEach((transformation: Record<string, unknown>) => {
        expect(isSceneConfigurationProperties({ ...transformation, revisionId: 123 })).toBe(false);
        expect(
          isScene360CollectionEdge(
            createValid360CollectionEdgeItem({
              ...transformation,
              image360CollectionExternalId: 'test',
              image360CollectionSpace: 'space'
            })
          )
        ).toBe(false);
      });
    });
  });
});
