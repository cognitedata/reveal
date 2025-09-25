import { describe, it, expect } from 'vitest';

import {
  Cdf3dImage360CollectionProperties,
  Cdf3dRevisionProperties,
  SceneBuilderSceneConfigurationProperties
} from '../../SceneBuilder/types';

import {
  isSceneBuilderSceneConfigurationProperties,
  isSceneModelProperties,
  isScene360CollectionProperties
} from './sceneResponseTypeGuards';

describe('sceneResponseTypeGuards', () => {
  // Data factory functions for test data generation
  const createValidSceneConfig = (
    overrides: Partial<SceneBuilderSceneConfigurationProperties> = {}
  ) => ({
    name: 'Test Scene',
    cameraTranslationX: 1.0,
    cameraTranslationY: 2.0,
    cameraTranslationZ: 3.0,
    cameraEulerRotationX: 0.1,
    cameraEulerRotationY: 0.2,
    cameraEulerRotationZ: 0.3,
    ...overrides
  });

  const createValidTransformation = (overrides: Partial<Cdf3dRevisionProperties> = {}) => ({
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

  const createValidSceneModel = (overrides: Partial<Cdf3dRevisionProperties> = {}) => ({
    ...createValidTransformation(),
    revisionId: 123,
    ...overrides
  });

  const createValid360Collection = (
    overrides: Partial<Cdf3dImage360CollectionProperties> = {}
  ) => ({
    ...createValidTransformation(),
    image360CollectionExternalId: 'collection-123',
    image360CollectionSpace: 'space-123',
    ...overrides
  });

  // Common test cases
  const invalidInputs = [null, undefined, 'string', 123, true, [], {}];

  describe('shared behavior', () => {
    it.each([
      ['isSceneBuilderSceneConfigurationProperties', isSceneBuilderSceneConfigurationProperties],
      ['isSceneModelProperties', isSceneModelProperties],
      ['isScene360CollectionProperties', isScene360CollectionProperties]
    ])('%s should return false for invalid inputs', (_, typeGuard) => {
      invalidInputs.forEach((input) => {
        expect(typeGuard(input)).toBe(false);
      });
    });
  });

  describe(isSceneBuilderSceneConfigurationProperties.name, () => {
    it('should return true for valid scene configuration', () => {
      expect(isSceneBuilderSceneConfigurationProperties(createValidSceneConfig())).toBe(true);

      expect(
        isSceneBuilderSceneConfigurationProperties(
          createValidSceneConfig({
            description: 'Test description',
            cameraTargetX: 10.0,
            cameraTargetY: 20.0,
            cameraTargetZ: 30.0
          })
        )
      ).toBe(true);

      expect(
        isSceneBuilderSceneConfigurationProperties(
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
      expect(isSceneBuilderSceneConfigurationProperties(createValidSceneConfig(overrides))).toBe(
        false
      );
    });

    it('should validate pointCloudPointSize, pointCloudShape, and pointCloudColor types', () => {
      // Valid cases
      expect(
        isSceneBuilderSceneConfigurationProperties(
          createValidSceneConfig({
            pointCloudPointSize: 2,
            pointCloudPointShape: 'Circle',
            pointCloudColor: 'Rgb'
          })
        )
      ).toBe(true);

      expect(
        isSceneBuilderSceneConfigurationProperties({
          ...createValidSceneConfig(),
          pointCloudPointSize: undefined // undefined is valid for optional properties
        })
      ).toBe(true);

      // Invalid cases
      expect(
        isSceneBuilderSceneConfigurationProperties({
          ...createValidSceneConfig(),
          pointCloudPointShape: 'NotAValidShape' // Invalid enum value --- IGNORE ---
        })
      ).toBe(false);

      expect(
        isSceneBuilderSceneConfigurationProperties({
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
          isSceneBuilderSceneConfigurationProperties({
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
        isSceneBuilderSceneConfigurationProperties({
          ...createValidSceneConfig(),
          ...allUndefinedOverrides
        })
      ).toBe(true);
    });

    it('should validate quality settings properties with valid values', () => {
      expect(
        isSceneBuilderSceneConfigurationProperties(
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

  describe(isSceneModelProperties.name, () => {
    it('should return true for valid scene model properties', () => {
      expect(isSceneModelProperties(createValidSceneModel())).toBe(true);
    });

    it('should return true for valid scene model properties with defaultVisible', () => {
      expect(isSceneModelProperties(createValidSceneModel({ defaultVisible: true }))).toBe(true);
      expect(isSceneModelProperties(createValidSceneModel({ defaultVisible: false }))).toBe(true);
    });

    it('should return true when defaultVisible is undefined', () => {
      expect(isSceneModelProperties(createValidSceneModel({ defaultVisible: undefined }))).toBe(
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
      expect(isSceneModelProperties(createValidSceneModel(overrides))).toBe(false);
    });
  });

  describe(isScene360CollectionProperties.name, () => {
    it('should return true for valid 360 collection properties', () => {
      expect(isScene360CollectionProperties(createValid360Collection())).toBe(true);
    });

    it('should return true for valid 360 collection properties with defaultVisible', () => {
      expect(
        isScene360CollectionProperties(createValid360Collection({ defaultVisible: true }))
      ).toBe(true);
      expect(
        isScene360CollectionProperties(createValid360Collection({ defaultVisible: false }))
      ).toBe(true);
    });

    it('should return true when defaultVisible is undefined', () => {
      expect(
        isScene360CollectionProperties(createValid360Collection({ defaultVisible: undefined }))
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
      expect(isScene360CollectionProperties(createValid360Collection(overrides))).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle extra properties gracefully', () => {
      expect(
        isSceneBuilderSceneConfigurationProperties({
          ...createValidSceneConfig(),
          extra: 'ignored'
        })
      ).toBe(true);

      expect(
        isSceneModelProperties({
          ...createValidSceneModel(),
          extra: 'ignored',
          another: 42
        })
      ).toBe(true);

      expect(
        isScene360CollectionProperties({
          ...createValid360Collection(),
          extra: 'ignored',
          another: 42
        })
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
        expect(isSceneModelProperties({ ...transformation, revisionId: 123 })).toBe(false);
        expect(
          isScene360CollectionProperties({
            ...transformation,
            image360CollectionExternalId: 'test',
            image360CollectionSpace: 'space'
          })
        ).toBe(false);
      });
    });
  });
});
