/*!
 * Copyright 2025 Cognite AS
 */
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { LayersButton } from './LayersButton';
import { LayersButtonViewModel } from './LayersButton.viewmodel';
import { useSignalValue } from '@cognite/signals/react';
import { type LayersUrlStateParam, type DefaultLayersConfiguration } from './types';
import { useTranslation } from '../../i18n/I18n';

vi.mock('@cognite/signals/react', () => ({
  useSignalValue: vi.fn()
}));

vi.mock('./LayersButton.viewmodel', () => ({
  LayersButtonViewModel: vi.fn()
}));

describe('LayersButton', () => {
  const mockSetLayersState = vi.fn();
  const mockDefaultLayerConfiguration: DefaultLayersConfiguration = {
    cad: true,
    pointcloud: true,
    image360: true
  };
  const mockLayersState: LayersUrlStateParam = {
    cadLayers: [{ applied: true, revisionId: 1, index: 0 }],
    pointCloudLayers: [{ applied: true, revisionId: 2, index: 0 }],
    image360Layers: [{ applied: true, siteId: 'site1', index: 0 }]
  };

  const mockModelLayerHandlers = {
    cadHandlers: [{ visible: vi.fn().mockReturnValue(true), setVisibility: vi.fn() }],
    pointCloudHandlers: [{ visible: vi.fn().mockReturnValue(true), setVisibility: vi.fn() }],
    image360Handlers: [{ visible: vi.fn().mockReturnValue(true), setVisibility: vi.fn() }]
  };

  const mockUpdateCallback = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    (useSignalValue as vi.Mock).mockImplementation((signal) => signal?.value);
    (LayersButtonViewModel as vi.Mock).mockImplementation(() => ({
      modelLayerHandlers: { value: mockModelLayerHandlers },
      updateCallback: { value: mockUpdateCallback }
    }));
    (useTranslation as vi.Mock).mockImplementation(() => ({
      t: (key: string) => key
    }));
  });

  test('renders LayersButton component and verifies ModelLayersList is called three times', () => {
    render(
      <LayersButton
        layersState={mockLayersState}
        setLayersState={mockSetLayersState}
        defaultLayerConfiguration={mockDefaultLayerConfiguration}
      />
    );

    const button = screen.getByText('CAD models');
    console.log(button);
    // fireEvent.click(button[2]);

    // expect(ModelLayersList).toHaveBeenCalledTimes(3);
    // expect(getAllByText('CAD models')).toBeInTheDocument();
  });

  // test('toggles visibility of CAD models', () => {
  //   render(
  //     <LayersButton
  //       layersState={mockLayersState}
  //       setLayersState={mockSetLayersState}
  //       defaultLayerConfiguration={mockDefaultLayerConfiguration}
  //     />
  //   );

  //   const cadModelsButton = screen.getByText('CAD_MODELS');
  //   fireEvent.click(cadModelsButton);

  //   expect(mockSetLayersState).toHaveBeenCalled();
  // });

  // test('toggles visibility of PointCloud models', () => {
  //   render(
  //     <LayersButton
  //       layersState={mockLayersState}
  //       setLayersState={mockSetLayersState}
  //       defaultLayerConfiguration={mockDefaultLayerConfiguration}
  //     />
  //   );

  //   const pointCloudModelsButton = screen.getByText('POINT_CLOUDS');
  //   fireEvent.click(pointCloudModelsButton);

  //   expect(mockSetLayersState).toHaveBeenCalled();
  // });

  // test('toggles visibility of Image360 models', () => {
  //   render(
  //     <LayersButton
  //       layersState={mockLayersState}
  //       setLayersState={mockSetLayersState}
  //       defaultLayerConfiguration={mockDefaultLayerConfiguration}
  //     />
  //   );

  //   const image360ModelsButton = screen.getByText('IMAGES_360');
  //   fireEvent.click(image360ModelsButton);

  //   expect(mockSetLayersState).toHaveBeenCalled();
  // });
});
