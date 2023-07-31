import { Feature, feature, Geometry } from '@turf/helpers';

// https://datatracker.ietf.org/doc/html/rfc7946#appendix-A.3

export const getFeature = (): Feature<Geometry> =>
  feature({
    type: 'Polygon',
    coordinates: [
      [
        [58, 50],
        [59, 51],
        [55, 80],
      ],
    ],
  });

export const getFeatureTwo = (): Feature<Geometry> =>
  feature({
    type: 'Polygon',
    coordinates: [
      [
        [12.48339843749855, 63.21474351071274],
        [1.9365234374986073, 63.33332284919541],
        [3.0791015624984652, 60.087773934248276],
        [12.659179687499147, 60.54477237805477],
        [12.48339843749855, 63.21474351071274],
      ],
    ],
  });

// error case 1
export const getFeatureInvalidCoordinates = () =>
  feature({
    type: 'Polygon',
    coordinates: [
      [
        [99, 0],
        [200, 200],
      ],
    ],
  });

// error case 2
export const getFeatureTooFewPoints = () =>
  feature({
    type: 'Polygon',
    coordinates: [
      [99, 0],
      [200, 200],
    ],
  });
