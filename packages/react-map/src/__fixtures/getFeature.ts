import { feature } from '@turf/helpers';

export const getFeature = () =>
  feature({
    type: 'Polygon',
    coordinates: [
      [110, 50],
      [110, 110],
      [200, 200],
    ],
  });
