import { GeometryTypeEnum, PolygonFilter } from '@cognite/sdk-wells-v3';
import { GeoJson } from '@cognite/seismic-sdk-js';

export const getPolygonFilter = (
  geoFilter: GeoJson[]
): PolygonFilter | undefined => {
  if (!geoFilter || geoFilter.length === 0) {
    return undefined;
  }

  // there is another case where geoFilter can have a geometry that is
  // of type: GeometryTypeEnum.Wkt
  // but we don't send this from discover yet, so we don't check for it.

  return {
    geometry: `${JSON.stringify(geoFilter[0].geometry)}`,
    geometryType: GeometryTypeEnum.GeoJson,
    crs: 'EPSG:4326',
  };
};
