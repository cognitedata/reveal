import { GeoJson } from '@cognite/seismic-sdk-js';

export const getReducedGeoFilter = (filter: GeoJson[]) => {
  const reduced = filter.map((geo: GeoJson) => ({
    geometry: { ...geo.geometry },
    id: geo.id,
  }));

  return reduced;
};
