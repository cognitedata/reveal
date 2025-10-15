import { renderHook, type RenderHookResult } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import { useQualitySettingsFromScene } from './useQualitySettingsFromScene';
import {
  defaultUseQualitySettingsFromSceneDependencies,
  UseQualitySettingsFromSceneContext
} from './useQualitySettingsFromScene.context';
import { type SceneQualitySettings, type Scene } from '../sceneTypes';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import { createSceneMockWithQualitySettings } from '#test-utils/fixtures/sceneData';
import { PointColorType, PointShape } from '@cognite/reveal';
import { type QualitySettings } from '../../../architecture/base/utilities/quality/QualitySettings';
import { DEFAULT_REVEAL_QUALITY_SETTINGS } from '../../../architecture/concrete/reveal/constants';

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

  const defaultDependencies = getMocksByDefaultDependencies(
    defaultUseQualitySettingsFromSceneDependencies
  );

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <UseQualitySettingsFromSceneContext.Provider value={defaultDependencies}>
      {children}
    </UseQualitySettingsFromSceneContext.Provider>
  );

  const defaultCurrentSettings: QualitySettings = DEFAULT_REVEAL_QUALITY_SETTINGS;

  const renderHookWithScene = (
    sceneData: Scene | undefined
  ): RenderHookResult<{ onPointCloudSettingsCallback: () => void }, [string, string]> => {
    defaultDependencies.useSceneConfig.mockReturnValue(sceneData);
    return renderHook(() => useQualitySettingsFromScene('test-scene', 'test-space'), { wrapper });
  };

  beforeEach(() => {
    defaultDependencies.useRenderTarget.mockReturnValue(mockRenderTarget);
    mockQualitySettingsPeek.mockReturnValue(defaultCurrentSettings);
  });

  test('should not apply quality settings when scene data is missing', () => {
    renderHookWithScene(undefined);
    expect(mockQualitySettingsPeek).not.toHaveBeenCalled();

    renderHookWithScene(undefined);
    expect(mockQualitySettingsPeek).not.toHaveBeenCalled();
  });

  test('should apply quality settings when provided', () => {
    const qualitySettings: SceneQualitySettings = {
      cadBudget: 2000000,
      maxRenderResolution: 2560
    };

    renderHookWithScene(createSceneMockWithQualitySettings(qualitySettings));

    expect(mockQualitySettingsCall).toHaveBeenCalledWith({
      cadBudget: { maximumRenderCost: 2000000, highDetailProximityThreshold: 0 },
      pointCloudBudget: { numberOfPoints: 3_000_000 },
      resolutionOptions: { maxRenderResolution: 2560, movingCameraResolutionFactor: 0.5 }
    });
  });

  test('should apply point cloud settings via callback', () => {
    const qualitySettings: SceneQualitySettings = {
      pointCloudPointSize: 3,
      pointCloudColor: 'Intensity' as const,
      pointCloudPointShape: 'Square' as const
    };

    const { result } = renderHookWithScene(createSceneMockWithQualitySettings(qualitySettings));

    result.current.onPointCloudSettingsCallback();

    expect(mockRenderTarget.revealSettingsController.pointSize.peek()).toBe(3);
    expect(mockRenderTarget.revealSettingsController.pointColorType.peek()).toBe(
      PointColorType.Intensity
    );
    expect(mockRenderTarget.revealSettingsController.pointShape.peek()).toBe(PointShape.Square);
  });

  test('should update quality settings when sceneExternalId and sceneSpace change', () => {
    // Create initial scene with first set of quality settings
    const initialQualitySettings: SceneQualitySettings = {
      cadBudget: 1500000,
      maxRenderResolution: 1920
    };
    const initialScene = createSceneMockWithQualitySettings(initialQualitySettings);

    // Create second scene with different quality settings
    const updatedQualitySettings: SceneQualitySettings = {
      cadBudget: 3000000,
      maxRenderResolution: 4096,
      pointCloudBudget: 1_500_000
    };
    const updatedScene = createSceneMockWithQualitySettings(updatedQualitySettings);

    // Mock useSceneConfig to return different scenes based on scene ID and space
    defaultDependencies.useSceneConfig.mockImplementation(
      (sceneExternalId: string, sceneSpaceId: string) => {
        if (sceneExternalId === 'initial-scene' && sceneSpaceId === 'initial-space') {
          return initialScene;
        }
        if (sceneExternalId === 'updated-scene' && sceneSpaceId === 'updated-space') {
          return updatedScene;
        }
        return undefined;
      }
    );

    // Initial render with first scene
    const { rerender } = renderHook(
      ({ sceneExternalId, sceneSpaceId }: { sceneExternalId: string; sceneSpaceId: string }) =>
        useQualitySettingsFromScene(sceneExternalId, sceneSpaceId),
      {
        wrapper,
        initialProps: {
          sceneExternalId: 'initial-scene',
          sceneSpaceId: 'initial-space'
        }
      }
    );

    // Verify initial quality settings were applied
    expect(mockQualitySettingsCall).toHaveBeenCalledWith({
      cadBudget: { maximumRenderCost: 1500000, highDetailProximityThreshold: 0 },
      pointCloudBudget: { numberOfPoints: 3_000_000 },
      resolutionOptions: { maxRenderResolution: 1920, movingCameraResolutionFactor: 0.5 }
    });

    // Verify that the initial quality settings were updated in renderTarget.revealSettingsController
    expect(mockRenderTarget.revealSettingsController.qualitySettings).toBe(mockQualitySettings);

    // Clear previous calls
    mockQualitySettingsCall.mockClear();

    // Re-render with different scene ID and space
    rerender({
      sceneExternalId: 'updated-scene',
      sceneSpaceId: 'updated-space'
    });

    // Verify updated quality settings were applied
    expect(mockQualitySettingsCall).toHaveBeenCalledWith({
      cadBudget: { maximumRenderCost: 3000000, highDetailProximityThreshold: 0 },
      pointCloudBudget: { numberOfPoints: 1_500_000 },
      resolutionOptions: { maxRenderResolution: 4096, movingCameraResolutionFactor: 0.5 }
    });

    // Verify that the quality settings were updated in renderTarget.revealSettingsController
    expect(mockRenderTarget.revealSettingsController.qualitySettings).toBe(mockQualitySettings);
  });
});
