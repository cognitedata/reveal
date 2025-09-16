import { render } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import { SceneContainer } from './SceneContainer';
import { type SceneContainerProps } from './types';
import {
  SceneContainerContext,
  defaultSceneContainerDependencies
} from './SceneContainer.context';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';

describe(SceneContainer.name, () => {
  const mockProps: SceneContainerProps = {
    sceneExternalId: 'test-scene-id',
    sceneSpaceId: 'test-space-id'
  };

  const defaultViewModelDependencies = getMocksByDefaultDependencies(
    defaultSceneContainerDependencies
  );

  const mockReveal3DResources = vi.fn(({ resources }) => (
    <div data-testid="reveal-3d-resources">
      Resources count: {resources?.length || 0}
    </div>
  ));
  defaultViewModelDependencies.Reveal3DResources = mockReveal3DResources;

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <SceneContainerContext.Provider
      value={defaultViewModelDependencies}
    >
      {children}
    </SceneContainerContext.Provider>
  );

  test('should render Reveal3DResources when resources are available', () => {
    const mockResourceOptions = [
      { modelId: 1, revisionId: 1 },
      { modelId: 2, revisionId: 2 }
    ];

    defaultViewModelDependencies.useSceneContainerViewModel.mockReturnValue({
      resourceOptions: mockResourceOptions,
      hasResources: true,
      isLoading: false
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
      isLoading: true
    });

    const { queryByTestId } = render(<SceneContainer {...mockProps} />, { wrapper });

    expect(queryByTestId('reveal-3d-resources')).toBeNull();
  });

  test('should pass through additional props to Reveal3DResources', () => {
    const mockResourceOptions = [{ modelId: 1, revisionId: 1 }];
    const additionalProps = {
      onModelLoadingChanged: vi.fn(),
      styling: { default: { color: 'red' } }
    };

    defaultViewModelDependencies.useSceneContainerViewModel.mockReturnValue({
      resourceOptions: mockResourceOptions,
      hasResources: true,
      isLoading: false
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
      isLoading: true
    });

    render(<SceneContainer {...mockProps} />, { wrapper });

    expect(defaultViewModelDependencies.useSceneContainerViewModel).toHaveBeenCalledWith({
      sceneExternalId: mockProps.sceneExternalId,
      sceneSpaceId: mockProps.sceneSpaceId
    });
  });

  test('should render null when hasResources is false', () => {
    defaultViewModelDependencies.useSceneContainerViewModel.mockReturnValue({
      resourceOptions: [],
      hasResources: false,
      isLoading: true
    });

    const { container } = render(<SceneContainer {...mockProps} />, { wrapper });

    expect(container.firstChild).toBeNull();
  });

  test('should handle loading state correctly', () => {
    defaultViewModelDependencies.useSceneContainerViewModel.mockReturnValue({
      resourceOptions: [],
      hasResources: false,
      isLoading: true
    });

    const { container } = render(<SceneContainer {...mockProps} />, { wrapper });

    // Should render nothing while loading with no resources
    expect(container.firstChild).toBeNull();
    expect(defaultViewModelDependencies.useSceneContainerViewModel).toHaveBeenCalledWith({
      sceneExternalId: mockProps.sceneExternalId,
      sceneSpaceId: mockProps.sceneSpaceId
    });
  });
});
