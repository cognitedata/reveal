import * as React from 'react';
import mapboxgl from 'maplibre-gl';
import {
  Feature,
  MultiLineString,
  MultiPolygon,
  Point,
  Polygon,
  Position,
} from '@turf/helpers';

const isSafe = (possibleGoodCoords: number[]) => {
  const safeCoords = possibleGoodCoords;
  if (safeCoords.length < 2) {
    throw new Error('Too few numbers in coordinates');
  }
  return safeCoords as [number, number];
};

const fitToBounds = (map: mapboxgl.Map, coordinates: Position[]) => {
  if (coordinates) {
    try {
      const tupleCoords = isSafe(coordinates[0]);

      const defaultBounds = new mapboxgl.LngLatBounds(tupleCoords, tupleCoords);
      const bounds = coordinates.reduce(
        (result: typeof defaultBounds, coordinate) => {
          // @ts-expect-error Target requires 4 element(s) but source may have fewer
          return result.extend(coordinate);
        },
        defaultBounds
      );
      map.fitBounds(bounds, {
        padding: 20,
        maxZoom: 8,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error', error);
      // if (typeof error.message === 'string') {
      //   throw new Error(error.message);
      // }
    }
  }
};

export const useZoomToFeature = (map: mapboxgl.Map) => {
  const zoomToFeature = React.useCallback(
    (feature: Feature) => {
      if (!map) return;
      if (!feature) return;
      if (!feature.geometry) return;

      if (feature.geometry.type === 'Polygon') {
        fitToBounds(map, (feature.geometry as Polygon).coordinates[0]);
      } else if (feature.geometry.type === 'Point') {
        fitToBounds(map, [
          (feature.geometry as Point).coordinates,
          (feature.geometry as Point).coordinates,
        ]);
      } else if (feature.geometry.type === 'MultiPolygon') {
        fitToBounds(map, (feature.geometry as MultiPolygon).coordinates[0][0]);
      } else if (feature.geometry.type === 'MultiLineString') {
        fitToBounds(map, (feature.geometry as MultiLineString).coordinates[0]);
      } else if (
        feature.geometry.type === 'GeometryCollection' &&
        'geometries' in feature.geometry
      ) {
        zoomToFeature({ ...feature, geometry: feature.geometry.geometries[0] });
      } else {
        throw new Error(`Unknown feature type, ${feature.geometry.type}`);
      }
    },
    [!!map]
  );

  return zoomToFeature;
};
