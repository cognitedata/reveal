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

  const defaultViewModelDependencies = getMocksByDefaultDependencies(
    defaultSceneContainerDependencies
  );

  const mockReveal3DResources = vi.fn<
    ({ resources }: { resources: AddResourceOptions[] }) => ReactElement
  >(({ resources }) => (
    <div data-testid="reveal-3d-resources">Resources count: {resources?.length ?? 0}</div>
  ));
  defaultViewModelDependencies.Reveal3DResources = mockReveal3DResources;

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <SceneContainerContext.Provider value={defaultViewModelDependencies}>
      {children}
    </SceneContainerContext.Provider>
  );

  test('should render Reveal3DResources when resources are available', () => {
    const mockResourceOptions: AddResourceOptions[] = [
      { modelId: 123, revisionId: 456 },
      { modelId: 789, revisionId: 987 }
    ];

    defaultViewModelDependencies.useSceneContainerViewModel.mockReturnValue({
      resourceOptions: mockResourceOptions,
      hasResources: true,
      onPointCloudSettingsCallback: vi.fn()
    });

    const { getByTestId } = render(<SceneContainer {...mockProps} />, { wrapper });

    expect(getByTestId('reveal-3d-resources')).toBeDefined();
    expect(mockReveal3DResources).toHaveBeenCalledWith(
      expect.objectContaining({
        resources: mockResourceOptions
      }),
      {}
    );
  });

  test('should not render Reveal3DResources when no resources are available', () => {
    defaultViewModelDependencies.useSceneContainerViewModel.mockReturnValue({
      resourceOptions: [],
      hasResources: false,
      onPointCloudSettingsCallback: vi.fn()
    });

    const { queryByTestId } = render(<SceneContainer {...mockProps} />, { wrapper });

    expect(queryByTestId('reveal-3d-resources')).toBeNull();
  });

  test('should pass through additional props to Reveal3DResources', () => {
    const mockResourceOptions: AddResourceOptions[] = [{ modelId: 123, revisionId: 456 }];
    const additionalProps = {
      onModelLoadingChanged: vi.fn(),
      styling: { default: { color: 'red' } }
    };

    defaultViewModelDependencies.useSceneContainerViewModel.mockReturnValue({
      resourceOptions: mockResourceOptions,
      hasResources: true,
      onPointCloudSettingsCallback: vi.fn()
    });

    render(<SceneContainer {...mockProps} {...additionalProps} />, { wrapper });

    expect(mockReveal3DResources).toHaveBeenCalledWith(
      expect.objectContaining({
        resources: mockResourceOptions,
        ...additionalProps
      }),
      {}
    );
  });

  test('should call useSceneContainerViewModel with correct parameters', () => {
    defaultViewModelDependencies.useSceneContainerViewModel.mockReturnValue({
      resourceOptions: [],
      hasResources: false,
      onPointCloudSettingsCallback: vi.fn()
    });

    render(<SceneContainer {...mockProps} />, { wrapper });

    expect(defaultViewModelDependencies.useSceneContainerViewModel).toHaveBeenCalledWith({
      sceneExternalId: mockProps.sceneExternalId,
      sceneSpaceId: mockProps.sceneSpaceId
    });
  });
});
