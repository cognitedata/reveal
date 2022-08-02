import { renderHook } from '@testing-library/react-hooks';
import mapboxgl from 'maplibre-gl';
import { getFeature } from '__fixtures/getFeature';

import { useZoomToFeature } from '../useZoomToFeature';

describe('useZoomToFeature', () => {
  it('should be ok', () => {
    const map = { fitBounds: jest.fn() };

    const { result } = renderHook(() =>
      useZoomToFeature(map as unknown as mapboxgl.Map)
    );

    const zoomer = result.current;

    zoomer(getFeature());

    expect(map.fitBounds).toBeCalledWith(
      { _ne: { lat: 80, lng: 59 }, _sw: { lat: 50, lng: 55 } },
      { maxZoom: 8, padding: 20 }
    );
  });
});
