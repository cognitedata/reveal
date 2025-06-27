import { render, screen } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import type { PropsWithChildren, ReactElement } from 'react';
import { LayersButton } from './LayersButton';
import type { LayersButtonProps } from './LayersButton';
import { defaultLayersButtonDependencies, LayersButtonContext } from './LayersButton.context';
import userEvent from '@testing-library/user-event';

import { type ModelLayerHandlers } from './types';
import { cadMock } from '#test-utils/fixtures/cadModel';
import { viewerMock } from '#test-utils/fixtures/viewer';
import {
  createCadHandlerMock,
  createPointCloudHandlerMock,
  createImage360HandlerMock
} from '#test-utils/fixtures/modelHandler';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';

describe(LayersButton.name, () => {
  const defaultProps = {
    layersState: {
      cadLayers: [{ revisionId: 456, applied: true, index: 0 }],
      pointCloudLayers: [{ revisionId: 123, applied: true, index: 0 }],
      image360Layers: [{ siteId: 'site-id', applied: true }]
    },
    setLayersState: vi.fn()
  } as const satisfies LayersButtonProps;

  const defaultDependencies = getMocksByDefaultDependencies(defaultLayersButtonDependencies);

  const wrapper = ({ children }: PropsWithChildren): ReactElement => {
    return (
      <LayersButtonContext.Provider value={defaultDependencies}>
        {children}
      </LayersButtonContext.Provider>
    );
  };

  beforeAll(() => {
    defaultDependencies.useModelHandlers.mockImplementation(
      (): [ModelLayerHandlers, () => void] => [
        {
          cadHandlers: [createCadHandlerMock()],
          pointCloudHandlers: [createPointCloudHandlerMock()],
          image360Handlers: [createImage360HandlerMock()]
        },
        vi.fn()
      ]
    );
    defaultDependencies.useReveal.mockImplementation(() => viewerMock);
    defaultDependencies.use3dModels.mockImplementation(() => [cadMock, cadMock]);
    defaultDependencies.ModelLayerSelection.mockImplementation(({ label }) => <div>{label}</div>);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders without crashing', () => {
    const { getByRole } = render(<LayersButton {...defaultProps} />, {
      wrapper
    });

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

    expect(screen.getByText('CAD models').closest('[data-test-id="layers-button"]')).not.toBeNull();
  });

  test('should update viewer models visibility when layersState changes', () => {
    const mockCadHandler = createCadHandlerMock();
    const mockPointCloudHandler = createPointCloudHandlerMock();
    const mockImage360Handler = createImage360HandlerMock();
    defaultDependencies.useModelHandlers.mockReturnValue([
      {
        cadHandlers: [mockCadHandler],
        pointCloudHandlers: [mockPointCloudHandler],
        image360Handlers: [mockImage360Handler]
      },
      vi.fn()
    ]);
    const { rerender } = render(<LayersButton {...defaultProps} />, {
      wrapper
    });

    const newLayersState = {
      cadLayers: [{ revisionId: 456, applied: false, index: 0 }],
      pointCloudLayers: [{ revisionId: 123, applied: true, index: 0 }],
      image360Layers: [{ siteId: 'site-id', applied: false }]
    };

    defaultProps.setLayersState(newLayersState);

    rerender(<LayersButton {...defaultProps} layersState={newLayersState} />);

    mockCadHandler.setVisibility(newLayersState.cadLayers[0].applied);
    mockPointCloudHandler.setVisibility(newLayersState.pointCloudLayers[0].applied);
    mockImage360Handler.setVisibility(newLayersState.image360Layers[0].applied);

    expect(mockCadHandler.visible()).toBe(false);
    expect(mockPointCloudHandler.visible()).toBe(true);
    expect(mockImage360Handler.visible()).toBe(false);
  });
});
