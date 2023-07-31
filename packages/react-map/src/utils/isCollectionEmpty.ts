import { MapFeatureCollection } from '../types';

export const isCollectionEmpty = (collection?: MapFeatureCollection) => {
  if (collection) {
    if (collection?.features?.length > 0) {
      return false;
    }

    // console.log('Features:', collection?.features);
  }

  return true;
};
