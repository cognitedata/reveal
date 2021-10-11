import { getMockDocument } from '__test-utils/fixtures/document';

import { getDocumentGeoPoint } from '../getGeoPoint';

describe('getDocumentGeoPoint', () => {
  it('should be ok for docs without geo points', () => {
    const doc = getMockDocument();
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
});
