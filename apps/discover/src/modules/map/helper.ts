import centroid from '@turf/centroid';
import {
  polygon,
  lineString,
  multiLineString,
  GeometryCollection,
  multiPoint,
  Feature as TurfFeature,
} from '@turf/helpers';
import isNil from 'lodash/isNil';
import { isOfType } from 'utils/type';

import { Geometry, Point, GeoJsonGeometryTypes } from '@cognite/seismic-sdk-js';

import { SeismicFile } from 'modules/seismicSearch/types';

type FeatureForSet = Geometry & {
  tooltip?: string;
};

// -todo: find where this is setup for mapbox and link the types:
export type FeatureTypes = 'Selected' | 'Preview';
function getFeature(feature: FeatureForSet, type: FeatureTypes, id: string) {
  if (feature.type === 'Polygon') {
    return polygon([...feature.coordinates], {
      id,
      name: 'Polygon',
      color: '#FFFFFF',
      type,
      description: feature.tooltip,
    });
  }
  if (feature.type === 'MultiPoint') {
    return multiPoint([...feature.coordinates], {
      id,
      name: 'MultiPoint',
      color: '#FFFFFF',
      type,
      description: feature.tooltip,
    });
  }
  if (feature.type === 'LineString') {
    return lineString([...feature.coordinates], {
      id,
      name: 'LineString',
      color: '#FFFFFF',
      type,
      description: feature.tooltip,
    });
  }
  if (feature.type === 'MultiLineString') {
    return multiLineString([...feature.coordinates], {
      id,
      name: 'LineString',
      color: '#FFFFFF',
      type,
      description: feature.tooltip,
    });
  }

  // We don't want to draw the Point on the map
  if (feature.type === 'Point') {
    return '';
  }
  try {
    // @ts-expect-error this is an unknown type, wrapped in a try block, just incase it will succeed!
    return multiLineString([...feature.coordinates], {
      id,
      name: 'multiLineString',
      color: '#FFFFFF',
      type,
      description: feature.tooltip,
    });
  } catch (err) {
    console.error('Unknown feature type, geo', { type: feature.type });
    return '';
  }
}

const flatten = (arrays: any[]) => [].concat(...arrays);
function createFeatureSet(
  surveys: SeismicFile[],
  suffix: FeatureTypes
): TurfFeature[] {
  return flatten(
    surveys
      .filter((survey) => !isNil(survey.geometry))
      .map((survey) => {
        if (!survey.geometry) {
          return [];
        }

        if (isOfType<GeometryCollection>(survey.geometry, 'geometries')) {
          return survey.geometry.geometries.map((feature) => {
            return {
              id: survey.id,
              ...getFeature(feature, suffix, survey.id),
            };
          });
        }

        if ('coordinates' in survey.geometry) {
          return {
            id: survey.id,
            ...getFeature(survey.geometry, suffix, survey.id),
          };
        }

        console.error('Unknown feature type, geo', {
          type: survey.geometry.type,
        });
        return '';
      })
  );
}

/**
 * Translates CDF geotypes to valid GeoJson types to use in mapbox.
 * polygon -> Polygon
 */
const translateGeoType = (type: string): GeoJsonGeometryTypes => {
  if (type.length > 0) {
    return (type.charAt(0).toUpperCase() +
      type.slice(1)) as GeoJsonGeometryTypes;
  }

  // default to polygon!
  return 'Polygon';
};

/**
 * Converts a polygon geometry to a point geometry using centroid.
 */
const convertPolygonToPoint = (feature: Geometry): Point => {
  if (feature.type === 'GeometryCollection') {
    return centroid(feature).geometry;
  }
  return centroid({
    type: normalizeGeoJsonType(feature.type),
    coordinates: 'coordinates' in feature ? feature?.coordinates : [],
  }).geometry;
};

const normalizeGeoJsonType = (
  type: GeoJsonGeometryTypes
): GeoJsonGeometryTypes => {
  // INFO
  // It happened that the data from backend had the wrong type for example 'Linestring'.
  // Here we can map those failing cases.
  if (type.toLowerCase() === 'linestring') {
    return 'LineString';
  }

  return type;
};

export {
  getFeature,
  translateGeoType,
  convertPolygonToPoint,
  createFeatureSet,
};
