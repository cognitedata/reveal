import { render } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { LayersButtonProps } from '../LayersButton';
import { LayersButtonContext, type LayersButtonDependencies } from '../LayersButton.context';
import {
  createCadHandlerMock,
  createPointCloudHandlerMock,
  createImage360HandlerMock
} from '#test-utils/fixtures/modelHandler';
import {
  viewerMock,
  viewerImage360CollectionsMock,
  viewerModelsMock
} from '#test-utils/fixtures/viewer';
import { type CogniteModel } from '@cognite/reveal';
import { cadMock } from '#test-utils/fixtures/cadModel';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';
import { LayersButtonStrip } from './LayersButtonsStrip';
import { type ModelLayerHandlers } from '../types';
import { type ReactNode, type ReactElement } from 'react';
import { ModelLayerSelection } from './ModelLayerSelection';

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
  useReveal: vi.fn(() => viewerMock),
  use3dModels: vi.fn(() => [cadMock, cadMock]),
  ModelLayerSelection
};

const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
  <LayersButtonContext.Provider value={defaultDependencies}>
    {children}
  </LayersButtonContext.Provider>
);

describe(LayersButtonStrip.name, () => {
  test('renders without crashing', () => {
    const mockModels: CogniteModel[] = [cadMock, cadMock];
    viewerModelsMock.mockReturnValue(mockModels);
    const mockImage360Collection = createImage360ClassicMock();
    viewerImage360CollectionsMock.mockReturnValue([mockImage360Collection]);

    const { getAllByRole } = render(<LayersButtonStrip {...defaultProps} />, {
      wrapper
    });

    expect(getAllByRole('img', { name: 'CubeIcon' })).toBeTruthy();
    expect(getAllByRole('img', { name: 'PointCloudIcon' })).toBeTruthy();
    expect(getAllByRole('img', { name: 'View360Icon' })).toBeTruthy();
  });

  test('should update viewer models visibility when layersState changes', () => {
    const mockModels: CogniteModel[] = [cadMock, cadMock];
    viewerModelsMock.mockReturnValue(mockModels);
    const mockImage360Collection = createImage360ClassicMock();
    viewerImage360CollectionsMock.mockReturnValue([mockImage360Collection]);
    const ModelLayerSelection = vi.fn(({ label }) => <div>{label}</div>);
    const useModelHandlers = vi.fn((): [ModelLayerHandlers, () => void] => [
      {
        cadHandlers: [mockCadHandler],
        pointCloudHandlers: [mockPointCloudHandler],
        image360Handlers: [mockImage360Handler]
      },
      vi.fn()
    ]);

    const newProps: LayersButtonDependencies & {
      setLayersState: typeof defaultProps.setLayersState;
    } = {
      setLayersState: defaultProps.setLayersState,
      ...defaultDependencies,
      useModelHandlers,
      useSyncExternalLayersState: vi.fn(),
      ModelLayerSelection
    };

    const { rerender } = render(<LayersButtonStrip {...newProps} />, {
      wrapper
    });

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
    rerender(<LayersButtonStrip {...defaultProps} layersState={newLayersState} />);

    mockCadHandler.setVisibility(newLayersState.cadLayers[0].applied);
    mockPointCloudHandler.setVisibility(newLayersState.pointCloudLayers[0].applied);
    mockImage360Handler.setVisibility(newLayersState.image360Layers[0].applied);

    expect(mockCadHandler.visible()).toBe(false);
    expect(mockPointCloudHandler.visible()).toBe(true);
    expect(mockImage360Handler.visible()).toBe(false);
  });

  test('renders with empty layersState', () => {
    const mockModels: CogniteModel[] = [cadMock, cadMock];
    viewerModelsMock.mockReturnValue(mockModels);
    const mockImage360Collection = createImage360ClassicMock();
    viewerImage360CollectionsMock.mockReturnValue([mockImage360Collection]);

    const { getAllByRole } = render(<LayersButtonStrip {...defaultProps} layersState={{}} />, {
      wrapper
    });

    expect(getAllByRole('img', { name: 'CubeIcon' })).toBeTruthy();
    expect(getAllByRole('img', { name: 'PointCloudIcon' })).toBeTruthy();
    expect(getAllByRole('img', { name: 'View360Icon' })).toBeTruthy();
  });
});
