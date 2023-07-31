/* eslint-disable jest/no-export */
import { GeoJson } from '@cognite/seismic-sdk-js';

export const getMockGeo = (extras: Partial<GeoJson> = {}) =>
  ({
    id: 'id1',
    type: 'type1',
    // properties?: any;
    geometry: {
      type: 'nice',
      coordinates: [],
    },
    ...extras,
  } as GeoJson);

describe('Map test utils', () => {
  it('should be ok', () => {
    expect(getMockGeo({ type: 'overridden' }).type).toEqual('overridden');
  });
});
