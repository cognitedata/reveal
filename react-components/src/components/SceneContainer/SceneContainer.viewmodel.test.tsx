import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import { useSceneContainerViewModel } from './SceneContainer.viewmodel';
import { type UseSceneContainerViewModelProps } from './types';
import {
  defaultSceneContainerViewModelDependencies,
  SceneContainerViewModelContext
} from './SceneContainer.viewmodel.context';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import { type AddResourceOptions } from '../Reveal3DResources';

describe(useSceneContainerViewModel.name, () => {
  const mockProps: UseSceneContainerViewModelProps = {
    sceneExternalId: 'test-scene-id',
    sceneSpaceId: 'test-space-id'
  };

  const defaultDependencies = getMocksByDefaultDependencies(
    defaultSceneContainerViewModelDependencies
  );

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <SceneContainerViewModelContext.Provider value={defaultDependencies}>
      {children}
    </SceneContainerViewModelContext.Provider>
  );

  test('should return correct viewmodel result when resources are available', () => {
    const mockResourceOptions: AddResourceOptions[] = [
      { modelId: 123, revisionId: 456 },
      { modelId: 789, revisionId: 987 }
    ];

    defaultDependencies.useReveal3dResourcesFromScene.mockReturnValue(mockResourceOptions);

    const { result } = renderHook(() => useSceneContainerViewModel(mockProps), { wrapper });

    expect(result.current.resourceOptions).toEqual(mockResourceOptions);
    expect(result.current.hasResources).toBe(true);
  });

  test('should return correct viewmodel result when no resources are available', () => {
    const mockResourceOptions: AddResourceOptions[] = [];

    defaultDependencies.useReveal3dResourcesFromScene.mockReturnValue(mockResourceOptions);

    const { result } = renderHook(() => useSceneContainerViewModel(mockProps), { wrapper });

    expect(result.current.resourceOptions).toEqual(mockResourceOptions);
    expect(result.current.hasResources).toBe(false);
  });

  test('should call all required hooks with correct parameters', () => {
    defaultDependencies.useReveal3dResourcesFromScene.mockReturnValue([]);

    renderHook(() => useSceneContainerViewModel(mockProps), { wrapper });

    expect(defaultDependencies.useReveal3dResourcesFromScene).toHaveBeenCalledWith(
      mockProps.sceneExternalId,
      mockProps.sceneSpaceId
    );
    expect(defaultDependencies.useGroundPlaneFromScene).toHaveBeenCalledWith(
      mockProps.sceneExternalId,
      mockProps.sceneSpaceId
    );
    expect(defaultDependencies.useSkyboxFromScene).toHaveBeenCalledWith(
      mockProps.sceneExternalId,
      mockProps.sceneSpaceId
    );
    expect(defaultDependencies.useLoadPoisForScene).toHaveBeenCalledWith(
      mockProps.sceneExternalId,
      mockProps.sceneSpaceId
    );
    expect(defaultDependencies.useQualitySettingsFromScene).toHaveBeenCalledWith(
      mockProps.sceneExternalId,
      mockProps.sceneSpaceId
    );
  });
});
