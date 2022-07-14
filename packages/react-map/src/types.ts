import { Geometry, Point } from '@cognite/seismic-sdk-js';
import { Feature, FeatureCollection } from '@turf/helpers';
import type { MapboxOptions } from 'maplibre-gl';

export interface MapEvent {
  type: string;
  layers?: string[];
  callback: any;
}

export interface MapIcon {
  name: string;
  icon: HTMLImageElement;
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
