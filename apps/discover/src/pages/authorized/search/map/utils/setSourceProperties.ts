import { GeoJson } from '@cognite/seismic-sdk-js';

import { MapDataSource } from 'modules/map/types';

export const setSourceProperties = (
  sources: MapDataSource[],
  sourceId: string,
  key: string,
  value: string
) => {
  return sources.map((row) => {
    if (row.id === sourceId) {
      return {
        ...row,
        data: {
          ...row.data,
          features: row.data.features.map((feature: GeoJson) => ({
            ...feature,
            properties: {
              ...feature.properties,
              [key]: value,
            },
          })),
        },
      };
    }
    return row;
  });
};
