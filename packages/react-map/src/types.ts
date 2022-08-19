import * as React from 'react';
import type {
  Properties,
  Geometry,
  Feature,
  FeatureCollection,
  Geometries,
  Point,
} from '@turf/helpers';
import type { MapboxOptions, Map, MapLayerEventType } from 'maplibre-gl';

import type { DrawMode, DrawEventType } from './FreeDraw';
import type { FlyToProps } from './hooks/useFlyTo';
import type { SelectableLayer } from './layers';

export type MapType = Map;

// proxy these so we don't expose turf as the geo type source
export type MapPoint = Point;
export type MapFeature = Feature;
export type MapGeometries = Geometries;
export type MapFeatureCollection = FeatureCollection<Geometry, Properties>;
export interface MapEvent {
  // not sure where zoom should be coming from
  type: keyof MapLayerEventType | DrawEventType | 'zoom';
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
type DrawnFeatures = MapFeatureCollection;
export type SetDrawnFeatures = (features: DrawnFeatures) => void;
export type SetSelectedFeatures = (feature: MapFeature[]) => void;
export type SetDrawMode = (mode: DrawMode) => void;

export interface MapAddedProps {
  map?: MapType;

  drawMode: DrawMode;
  setDrawMode: SetDrawMode;

  drawnFeatures?: DrawnFeatures;
  setDrawnFeatures: SetDrawnFeatures;

  selectedFeatures?: MapFeature[];
  setSelectedFeatures: SetSelectedFeatures;
}
export type MapAddedPropsWithChildren = React.PropsWithChildren<MapAddedProps>;

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
export interface EventSetters {
  setDrawnFeatures?: SetDrawnFeatures;
  setSelectedFeatures?: SetSelectedFeatures;
  setDrawMode?: SetDrawMode;
}
export type SetupEventsProps = {
  defaultEvents: MapEvent[];
} & EventSetters;

// Map Component props
export interface MapProps {
  ExtraContent?: React.ElementType;
  extrasRef?: false | HTMLDivElement | null;
  center?: MapboxOptions['center'];
  disableMinimap?: boolean;
  disableUnmountConfirmation?: boolean;
  // how many polygons is the user allowed to draw at once
  maxUserCreatedFeatures?: number;
  // the nagivation buttons that control zoom/rotation of the map
  // value is in PX
  hideShowNagivationWidth?: number;
  setupEvents?: (props: SetupEventsProps) => MapEvent[];
  // polygons/lines drawn by user to display on the map
  features: MapFeatureCollection;
  // ?
  initialDrawnFeatures?: DrawnFeatures;
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
  renderWithWidth?: (mapWidth: number) => React.ReactElement;
  renderChildren?: (props: MapAddedProps) => React.ReactElement;
  setMapReference?: (map: maplibregl.Map) => void;
  zoom?: MapboxOptions['zoom'];

  MAPBOX_TOKEN: string;
  MAPBOX_MAP_ID: string;
}
