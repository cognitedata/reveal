import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { LayersButtonProps } from '../LayersButton';
import { defaultLayersButtonDependencies, LayersButtonContext } from '../LayersButton.context';
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
import { type ReactNode, type ReactElement } from 'react';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';

describe(LayersButtonStrip.name, () => {
  const defaultProps = {
    layersState: {
      cadLayers: [{ revisionId: 456, applied: true, index: 0 }],
      pointCloudLayers: [{ revisionId: 123, applied: true, index: 0 }],
      image360Layers: [{ siteId: 'site-id', applied: true }]
    },
    setLayersState: vi.fn(),
    defaultLayerConfiguration: undefined
  } as const satisfies LayersButtonProps;

  const defaultDependencies = getMocksByDefaultDependencies(defaultLayersButtonDependencies);

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <LayersButtonContext.Provider value={defaultDependencies}>
      {children}
    </LayersButtonContext.Provider>
  );

  beforeEach(() => {
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
    defaultDependencies.useReveal.mockReturnValue(viewerMock);
    defaultDependencies.use3dModels.mockReturnValue([cadMock, cadMock]);
  });

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

    const mockModels: CogniteModel[] = [cadMock, cadMock];
    viewerModelsMock.mockReturnValue(mockModels);
    const mockImage360Collection = createImage360ClassicMock();
    viewerImage360CollectionsMock.mockReturnValue([mockImage360Collection]);

    const { rerender } = render(<LayersButtonStrip {...defaultProps} />, {
      wrapper
    });

    const newLayersState = {
      cadLayers: [{ revisionId: 456, applied: false, index: 0 }],
      pointCloudLayers: [{ revisionId: 123, applied: true, index: 0 }],
      image360Layers: [{ siteId: 'site-id', applied: false }]
    };

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
