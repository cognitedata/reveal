import { renderHook } from '@testing-library/react-hooks';
import mapboxgl from 'maplibre-gl';

import { useZoomToFeature } from '../useZoomToFeature';

const getMockFeature = () => {
  return {
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [1, 1],
          [2, 2],
          [3, 3],
        ],
      ],
    },
  };
};

describe('useZoomToFeature', () => {
  it('should be ok', () => {
    const map = { fitBounds: jest.fn() };

    const { result } = renderHook(() =>
      useZoomToFeature(map as unknown as mapboxgl.Map)
    );

    const zoomer = result.current;

    zoomer(getMockFeature());

    expect(map.fitBounds).toBeCalledWith(
      { _ne: { lat: 3, lng: 3 }, _sw: { lat: 1, lng: 1 } },
      { maxZoom: 8, padding: 20 }
    );
  });
});
