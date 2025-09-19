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

  const defaultCurrentSettings: QualitySettings = {
    cadBudget: { maximumRenderCost: 1000000, highDetailProximityThreshold: 100 },
    pointCloudBudget: { numberOfPoints: 500000 },
    resolutionOptions: { maxRenderResolution: 1920, movingCameraResolutionFactor: 0.5 }
  };

  const renderHookWithScene = (
    sceneData: Scene | null | undefined
  ): RenderHookResult<{ onPointCloudSettingsCallback: () => void }, [string, string]> => {
    defaultDependencies.useSceneConfig.mockReturnValue({ data: sceneData });
    return renderHook(() => useQualitySettingsFromScene('test-scene', 'test-space'), { wrapper });
  };

  beforeEach(() => {
    defaultDependencies.useRenderTarget.mockReturnValue(mockRenderTarget);
    mockQualitySettingsPeek.mockReturnValue(defaultCurrentSettings);
  });

  test('should not apply quality settings when scene data is missing', () => {
    renderHookWithScene(undefined);
    expect(mockQualitySettingsPeek).not.toHaveBeenCalled();

    renderHookWithScene(null);
    expect(mockQualitySettingsPeek).not.toHaveBeenCalled();
  });

  test('should apply quality settings when provided', () => {
    const qualitySettings: SceneQualitySettings = {
      cadBudget: 2000000,
      maxRenderResolution: 2560
    };

    renderHookWithScene(createSceneMockWithQualitySettings(qualitySettings));

    expect(mockQualitySettingsPeek).toHaveBeenCalled();
    expect(mockQualitySettingsCall).toHaveBeenCalledWith({
      cadBudget: { maximumRenderCost: 2000000, highDetailProximityThreshold: 100 },
      pointCloudBudget: { numberOfPoints: 500000 },
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
});
