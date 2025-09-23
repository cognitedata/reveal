import { describe, expect, test, vi } from 'vitest';
import { PointColorType, PointShape } from '@cognite/reveal';
import {
  mergePointCloudSettings,
  mapPointShape,
  mapPointColorType,
  applyQualitySettingsToRenderTarget,
  mergeQualitySettings,
  resetRevealQualitySettings
} from './pointCloudSettings';
import { type SceneQualitySettings } from '../components/SceneContainer/sceneTypes';
import { type RevealSettingsController } from '../architecture/concrete/reveal/RevealSettingsController';
import { type QualitySettings } from '../architecture/base/utilities/quality/QualitySettings';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { DEFAULT_REVEAL_QUALITY_SETTINGS } from '../architecture/concrete/reveal/constants';
import { Mock } from 'moq.ts';

describe('pointCloudSettings utilities', () => {
  describe('mergePointCloudSettings', () => {
    const mockPointSize = Object.assign(vi.fn(), {
      peek: vi.fn<() => number>(),
      subscribe: vi.fn()
    });
    const mockPointShape = Object.assign(vi.fn(), {
      peek: vi.fn<() => PointShape>(),
      subscribe: vi.fn()
    });
    const mockPointColorType = Object.assign(vi.fn(), {
      peek: vi.fn<() => PointColorType>(),
      subscribe: vi.fn()
    });

    const mockSettingsController = new Mock<RevealSettingsController>()
      .setup((p) => p.pointSize)
      .returns(mockPointSize)
      .setup((p) => p.pointShape)
      .returns(mockPointShape)
      .setup((p) => p.pointColorType)
      .returns(mockPointColorType)
      .object();

    test('should apply point size when provided', () => {
      const qualitySettings: SceneQualitySettings = {
        pointCloudPointSize: 2.5
      };

      mergePointCloudSettings(mockSettingsController, qualitySettings);

      expect(mockPointSize).toHaveBeenCalledWith(2.5);
      expect(mockPointShape).not.toHaveBeenCalled();
      expect(mockPointColorType).not.toHaveBeenCalled();
    });

    test('should apply point shape when provided', () => {
      const qualitySettings: SceneQualitySettings = {
        pointCloudPointShape: 'Square'
      };

      mergePointCloudSettings(mockSettingsController, qualitySettings);

      expect(mockPointShape).toHaveBeenCalledWith(PointShape.Square);
      expect(mockPointSize).toHaveBeenCalledWith(2);
      expect(mockPointColorType).not.toHaveBeenCalled();
    });

    test('should apply point color when provided', () => {
      const qualitySettings: SceneQualitySettings = {
        pointCloudColor: 'Height'
      };

      mergePointCloudSettings(mockSettingsController, qualitySettings);

      expect(mockPointColorType).toHaveBeenCalledWith(PointColorType.Height);
      expect(mockPointSize).toHaveBeenCalledWith(2);
      expect(mockPointShape).not.toHaveBeenCalled();
    });

    test('should apply all settings when all are provided', () => {
      const qualitySettings: SceneQualitySettings = {
        pointCloudPointSize: 1.8,
        pointCloudPointShape: 'Paraboloid',
        pointCloudColor: 'Intensity'
      };

      mergePointCloudSettings(mockSettingsController, qualitySettings);

      expect(mockPointSize).toHaveBeenCalledWith(1.8);
      expect(mockPointShape).toHaveBeenCalledWith(PointShape.Paraboloid);
      expect(mockPointColorType).toHaveBeenCalledWith(PointColorType.Intensity);
    });

    test('should apply default point size when no settings are provided', () => {
      const qualitySettings: SceneQualitySettings = {};

      mergePointCloudSettings(mockSettingsController, qualitySettings);

      expect(mockPointSize).toHaveBeenCalledWith(2);
      expect(mockPointShape).not.toHaveBeenCalled();
      expect(mockPointColorType).not.toHaveBeenCalled();
    });
  });

  describe('mapPointShape', () => {
    test('should map valid point shapes correctly', () => {
      expect(mapPointShape('Circle')).toBe(PointShape.Circle);
      expect(mapPointShape('Square')).toBe(PointShape.Square);
      expect(mapPointShape('Paraboloid')).toBe(PointShape.Paraboloid);
    });

    test('should default to Circle for invalid shapes', () => {
      expect(mapPointShape('Invalid')).toBe(PointShape.Circle);
      expect(mapPointShape('')).toBe(PointShape.Circle);
      expect(mapPointShape('circle')).toBe(PointShape.Circle);
    });
  });

  describe('mapPointColorType', () => {
    test('should map valid point color types correctly', () => {
      expect(mapPointColorType('Rgb')).toBe(PointColorType.Rgb);
      expect(mapPointColorType('Depth')).toBe(PointColorType.Depth);
      expect(mapPointColorType('Height')).toBe(PointColorType.Height);
      expect(mapPointColorType('Intensity')).toBe(PointColorType.Intensity);
      expect(mapPointColorType('Lod')).toBe(PointColorType.Lod);
      expect(mapPointColorType('PointIndex')).toBe(PointColorType.PointIndex);
      expect(mapPointColorType('Classification')).toBe(PointColorType.Classification);
    });

    test('should default to Rgb for invalid color types', () => {
      expect(mapPointColorType('Invalid')).toBe(PointColorType.Rgb);
      expect(mapPointColorType('')).toBe(PointColorType.Rgb);
      expect(mapPointColorType('rgb')).toBe(PointColorType.Rgb);
    });
  });

  describe('mergeQualitySettings', () => {
    test('should merge quality settings with current settings', () => {
      const currentSettings: QualitySettings = {
        cadBudget: {
          maximumRenderCost: 1000000,
          highDetailProximityThreshold: 100
        },
        pointCloudBudget: {
          numberOfPoints: 500000
        },
        resolutionOptions: {
          maxRenderResolution: 1920,
          movingCameraResolutionFactor: 0.5
        }
      };

      const incomingSettings: SceneQualitySettings = {
        cadBudget: 2000000,
        pointCloudBudget: 750000
      };

      const result = mergeQualitySettings(currentSettings, incomingSettings);

      expect(result).toEqual({
        cadBudget: {
          maximumRenderCost: 2000000,
          highDetailProximityThreshold: 100
        },
        pointCloudBudget: {
          numberOfPoints: 750000
        },
        resolutionOptions: {
          maxRenderResolution: 1920,
          movingCameraResolutionFactor: 0.5
        }
      });
    });

    test('should preserve current settings when incoming settings are undefined', () => {
      const currentSettings: QualitySettings = {
        cadBudget: {
          maximumRenderCost: 1000000,
          highDetailProximityThreshold: 100
        },
        pointCloudBudget: {
          numberOfPoints: 500000
        },
        resolutionOptions: {
          maxRenderResolution: 1920,
          movingCameraResolutionFactor: 0.5
        }
      };

      const incomingSettings: SceneQualitySettings = {};

      const result = mergeQualitySettings(currentSettings, incomingSettings);

      expect(result).toEqual(currentSettings);
    });
  });

  describe('applyQualitySettingsToRenderTarget', () => {
    const mockQualitySettingsPeek = vi.fn();
    const mockQualitySettingsCall = vi.fn();

    const mockRenderTarget = createRenderTargetMock();

    Object.defineProperty(mockRenderTarget.revealSettingsController, 'qualitySettings', {
      value: Object.assign(mockQualitySettingsCall, {
        peek: mockQualitySettingsPeek
      }),
      writable: true,
      configurable: true
    });

    test('should apply quality settings to render target', () => {
      const currentSettings: QualitySettings = {
        cadBudget: {
          maximumRenderCost: 1000000,
          highDetailProximityThreshold: 100
        },
        pointCloudBudget: {
          numberOfPoints: 500000
        },
        resolutionOptions: {
          maxRenderResolution: 1920,
          movingCameraResolutionFactor: 0.5
        }
      };

      const qualitySettings: SceneQualitySettings = {
        cadBudget: 2000000,
        maxRenderResolution: 2560
      };

      mockQualitySettingsPeek.mockReturnValue(currentSettings);

      applyQualitySettingsToRenderTarget(mockRenderTarget, qualitySettings);

      expect(mockQualitySettingsCall).toHaveBeenCalledWith({
        cadBudget: {
          maximumRenderCost: 2000000,
          highDetailProximityThreshold: 0
        },
        pointCloudBudget: {
          numberOfPoints: 3_000_000
        },
        resolutionOptions: {
          maxRenderResolution: 2560,
          movingCameraResolutionFactor: 0.5
        }
      });
    });

    test('should handle empty quality settings', () => {
      const currentSettings: QualitySettings = {
        cadBudget: {
          maximumRenderCost: 1000000,
          highDetailProximityThreshold: 100
        },
        pointCloudBudget: {
          numberOfPoints: 500000
        },
        resolutionOptions: {
          maxRenderResolution: 1920,
          movingCameraResolutionFactor: 0.5
        }
      };

      const qualitySettings: SceneQualitySettings = {};

      mockQualitySettingsPeek.mockReturnValue(currentSettings);

      applyQualitySettingsToRenderTarget(mockRenderTarget, qualitySettings);

      expect(mockQualitySettingsCall).toHaveBeenCalledWith(DEFAULT_REVEAL_QUALITY_SETTINGS);
    });
  });

  describe('resetRevealQualitySettings', () => {
    test('should reset all settings to default values', () => {
      const mockQualitySettings = vi.fn();
      const mockPointSize = vi.fn();
      const mockPointShape = vi.fn();
      const mockPointColorType = vi.fn();

      const mockRenderTarget = createRenderTargetMock();

      // Mock the settings controller methods
      Object.defineProperty(mockRenderTarget.revealSettingsController, 'qualitySettings', {
        value: mockQualitySettings,
        writable: true,
        configurable: true
      });
      Object.defineProperty(mockRenderTarget.revealSettingsController, 'pointSize', {
        value: mockPointSize,
        writable: true,
        configurable: true
      });
      Object.defineProperty(mockRenderTarget.revealSettingsController, 'pointShape', {
        value: mockPointShape,
        writable: true,
        configurable: true
      });
      Object.defineProperty(mockRenderTarget.revealSettingsController, 'pointColorType', {
        value: mockPointColorType,
        writable: true,
        configurable: true
      });

      resetRevealQualitySettings(mockRenderTarget);

      expect(mockQualitySettings).toHaveBeenCalledWith(DEFAULT_REVEAL_QUALITY_SETTINGS);
      expect(mockPointSize).toHaveBeenCalledWith(2);
      expect(mockPointShape).toHaveBeenCalledWith(PointShape.Circle);
      expect(mockPointColorType).toHaveBeenCalledWith(PointColorType.Rgb);
    });
  });
});
