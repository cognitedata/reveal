import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import { useQualitySettingsFromScene } from './useQualitySettingsFromScene';
import {
  defaultUseQualitySettingsFromSceneDependencies,
  UseQualitySettingsFromSceneContext
} from './useQualitySettingsFromScene.context';
import { type SceneQualitySettings } from '../sceneTypes';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import { createSceneMockWithQualitySettings } from '#test-utils/fixtures/sceneData';

describe(useQualitySettingsFromScene.name, () => {
  const mockQualitySettingsPeek = vi.fn();
  const mockQualitySettingsCall = vi.fn();
  const mockQualitySettings = mockQualitySettingsCall;
  Object.defineProperty(mockQualitySettings, 'peek', {
    value: mockQualitySettingsPeek,
    writable: true,
    configurable: true
  });

  const mockRenderTarget = createRenderTargetMock();
  Object.defineProperty(mockRenderTarget.revealSettingsController, 'qualitySettings', {
    value: mockQualitySettings,
    writable: true,
    configurable: true
  });
  const mockProps = {
    sceneExternalId: 'test-scene-id',
    sceneSpaceId: 'test-space-id'
  };

  const defaultDependencies = getMocksByDefaultDependencies(
    defaultUseQualitySettingsFromSceneDependencies
  );

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <UseQualitySettingsFromSceneContext.Provider value={defaultDependencies}>
      {children}
    </UseQualitySettingsFromSceneContext.Provider>
  );

  beforeEach(() => {
    defaultDependencies.useRenderTarget.mockReturnValue(mockRenderTarget);
    mockQualitySettingsPeek.mockClear();
    mockQualitySettingsCall.mockClear();
  });

  test('should call useSceneConfig with correct parameters', () => {
    defaultDependencies.useSceneConfig.mockReturnValue({ data: undefined });

    renderHook(
      () => {
        useQualitySettingsFromScene(mockProps.sceneExternalId, mockProps.sceneSpaceId);
      },
      { wrapper }
    );

    expect(defaultDependencies.useSceneConfig).toHaveBeenCalledWith(
      mockProps.sceneExternalId,
      mockProps.sceneSpaceId
    );
    expect(defaultDependencies.useRenderTarget).toHaveBeenCalled();
  });

  test('should not apply quality settings when scene data is undefined', () => {
    defaultDependencies.useSceneConfig.mockReturnValue({ data: undefined });

    renderHook(
      () => {
        useQualitySettingsFromScene(mockProps.sceneExternalId, mockProps.sceneSpaceId);
      },
      { wrapper }
    );

    expect(mockQualitySettingsPeek).not.toHaveBeenCalled();
  });

  test('should not apply quality settings when qualitySettings is undefined', () => {
    const mockScene = createSceneMockWithQualitySettings(undefined);
    defaultDependencies.useSceneConfig.mockReturnValue({ data: mockScene });

    renderHook(
      () => {
        useQualitySettingsFromScene(mockProps.sceneExternalId, mockProps.sceneSpaceId);
      },
      { wrapper }
    );

    expect(mockQualitySettingsPeek).not.toHaveBeenCalled();
  });

  test('should apply quality settings when they are provided', () => {
    const mockCurrentSettings = {
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

    const mockQualitySettings: SceneQualitySettings = {
      cadBudget: 2000000,
      pointCloudBudget: 750000,
      maxRenderResolution: 2560,
      movingCameraResolutionFactor: 0.7
    };

    const mockScene = createSceneMockWithQualitySettings(mockQualitySettings);

    mockQualitySettingsPeek.mockReturnValue(mockCurrentSettings);
    defaultDependencies.useSceneConfig.mockReturnValue({ data: mockScene });

    renderHook(
      () => {
        useQualitySettingsFromScene(mockProps.sceneExternalId, mockProps.sceneSpaceId);
      },
      { wrapper }
    );

    expect(mockQualitySettingsPeek).toHaveBeenCalled();
    expect(mockQualitySettingsCall).toHaveBeenCalledWith({
      cadBudget: {
        maximumRenderCost: 2000000,
        highDetailProximityThreshold: 100
      },
      pointCloudBudget: {
        numberOfPoints: 750000
      },
      resolutionOptions: {
        maxRenderResolution: 2560,
        movingCameraResolutionFactor: 0.7
      }
    });
  });

  test('should merge quality settings with current values when some settings are undefined', () => {
    const mockCurrentSettings = {
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

    const mockQualitySettings: Partial<SceneQualitySettings> = {
      cadBudget: 2000000
    };

    const mockScene = createSceneMockWithQualitySettings(mockQualitySettings);

    mockQualitySettingsPeek.mockReturnValue(mockCurrentSettings);
    defaultDependencies.useSceneConfig.mockReturnValue({ data: mockScene });

    renderHook(
      () => {
        useQualitySettingsFromScene(mockProps.sceneExternalId, mockProps.sceneSpaceId);
      },
      { wrapper }
    );

    expect(mockQualitySettingsCall).toHaveBeenCalledWith({
      cadBudget: {
        maximumRenderCost: 2000000,
        highDetailProximityThreshold: 100
      },
      pointCloudBudget: {
        numberOfPoints: 500000
      },
      resolutionOptions: {
        maxRenderResolution: 1920,
        movingCameraResolutionFactor: 0.5
      }
    });
  });

  test('should handle missing scene data gracefully', () => {
    defaultDependencies.useSceneConfig.mockReturnValue({
      data: createSceneMockWithQualitySettings(null)
    });

    expect(() => {
      renderHook(
        () => {
          useQualitySettingsFromScene(mockProps.sceneExternalId, mockProps.sceneSpaceId);
        },
        { wrapper }
      );
    }).not.toThrow();

    expect(mockQualitySettingsPeek).not.toHaveBeenCalled();
  });
});
