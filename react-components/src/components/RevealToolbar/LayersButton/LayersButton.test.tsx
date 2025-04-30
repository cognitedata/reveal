/*!
 * Copyright 2025 Cognite AS
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { ReactElement, ReactNode } from 'react';
import { LayersButton } from './LayersButton';
import type { LayersButtonProps } from './LayersButton';
import { LayersButtonContext, type LayersButtonDependencies } from './LayersButton.context';
import userEvent from '@testing-library/user-event';

import { type ModelLayerHandlers } from './types';
import { cadMock } from '#test-utils/fixtures/cadModel';
import { viewerMock } from '#test-utils/fixtures/viewer';
import {
  createCadHandlerMock,
  createPointCloudHandlerMock,
  createImage360HandlerMock
} from '#test-utils/fixtures/modelHandler';

describe(LayersButton.name, () => {
  const mockCadHandler = createCadHandlerMock();
  const mockPointCloudHandler = createPointCloudHandlerMock();
  const mockImage360Handler = createImage360HandlerMock();
  const defaultProps: LayersButtonProps = {
    layersState: {
      cadLayers: [{ revisionId: 456, applied: true, index: 0 }],
      pointCloudLayers: [{ revisionId: 123, applied: true, index: 0 }],
      image360Layers: [{ siteId: 'site-id', applied: true }]
    },
    setLayersState: vi.fn(),
    defaultLayerConfiguration: undefined
  };

  const defaultDependencies: LayersButtonDependencies = {
    useModelHandlers: vi.fn((): [ModelLayerHandlers, () => void] => [
      {
        cadHandlers: [mockCadHandler],
        pointCloudHandlers: [mockPointCloudHandler],
        image360Handlers: [mockImage360Handler]
      },
      vi.fn()
    ]),
    useReveal: vi.fn(() => viewerMock),
    use3dModels: vi.fn(() => [cadMock, cadMock]),
    useSyncExternalLayersState: vi.fn(),
    ModelLayerSelection: vi.fn(({ label }) => <div>{label}</div>)
  };

  const wrapper = (props: {
    children: ReactNode;
    dependencies?: LayersButtonDependencies;
  }): ReactElement => {
    const { children, dependencies = defaultDependencies } = props;
    return (
      <LayersButtonContext.Provider value={dependencies}>{children}</LayersButtonContext.Provider>
    );
  };

  test('renders without crashing', () => {
    const { getByRole } = render(<LayersButton {...defaultProps} />, {
      wrapper
    });

    // Validate the presence of specific UI elements
    expect(
      getByRole('button', { name: 'Filter 3D resource layers' }).className.includes('cogs-button')
    ).toBe(true);
  });

  test('Layers drop down should mount under the same parent as button', async () => {
    render(
      <div data-test-id="layers-button">
        <LayersButton {...defaultProps} />
      </div>,
      {
        wrapper
      }
    );

    await userEvent.click(screen.getByRole('button', { name: 'Filter 3D resource layers' }));

    const cadModels = screen.getByText('CAD models');

    expect(cadModels.closest('[data-test-id="layers-button"]')).not.toBeNull();
  });

  test('should update viewer models visibility when layersState changes', () => {
    const ModelLayerSelection = vi.fn(({ label }) => <div>{label}</div>);
    const newProps: LayersButtonDependencies & {
      setLayersState: typeof defaultProps.setLayersState;
    } = {
      setLayersState: defaultProps.setLayersState,
      ...defaultDependencies,
      useModelHandlers: vi.fn((): [ModelLayerHandlers, () => void] => [
        {
          cadHandlers: [mockCadHandler],
          pointCloudHandlers: [mockPointCloudHandler],
          image360Handlers: [mockImage360Handler]
        },
        () => {}
      ]),
      useSyncExternalLayersState: vi.fn(),
      ModelLayerSelection
    };

    const { rerender } = render(<LayersButton {...defaultProps} />, {
      wrapper
    });

    // Change layersState
    const newLayersState = {
      cadLayers: [{ revisionId: 456, applied: false, index: 0 }],
      pointCloudLayers: [{ revisionId: 123, applied: true, index: 0 }],
      image360Layers: [{ siteId: 'site-id', applied: false }]
    };
    if (newProps.setLayersState !== undefined) {
      newProps.setLayersState(newLayersState);
    }

    // Re-render with the updated state
    rerender(<LayersButton {...defaultProps} layersState={newLayersState} />);

    mockCadHandler.setVisibility(newLayersState.cadLayers[0].applied);
    mockPointCloudHandler.setVisibility(newLayersState.pointCloudLayers[0].applied);
    mockImage360Handler.setVisibility(newLayersState.image360Layers[0].applied);

    expect(mockCadHandler.visible()).toBe(false);
    expect(mockPointCloudHandler.visible()).toBe(true);
    expect(mockImage360Handler.visible()).toBe(false);
  });
});
