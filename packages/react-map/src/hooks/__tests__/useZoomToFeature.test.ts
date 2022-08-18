import { renderHook } from '@testing-library/react-hooks';
import {
  getFeature,
  getFeatureInvalidCoordinates,
  getFeatureTooFewPoints,
} from '__fixtures/getFeature';

import { MapType } from '../../types';
import { useZoomToFeature } from '../useZoomToFeature';

describe('useZoomToFeature', () => {
  it('should be ok', () => {
    const map = { fitBounds: jest.fn() };

    renderHook(() =>
      useZoomToFeature({
        map: map as unknown as MapType,
        zoomTo: getFeature(),
      })
    );

    expect(map.fitBounds).toBeCalledWith(
      { _ne: { lat: 80, lng: 59 }, _sw: { lat: 50, lng: 55 } },
      { maxZoom: 8, padding: 20 }
    );
  });

  it('should fail with bad lat/lng', () => {
    const map = { fitBounds: jest.fn() };

    const { result } = renderHook(() =>
      useZoomToFeature({
        map: map as unknown as MapType,
        zoomTo: getFeatureInvalidCoordinates(),
      })
    );

    expect(result.error).toEqual(
      Error('Invalid LngLat latitude value: must be between -90 and 90')
    );
  });

  it('should fail with too few points', () => {
    const map = { fitBounds: jest.fn() };

    const { result } = renderHook(() =>
      useZoomToFeature({
        map: map as unknown as MapType,
        zoomTo: getFeatureTooFewPoints(),
      })
    );

    expect(result.error).toEqual(
      Error(
        '`LngLatLike` argument must be specified as a LngLat instance, an object {lng: <lng>, lat: <lat>}, an object {lon: <lng>, lat: <lat>}, or an array of [<lng>, <lat>]'
      )
    );
  });
});
