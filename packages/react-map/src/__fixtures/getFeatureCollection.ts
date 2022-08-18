import { featureCollection } from '@turf/helpers';

import { MapFeatureCollection } from '../types';

import { getFeatureTwo } from './getFeature';

export const getFeatureCollection = (): MapFeatureCollection => {
  return featureCollection([getFeatureTwo()]);
};
