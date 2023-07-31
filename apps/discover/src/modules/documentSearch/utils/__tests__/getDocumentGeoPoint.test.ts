import { getMockDocument } from '__test-utils/fixtures/document';

import { getDocumentGeoPoint } from '../getGeoPoint';

describe('getDocumentGeoPoint', () => {
  it('should be ok for docs without geo points', () => {
    // @ts-expect-error - this is ok, testing when geolocation is bad
    const doc = getMockDocument({ geolocation: false });
    expect(getDocumentGeoPoint(doc)).toEqual(undefined);
  });

  it('should get a nice point for does with geo', () => {
    const doc = getMockDocument({
      geolocation: {
        coordinates: [
          [
            [1.8325, 57.9124],
            [1.8831, 57.9124],
            [1.8831, 57.9329],
            [1.8325, 57.9329],
            [1.8325, 57.9124],
          ],
        ],
        type: 'Polygon',
      },
    });
    expect(getDocumentGeoPoint(doc)).toEqual({
      type: 'Point',
      coordinates: [1.85274, 57.9206],
    });
  });

  it('should get geo point when passed geolocation is a point', () => {
    const doc = getMockDocument({
      geolocation: {
        coordinates: [1.4, 23.323],
        type: 'Point',
      },
    });
    expect(getDocumentGeoPoint(doc)).toEqual({
      coordinates: [1.4, 23.323],
      type: 'Point',
    });
  });
});
