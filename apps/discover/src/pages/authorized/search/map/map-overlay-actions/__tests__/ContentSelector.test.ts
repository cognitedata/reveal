import { screen, fireEvent } from '@testing-library/react';
import noop from 'lodash/noop';

import { testRenderer } from '__test-utils/renderer';
import { Asset } from 'modules/map/types';

import { useLayers } from '../../hooks/useLayers';
import { ContentSelector, Props } from '../ContentSelector';

jest.mock('../../hooks/useLayers', () => ({
  useLayers: jest.fn(),
}));

describe('Favourite Content', () => {
  const getPage = (viewProps?: Props) =>
    testRenderer(ContentSelector, undefined, viewProps);

  afterEach(async () => jest.clearAllMocks());

  const defaultTestInit = async (viewProps?: Partial<Props>) => {
    const props: Props = {
      assets: [],
      zoomToAsset: noop,
      ...viewProps,
    };

    return {
      ...getPage(props),
    };
  };

  it('should open the Zoom to assets panel and select one of the assets', async () => {
    (useLayers as any).mockImplementation(() => []);

    const asset1: Asset = {
      name: 'testAsset1',
      geometry: { type: 'Point', coordinates: [2, 1] },
    };

    const handleZoomToAsset = jest.fn();

    await defaultTestInit({
      zoomToAsset: handleZoomToAsset,
      assets: [asset1],
    });

    const assetButton = await screen.findByTestId('map-button-assets');

    fireEvent.click(assetButton);

    const asset = await screen.findByTestId(`asset-${asset1.name}`);

    fireEvent.click(asset);

    expect(handleZoomToAsset).toBeCalled();
    expect(handleZoomToAsset).toBeCalledWith(asset1.geometry);
    expect(assetButton).toBeInTheDocument();
  });
});
