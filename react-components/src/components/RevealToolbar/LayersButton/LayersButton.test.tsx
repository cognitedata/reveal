/*!
 * Copyright 2025 Cognite AS
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PropsWithChildren, ReactElement } from 'react';
import { LayersButton } from './LayersButton';
import type { LayersButtonProps } from './LayersButton';
import { LayersButtonContext, type LayersButtonDependencies } from './LayersButton.context';

describe(LayersButton.name, () => {
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
    useModelHandlers: vi.fn(() => [
      vi.fn(() => ({
        cadHandlers: [],
        pointCloudHandlers: [],
        image360Handlers: []
      })) as any,
      vi.fn() as any
    ]),
    useSyncExternalLayersState: vi.fn(),
    ModelLayerSelection: vi.fn(({ label }) => <div>{label}</div>)
  };

  it('renders without crashing', () => {
    const wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <LayersButtonContext.Provider value={defaultDependencies}>
        {children}
      </LayersButtonContext.Provider>
    );
    render(<LayersButton {...defaultProps} />, { wrapper });
    screen.debug();
  });

  it('should update viewer models visibility when layersState changes', () => {
    const setLayersState = vi.fn();
    const layersState = {
      cadLayers: [{ revisionId: 456, applied: true, index: 0 }],
      pointCloudLayers: [{ revisionId: 123, applied: true, index: 0 }],
      image360: [{ siteId: 'site-id', applied: true }]
    };
    const viewModel = {
      modelLayerHandlers: {
        cadHandlers: [{ setVisible: vi.fn() }],
        pointCloudHandlers: [{ setVisible: vi.fn() }],
        image360Handlers: [{ setVisible: vi.fn() }]
      },
      updateCallback: vi.fn(),
      ModelLayerSelection: vi.fn(({ label }) => <div>{label}</div>)
    };

    const wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <LayersButtonContext.Provider value={defaultDependencies}>
        {children}
      </LayersButtonContext.Provider>
    );
    render(<LayersButton layersState={layersState} setLayersState={setLayersState} />, { wrapper });

    // Change layersState
    const newLayersState = {
      cadLayers: [{ revisionId: 456, applied: false, index: 0 }],
      pointCloudLayers: [{ revisionId: 123, applied: true, index: 0 }],
      image360: [{ siteId: 'site-id', applied: false }]
    };
    setLayersState(newLayersState);

    expect(viewModel.modelLayerHandlers.cadHandlers[0].setVisible).toHaveBeenCalledWith(false);
    expect(viewModel.modelLayerHandlers.pointCloudHandlers[0].setVisible).toHaveBeenCalledWith(
      true
    );
    expect(viewModel.modelLayerHandlers.image360Handlers[0].setVisible).toHaveBeenCalledWith(false);
  });
});
