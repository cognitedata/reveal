import { Feature, FeatureCollection } from '@turf/helpers';

import { Geometry, Point, Polygon, GeoJson } from '@cognite/seismic-sdk-js';

import { MapLayer } from '../../tenants/types';

export interface NPDLayerItemResponse {
  assetIds: number[];
  name: string;
  attributes: {
    geometry: Polygon;
    dctype: string;
    name: string;
    oplongname: string;
    fieldname: string;
    interest: string;
    type: string;
    surface: string;
    medium: string;
    topography: string;
    maplabel: string;
    status: string;
  };
}

export interface Asset {
  name: string;
  geometry: Point;
}

export interface MapDataSource {
  id: string;
  data: any;
  clusterProps?: {
    cluster: boolean;
    clusterMaxZoom: number;
    clusterRadius: number;
  };
}

export interface SelectableLayer {
  id: string;
  name: string;
  selected: boolean;
  layers: MapLayer[];

  disabled?: boolean;
  weight?: number; // for ordering
}

// type Marker = {
//   id: string;
//   title: string;
//   coordinates: Position[];
// };
export interface MapState {
  // polygon(s) drawn on the map
  geoFilter: GeoJson[] | never[];
  // other objects drawn on the map
  otherGeo: Record<string, Geometry>;
  // selectedDataFeature: Feature | null;
  arbitraryLine: Feature | null;
  selectedLayers: string[];
  isLayersSelectedByUser?: boolean;
  assets: Asset[];
  sources?: MapDataSource[];
  focusedAsset?: Asset;
  filterApplied: boolean;
  // moved from provider
  zoomToCoords?: Point; // move map AND zoom
  moveToCoords?: Point; // move - don't change zoon
  zoomToFeature?: Geometry;
  selectedFeature: GeoJson | null;
  selectedDocument?: { id: string; point?: Point };
  selectedWell?: { id: number; point?: Point };
  drawMode: DrawMode;
  // change this to an array of types
  // so it can contain many?
  selectedPoint?: { id: string; point?: Point; type: string };
  mapWidth?: number;
}

// other types

export type GEOJSONPoint = [number, number]; // DEPRECATED <- use LngLatLike instead

// DEPRECATED use from mapbox
export interface MapFeature {
  type?: string;
  features: GeoJson[];
}

// DEPRECATED use from sdk
export interface APIGeo {
  shape: Geometry;
  relation: string;
}

export type DrawMode =
  | 'simple_select'
  | 'draw_line_string'
  // we need to move to using this inbuilt one
  | 'draw_polygon'
  // and remove this custom one:
  | 'draw_free_polygon'
  | 'direct_select';

export type MapFeatureCollection = FeatureCollection;
