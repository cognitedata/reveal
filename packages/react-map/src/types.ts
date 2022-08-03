import type {
  Feature,
  FeatureCollection,
  Geometries,
  Point,
} from '@turf/helpers';
import type { MapboxOptions, Map, MapLayerEventType } from 'maplibre-gl';
import type { Geometry } from 'geojson';

import type { FlyToProps } from './hooks/useFlyTo';
import type { SelectableLayer } from './layers';
import type { DrawMode } from './FreeDraw';

export type MapType = Map;

// proxy these so we don't expose turf as the geo type source
export type MapPoint = Point;
export type MapFeature = Feature;
export type MapGeometries = Geometries;
export type MapFeatureCollection = FeatureCollection<Geometry, any>;
export interface MapEvent {
  type: keyof MapLayerEventType;
  layers?: string[];
  callback: any;
}

export interface MapIcon {
  name: string;
  icon: HTMLImageElement;
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

export interface MapAddedProps {
  draw?: MapboxDraw;
  setDraw: (mode: MapboxDraw) => void;

  selectedFeatures?: any[];
  polygon?: MapFeature;
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

// Map Component props
export interface MapProps {
  center?: MapboxOptions['center'];
  disableMinimap?: boolean;
  // the nagivation buttons that control zoom/rotation of the map
  // value is in PX
  hideShowNagivationWidth?: number;
  drawMode: DrawMode;
  setupEvents?: (props: { defaultEvents: MapEvent[] }) => MapEvent[];
  // polygons/lines drawn by user to display on the map
  features: MapFeatureCollection;
  // fly to x/y coords
  flyTo?: FlyToProps['flyTo'];
  // move the map to a feature
  focusedFeature?: MapFeature;
  // selections/filters of stuff from the sources to display on the map (aka: layers)
  selectedFeature?: MapFeature;
  layerConfigs: SelectableLayer[];
  // the actual from files or geospatial endpoint (aka: sources)
  layerData: MapDataSource[];
  mapIcons?: MapIcon[];
  maxBounds?: MapboxOptions['maxBounds'];
  renderNavigationControls?: (mapWidth: number) => React.ReactElement;
  initialPolygon?: MapFeature;
  setMapReference?: (map: maplibregl.Map) => void;
  zoom?: MapboxOptions['zoom'];

  MAPBOX_TOKEN: string;
  MAPBOX_MAP_ID: string;
}
