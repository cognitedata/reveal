import { render } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import { SceneContainer } from './SceneContainer';
import { type SceneContainerProps } from './types';
import { SceneContainerContext, defaultSceneContainerDependencies } from './SceneContainer.context';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import { type AddResourceOptions } from '../Reveal3DResources';

describe(SceneContainer.name, () => {
  const mockProps: SceneContainerProps = {
    sceneExternalId: 'test-scene-id',
    sceneSpaceId: 'test-space-id'
  };

  const sceneContainerDependencies = getMocksByDefaultDependencies(
    defaultSceneContainerDependencies
  );

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <SceneContainerContext.Provider value={sceneContainerDependencies}>
      {children}
    </SceneContainerContext.Provider>
  );

  test('should render Reveal3DResources when resources are available', () => {
    const mockResourceOptions: AddResourceOptions[] = [
      { modelId: 123, revisionId: 456 },
      { modelId: 789, revisionId: 987 }
    ];

    sceneContainerDependencies.useSceneContainerViewModel.mockReturnValue({
      resourceOptions: mockResourceOptions,
      hasResources: true,
      onPointCloudSettingsCallback: vi.fn()
    });

    render(<SceneContainer {...mockProps} />, { wrapper });

    expect(sceneContainerDependencies.Reveal3DResources).toHaveBeenCalledWith(
      expect.objectContaining({
        resources: mockResourceOptions
      }),
      {}
    );
  });

  test('should not render Reveal3DResources when no resources are available', () => {
    sceneContainerDependencies.useSceneContainerViewModel.mockReturnValue({
      resourceOptions: [],
      hasResources: false,
      onPointCloudSettingsCallback: vi.fn()
    });

    render(<SceneContainer {...mockProps} />, { wrapper });

    expect(sceneContainerDependencies.Reveal3DResources).not.toHaveBeenCalled();
  });

  test('should pass through additional props to Reveal3DResources', () => {
    const mockResourceOptions: AddResourceOptions[] = [{ modelId: 123, revisionId: 456 }];
    const additionalProps = {
      onModelLoadingChanged: vi.fn(),
      styling: { default: { color: 'red' } }
    };

    sceneContainerDependencies.useSceneContainerViewModel.mockReturnValue({
      resourceOptions: mockResourceOptions,
      hasResources: true,
      onPointCloudSettingsCallback: vi.fn()
    });

    render(<SceneContainer {...mockProps} {...additionalProps} />, { wrapper });

    expect(sceneContainerDependencies.Reveal3DResources).toHaveBeenCalledWith(
      expect.objectContaining({
        resources: mockResourceOptions,
        ...additionalProps
      }),
      {}
    );
  });

  test('should call useSceneContainerViewModel with correct parameters', () => {
    sceneContainerDependencies.useSceneContainerViewModel.mockReturnValue({
      resourceOptions: [],
      hasResources: false,
      onPointCloudSettingsCallback: vi.fn()
    });

    render(<SceneContainer {...mockProps} />, { wrapper });

    expect(sceneContainerDependencies.useSceneContainerViewModel).toHaveBeenCalledWith({
      sceneExternalId: mockProps.sceneExternalId,
      sceneSpaceId: mockProps.sceneSpaceId
    });
  });

  test('should render null when hasResources is false', () => {
    sceneContainerDependencies.useSceneContainerViewModel.mockReturnValue({
      resourceOptions: [],
      hasResources: false
    });

    const { container } = render(<SceneContainer {...mockProps} />, { wrapper });

    expect(container.firstChild).toBeNull();
  });
});
