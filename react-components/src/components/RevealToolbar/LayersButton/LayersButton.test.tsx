/*!
 * Copyright 2025 Cognite AS
 */
import { render } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { PropsWithChildren, ReactElement } from 'react';
import { LayersButton } from './LayersButton';
import type { LayersButtonProps } from './LayersButton';
import { LayersButtonContext, type LayersButtonDependencies } from './LayersButton.context';
import {
  createCadHandlerMock,
  createPointCloudHandlerMock,
  createImage360HandlerMock
} from '../../../../tests/tests-utilities/fixtures/modelHandler';
import { type ModelLayerHandlers } from './types';

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
    useSyncExternalLayersState: vi.fn(),
    ModelLayerSelection: vi.fn(({ label }) => <div>{label}</div>)
  };

  test('renders without crashing', () => {
    const wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <LayersButtonContext.Provider value={defaultDependencies}>
        {children}
      </LayersButtonContext.Provider>
    );
    const { getByRole } = render(<LayersButton {...defaultProps} />, { wrapper });

    // Validate the presence of specific UI elements
    expect(
      getByRole('button', { name: 'Filter 3D resource layers' }).className.includes('cogs-button')
    ).toBe(true);
  });

  test('should update viewer models visibility when layersState changes', () => {
    const ModelLayerSelection = vi.fn(({ label }) => <div>{label}</div>);
    const newProps: LayersButtonDependencies & {
      setLayersState: typeof defaultProps.setLayersState;
    } = {
      setLayersState: defaultProps.setLayersState,
      ...defaultDependencies,
      useModelHandlers: vi.fn(() => [
        {
          cadHandlers: [mockCadHandler],
          pointCloudHandlers: [mockPointCloudHandler],
          image360Handlers: [mockImage360Handler]
        },
        () => {}
      ]) as unknown as LayersButtonDependencies['useModelHandlers'],
      useSyncExternalLayersState: vi.fn(),
      ModelLayerSelection
    };

    const wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <LayersButtonContext.Provider value={newProps}>{children}</LayersButtonContext.Provider>
    );
    const { rerender } = render(<LayersButton {...defaultProps} />, { wrapper });

    // Change layersState
    const newLayersState = {
      cadLayers: [{ revisionId: 456, applied: false, index: 0 }],
      pointCloudLayers: [{ revisionId: 123, applied: true, index: 0 }],
      image360Layers: [{ siteId: 'site-id', applied: false }]
    };
    if (newProps.setLayersState !== null && newProps.setLayersState !== undefined) {
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
