import { Feature } from '@turf/helpers';
import { TS_FIX_ME } from 'core';

import { Geometry } from '@cognite/seismic-sdk-js';

import { MapDataSource, MapState } from './types';

export const SET_GEO_FILTERS = 'MAP_SET_GEO_FILTERS';
export const SET_OTHER_SHOWING_GEO = 'MAP_SET_OTHER_SHOWING_GEO';
export const DELETE_DATA_POLYON = 'MAP_DELETE_DATA_POLYON';
export const ADD_DATA_POLYON = 'MAP_ADD_DATA_POLYON';
export const SET_SELECTED_DATA_POLYGON = 'MAP_SET_SELECTED_POLYGON';
export const SET_ASSETS = 'MAP_SET_ASSETS';
export const SET_SOURCES = 'MAP_SET_SOURCES';
export const PATCH_SOURCE = 'MAP_PATCH_SOURCE';
export const ZOOM_TO_ASSET = 'MAP_ZOOM_TO_ASSETS';
export const ADD_DOCUMENT_POLYON = 'MAP_ADD_DOCUMENT_POLYON';
export const DELETE_DOCUMENT_POLYON = 'MAP_DELETE_DOCUMENT_POLYON';

export const SELECT_LAYER = 'mapReducer/selectLayer';
export const REMOVE_LAYER = 'mapReducer/removeLayer';
export const SET_SELECTED_LAYERS = 'mapReducer/setSelectedLayers';

export const SET_ALL_LAYER_IS_SELECTED = 'MAP_SET_ALL_LAYER_IS_SELECTED';
export const ADD_ARBITRARYLINE = 'MAP_ADD_ARBITRARYLINE';
export const UPDATE_ARBITRARYLINE = 'MAP_UPDATE_ARBITRARYLINE';
export const REMOVE_ARBITRARYLINE = 'MAP_REMOVE_ARBITRARYLINE';
export const ADD_SELECTABLE_LAYERS = 'MAP_ADD_SELECTABLE_LAYERS';

export const ZOOM_TO_COORDS = 'mapProvider/zoomToCoords';
export const ZOOM_TO_FEATURE = 'mapProvider/zoomToFeature';
export const SET_SELECTED_DOCUMENT = 'mapProvider/setSelectedDocument';
export const SET_SELECTED_WELL = 'mapProvider/setSelectedWell';
export const CLEAR_SELECTED_DOCUMENT = 'mapProvider/clearSelectedDocument';
export const CLEAR_SELECTED_WELL = 'mapProvider/clearSelectedWell';
export const SET_SELECTED_POINT = 'mapProvider/setSelectedPoint';
export const CLEAR_SELECTED_POINT = 'mapProvider/clearSelectedPoint';

export const SET_SELECTED_FEATURE = 'mapProvider/setSelectedFeature';
export const CLEAR_SELECTED_FEATURE = 'mapProvider/clearSelectedFeature';
export const CLEAR_POLYGON = 'mapProvider/clearPolygon';

export interface SetGeo {
  type: typeof SET_GEO_FILTERS;
  geoFilter: MapState['geoFilter'];
  filterApplied?: MapState['filterApplied'];
}

export interface ToggleOtherGeo {
  type: typeof SET_OTHER_SHOWING_GEO;
  id: string;
  geometry: Geometry;
}

export interface ZoomToAsset {
  type: typeof ZOOM_TO_ASSET;
  geojson: TS_FIX_ME;
}

export interface SetAssets {
  type: typeof SET_ASSETS;
  assets: MapState['assets'];
}

export interface SetSources {
  type: typeof SET_SOURCES;
  sources: MapState['sources'];
}

export interface PatchSource {
  type: typeof PATCH_SOURCE;
  source: MapDataSource;
}

export interface AddArbitraryline {
  type: typeof ADD_ARBITRARYLINE;
  geoJson: Feature;
}

export interface UpdateArbitraryline {
  type: typeof UPDATE_ARBITRARYLINE;
  geoJson: Feature;
}

export interface RemoveArbitraryline {
  type: typeof REMOVE_ARBITRARYLINE;
}

export interface SelectLayer {
  type: typeof SELECT_LAYER;
  id: string;
}

export interface RemoveLayer {
  type: typeof REMOVE_LAYER;
  id: string;
}

export interface SetSelectedLayers {
  type: typeof SET_SELECTED_LAYERS;
  selectedLayers: string[];
}

export interface SetAllLayerIsSelected {
  type: typeof SET_ALL_LAYER_IS_SELECTED;
  selectAll: boolean;
}

export interface SetupSelectableLayers {
  type: typeof ADD_SELECTABLE_LAYERS;
  selectableLayers: TS_FIX_ME[];
}

interface SetSelectedDocument {
  type: typeof SET_SELECTED_DOCUMENT;
  selectedDocument: MapState['selectedDocument'];
}
interface SetSelecteWell {
  type: typeof SET_SELECTED_WELL;
  selectedWell: MapState['selectedWell'];
}

interface SetSelectedPoint {
  type: typeof SET_SELECTED_POINT;
  selectedDocument: MapState['selectedPoint'];
}

interface ZoomToFeature {
  type: typeof ZOOM_TO_FEATURE;
  zoomToFeature: MapState['zoomToFeature'];
}

interface ZoomToCoords {
  type: typeof ZOOM_TO_COORDS;
  zoomToCoords: MapState['zoomToCoords'];
}

interface MoveToCoords {
  type: typeof ZOOM_TO_COORDS;
  moveToCoords: MapState['moveToCoords'];
}

interface SetSelectedFeature {
  type: typeof SET_SELECTED_FEATURE;
  feature: MapState['selectedFeature'];
}

interface ClearSelectedFeature {
  type: typeof CLEAR_SELECTED_FEATURE;
}

interface ClearSelectedDocument {
  type: typeof CLEAR_SELECTED_DOCUMENT;
}

interface ClearSelectedWell {
  type: typeof CLEAR_SELECTED_WELL;
}

interface ClearSelectedPoint {
  type: typeof CLEAR_SELECTED_POINT;
}

interface SetClearPolygon {
  type: typeof CLEAR_POLYGON;
  cancelPolygonSearch: boolean;
}

export type MapAction =
  | SetGeo
  | ZoomToAsset
  | ToggleOtherGeo
  | SetAssets
  | SetSources
  | PatchSource
  | AddArbitraryline
  | UpdateArbitraryline
  | RemoveArbitraryline
  | SetAllLayerIsSelected
  | SetupSelectableLayers
  | SelectLayer
  | RemoveLayer
  | SetSelectedLayers
  | ZoomToCoords
  | ZoomToFeature
  | MoveToCoords
  | SetSelectedFeature
  | ClearSelectedFeature
  | SetSelectedDocument
  | SetSelecteWell
  | ClearSelectedDocument
  | ClearSelectedWell
  | ClearSelectedPoint
  | SetSelectedPoint
  | SetClearPolygon;
