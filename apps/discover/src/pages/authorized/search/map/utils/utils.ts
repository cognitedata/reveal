import { Feature, FeatureCollection, Position } from '@turf/helpers';
import isArray from 'lodash/isArray';
import pick from 'lodash/pick';
import { MapboxGeoJSONFeature } from 'maplibre-gl';

import { DocumentFilter } from '@cognite/sdk';
import { GeoJson, Geometry } from '@cognite/seismic-sdk-js';

import { convertPolygonToPoint } from 'modules/map/helper';
import { Asset, GEOJSONPoint, MapDataSource } from 'modules/map/types';
import { MapLayerGeoJsonFilter } from 'modules/sidebar/types';
import {
  DEFAULT_CLUSTER_RADIUS,
  DEFAULT_CLUSTER_ZOOM_LEVEL,
  DOCUMENT_MARKER,
  GROUPED_CLUSTER_LAYER_ID,
  SEISMIC_LAYER_ID,
  WELL_MARKER,
} from 'pages/authorized/search/map/constants';
import { MapLayerFilters } from 'tenants/types';

export const clusterConfig = {
  clusterRadius: DEFAULT_CLUSTER_RADIUS,
  clusterProperties: {
    documentsCount: [
      '+',
      ['case', ['==', ['get', 'iconType'], DOCUMENT_MARKER], 1, 0],
    ],
    wellsCount: ['+', ['case', ['==', ['get', 'iconType'], WELL_MARKER], 1, 0]],
    selectedItemsCount: [
      '+',
      ['case', ['==', ['get', 'isSelected'], 'true'], 1, 0],
    ],
    blurredItemsCount: [
      '+',
      ['case', ['==', ['get', 'isBlurred'], true], 1, 0],
    ],
    customLayer: ['==', true, true],
  },
};

const createSources = (
  seismicImages: FeatureCollection,
  features: FeatureCollection,
  cluster = true,
  zoom: number = DEFAULT_CLUSTER_ZOOM_LEVEL
): MapDataSource[] => {
  const sources = [
    { id: SEISMIC_LAYER_ID, data: seismicImages },
    {
      id: GROUPED_CLUSTER_LAYER_ID,
      data: {
        type: 'FeatureCollection',
        features: features.features,
      },
      clusterProps: {
        ...clusterConfig,
        cluster,
        clusterMaxZoom: zoom,
      },
    },
  ];
  return sources;
};

const getAssetData = (
  assetData: any,
  assetDisplayField: string,
  assetFilter?: (feature: Feature) => boolean
): Asset[] => {
  const assets = assetData.features
    ? assetData.features
        .filter(
          (f: Feature) =>
            f.properties && f.geometry && (!assetFilter || assetFilter(f))
        )
        .map((f: Feature): Asset => {
          const coordinates = convertPolygonToPoint(f.geometry as Geometry);
          return {
            name: f.properties![assetDisplayField],
            geometry: {
              coordinates: coordinates.coordinates as unknown as GEOJSONPoint,
              type: 'Point',
            },
          };
        })
        .sort((a: Asset, b: Asset) => a.name.localeCompare(b.name))
    : [];
  return assets;
};

const getAssetFilter = (assetFilter?: [string, string | string[]]) => {
  if (assetFilter !== undefined) {
    return (feature: Feature) => {
      const [haystack, needle] = assetFilter;

      if (isArray(needle)) {
        return needle.includes(feature.properties![haystack]);
      }

      return feature.properties![haystack] === needle;
    };
  }
  return undefined;
};

const setSourceProperties = (
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

const getAbsoluteCoordinates = (
  lng: number,
  coordinates: Position
): Position => {
  const position = coordinates;
  while (Math.abs(lng - coordinates[0]) > 180) {
    position[0] += lng > coordinates[0] ? 360 : -360;
  }
  return position;
};

const extractDocumentMapLayers = (
  features: MapboxGeoJSONFeature[],
  tenantConfigMapLayerFilters?: MapLayerFilters
): {
  geoFilter: MapLayerGeoJsonFilter;
  extraDocumentsFilter?: DocumentFilter;
}[] => {
  return features.reduce(
    (
      previousValue: {
        geoFilter: MapLayerGeoJsonFilter;
        extraDocumentsFilter?: DocumentFilter;
      }[],
      currentValue
    ) => {
      if (
        tenantConfigMapLayerFilters &&
        !!tenantConfigMapLayerFilters[currentValue.layer.id] &&
        currentValue.properties
      ) {
        previousValue.push({
          geoFilter: {
            label:
              currentValue.properties[
                tenantConfigMapLayerFilters[currentValue.layer.id].labelAccessor
              ],
            geoJson: currentValue.geometry,
          },
          extraDocumentsFilter:
            // fix type here, if possible remove cast
            currentValue.properties.filter &&
            tenantConfigMapLayerFilters[currentValue.layer.id]?.filters
              ? (pick(
                  JSON.parse(currentValue.properties.filter),
                  tenantConfigMapLayerFilters[currentValue.layer.id]
                    .filters as string[]
                ) as DocumentFilter)
              : undefined,
        });
      }
      return previousValue;
    },
    []
  );
};

export {
  getAssetFilter,
  getAssetData,
  createSources,
  setSourceProperties,
  getAbsoluteCoordinates,
  extractDocumentMapLayers,
};
