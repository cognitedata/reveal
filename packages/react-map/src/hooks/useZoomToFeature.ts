import * as React from 'react';
import mapboxgl, { LngLatLike } from 'maplibre-gl';

export const useZoomToFeature = (map: mapboxgl.Map) => {
  const zoomToFeature = React.useCallback(
    (feature: any) => {
      if (!map) return;
      if (!feature) return;
      const geo = feature.geometry || feature.geoJson;
      if (!geo) return;

      const fitToBounds = (coordinates: [LngLatLike, LngLatLike]) => {
        if (coordinates) {
          try {
            const defaultBounds = new mapboxgl.LngLatBounds(
              coordinates[0],
              coordinates[0]
            );
            const bounds = coordinates.reduce(
              (result: typeof defaultBounds, coordinate) => {
                return result.extend(coordinate);
              },
              defaultBounds
            );
            map.fitBounds(bounds, {
              padding: 20,
              maxZoom: 8,
            });
          } catch (error) {
            // we should look into throwing
            // eslint-disable-next-line no-console
            console.error(error);
          }
        }
      };

      if (geo.type === 'Polygon') {
        fitToBounds(geo.coordinates[0]);
      } else if (geo.type === 'MultiPolygon') {
        fitToBounds(geo.coordinates[0][0]);
      } else if (geo.type === 'MultiLineString') {
        fitToBounds(geo.coordinates);
      } else if (geo.type === 'GeometryCollection') {
        zoomToFeature({ geometry: geo.geometries[0] });
      } else {
        // we should look into throwing
        // eslint-disable-next-line no-console
        console.error('Unknown feature type, geo', geo);
      }
    },
    [map]
  );

  return zoomToFeature;
};
