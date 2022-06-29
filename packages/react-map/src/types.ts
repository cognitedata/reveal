import { Geometry, Point } from '@cognite/seismic-sdk-js';
import { Feature, FeatureCollection } from '@turf/helpers';
import type {
  AnyLayer,
  CustomLayerInterface,
  MapboxOptions,
} from 'maplibre-gl';

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

export type RemoteServiceResponse = FeatureCollection & { nextCursor?: string };

export interface Layer {
  name: string;
  remote?: string;
  remoteService?: (
    tenant: string,
    cursor?: string
  ) => Promise<RemoteServiceResponse>;
  local?: string;
  color: string;
  defaultOn: boolean;

  // which layer to show this before
  // used for layer display ordering
  weight?: number;

  alwaysOn?: boolean;
  searchable?: string;
  searchInputText?: string;
  mapLayers?: MapLayer[];
  asset?: {
    filter?: [string, string | string[]];
    displayField: string;
  };
}

export type Layers = Record<string, Layer>;

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
  selectedFeature: Feature | null; // Feature === Geometry | GeometryCollection

  arbitraryLine: Feature | null;
  selectedLayers: string[];
  // sources: MapDataSource[];
  assets: Asset[];
  focusedAsset?: Asset;
  filterApplied: boolean;
}

// other types

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

// DEPRECATED use from sdk
export interface GeoJson {
  id?: string;
  type?: string;
  properties?: any;
  geometry: Geometry;
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

export interface MapConfig {
  zoom?: MapboxOptions['zoom'];
  center: MapboxOptions['center'];
  maxBounds?: MapboxOptions['maxBounds'];
  seismic?: {
    zoom: MapboxOptions['zoom']; // deprecated
    center: MapboxOptions['center']; // deprecated
    maxBounds?: MapboxOptions['maxBounds']; // deprecated
  };
}

export type MapLayer = (AnyLayer | CustomLayerInterface) & {
  weight?: number;
  source: string;
};
