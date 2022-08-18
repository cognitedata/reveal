import mapboxgl from 'maplibre-gl';
import {
  Feature,
  MultiLineString,
  MultiPolygon,
  Point,
  Polygon,
  Position,
} from '@turf/helpers';

import { MapProps, MapType } from '../types';
import { isPolygon } from '../utils/isPolygon';

import { useDeepEffect } from './useDeep';

const isSafe = (possibleGoodCoords: number[]) => {
  const safeCoords = possibleGoodCoords;
  if (safeCoords.length < 2) {
    throw new Error('Too few numbers in coordinates');
  }
  return safeCoords as [number, number];
};

const fitToBounds = (map: MapType, coordinates: Position[]) => {
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
      if (error && 'message' in (error as { message: string })) {
        throw new Error((error as { message: string }).message);
      }
    }
  }
};

const zoomToFeature = ({
  feature,
  map,
}: {
  map: MapType;
  feature: Feature;
}) => {
  if (!map) return;
  if (!feature) return;
  if (!feature.geometry) return;

  if (isPolygon(feature)) {
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
    zoomToFeature({
      map,
      feature: { ...feature, geometry: feature.geometry.geometries[0] },
    });
  } else {
    throw new Error(`Unknown feature type, ${feature.geometry.type}`);
  }
};

export const useZoomToFeature = ({
  map,
  zoomTo,
}: {
  map?: MapType;
  zoomTo: MapProps['focusedFeature'];
}) => {
  useDeepEffect(() => {
    if (map && zoomTo) {
      zoomToFeature({ map, feature: zoomTo });
    }
  }, [zoomTo, !!map]);
};
