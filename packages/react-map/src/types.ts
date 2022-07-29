import type {
  Feature,
  FeatureCollection,
  Geometries,
  Point,
} from '@turf/helpers';
import type { MapboxOptions, Map } from 'maplibre-gl';
import type { Geometry } from 'geojson';

import type { DrawMode } from './FreeDraw';

export type MapType = Map;

// proxy these so we don't expose turf as the geo type source
export type MapPoint = Point;
export type MapFeature = Feature;
export type MapGeometries = Geometries;
export type MapFeatureCollection = FeatureCollection;

export interface MapEvent {
  type: string;
  layers?: string[];
  callback: any;
}

export interface MapIcon {
  name: string;
  icon: HTMLImageElement;
}

// export interface Asset {
//   name: string;
//   geometry: Point;
// }

export interface MapDataSource {
  id: string;
  data: any;
  clusterProps?: {
    cluster: boolean;
    clusterMaxZoom: number;
    clusterRadius: number;
  };
}

export interface MapAddedProps {
  draw: DrawMode;
  setDraw: (mode: DrawMode) => void;

  selectedFeatures?: any[];
  polygon?: MapGeometries;
}

// type Marker = {
//   id: string;
//   title: string;
//   coordinates: Position[];
// };
export interface MapState {
  // polygon(s) drawn on the map
  polygons: Geometry[] | never[];
  // other objects drawn on the map
  otherGeo: Record<string, Geometry>;
  // selectedDataFeature: Feature | null;
  selectedFeature: MapFeature; // Feature === Geometry | GeometryCollection

  arbitraryLine: MapFeature;
  selectedLayers: string[];
  // sources: MapDataSource[];
  // assets: Asset[];
  // focusedAsset?: Asset;
  filterApplied: boolean;
}

// other types

// DEPRECATED use from mapbox
// export interface MapFeature {
//   type?: string;
//   features: GeoJson[];
// }

// DEPRECATED use from sdk
// export interface APIGeo {
//   shape: Geometry;
//   relation: string;
// }

// DEPRECATED use from sdk
// export interface GeoJson {
//   id?: string;
//   type?: string;
//   properties?: any;
//   geometry: Geometry;
// }

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
