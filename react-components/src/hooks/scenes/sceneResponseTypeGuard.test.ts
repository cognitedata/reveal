import { describe, test, expect } from 'vitest';

import { type SceneConfigurationProperties } from './types';

import { isSceneConfigurationProperties } from './sceneResponseTypeGuard';

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

  // Common test cases
  const invalidInputs = [null, undefined, 'string', 123, true, [], {}];

  describe('shared behavior', () => {
    test.each([['isSceneBuilderSceneConfigurationProperties', isSceneConfigurationProperties]])(
      '%s should return false for invalid inputs',
      (_, typeGuard) => {
        invalidInputs.forEach((input) => {
          expect(typeGuard(input)).toBe(false);
        });
      }
    );
  });

  describe(isSceneConfigurationProperties.name, () => {
    test('should return true for valid scene configuration', () => {
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

    test.each([
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

    test('should validate pointCloudPointSize, pointCloudShape, and pointCloudColor types', () => {
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
          pointCloudPointSize: undefined
        })
      ).toBe(true);

      // Invalid cases
      expect(
        isSceneConfigurationProperties({
          ...createValidSceneConfig(),
          pointCloudPointShape: 'NotAValidShape'
        })
      ).toBe(false);

      expect(
        isSceneConfigurationProperties({
          ...createValidSceneConfig(),
          pointCloudColor: 'NotAValidColor'
        })
      ).toBe(false);
    });

    test('should allow all individual quality settings properties to be undefined', () => {
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
  });
});
