import isArray from 'lodash/isArray';

import { DocumentFilterGeoJsonIntersects } from '@cognite/sdk';
import { GeoJson, GeoJsonObject } from '@cognite/seismic-sdk-js';

export const getGeoFilter = (
  geoJson: GeoJson[]
): DocumentFilterGeoJsonIntersects | null => {
  const coordinates = geoJson.map((item) => {
    const geometry = item.geometry as GeoJsonObject;
    if (isArray(geometry.coordinates)) {
      return geometry.coordinates[0] as unknown as [number, number];
    }

    return [0, 0];
  });
  return coordinates && coordinates.length > 0
    ? {
        geojsonIntersects: {
          property: ['geoLocation'],
          geometry: {
            type: 'Polygon',
            coordinates,
          },
        },
      }
    : null;
};
