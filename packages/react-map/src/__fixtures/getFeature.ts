import { feature } from '@turf/helpers';

// https://datatracker.ietf.org/doc/html/rfc7946#appendix-A.3

export const getFeature = () =>
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
