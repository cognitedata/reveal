import { Feature } from '@turf/helpers';

import { SelectableLayer } from '@cognite/react-map';
import { Geometry } from '@cognite/seismic-sdk-js';

import { translateGeoType } from 'modules/map/helper';
import { MapDataSource, MapState } from 'modules/map/types';
import {
  AddArbitraryline,
  RemoveArbitraryline,
  RemoveLayer,
  ToggleOtherGeo,
  SelectLayer,
  SetGeo,
  SetSelectedLayers,
  ZoomToAsset,
  ADD_ARBITRARYLINE,
  REMOVE_ARBITRARYLINE,
  REMOVE_LAYER,
  SELECT_LAYER,
  SET_GEO_FILTERS,
  SET_OTHER_SHOWING_GEO,
  SET_SELECTED_LAYERS,
  ZOOM_TO_ASSET,
  SetSources,
  SET_SOURCES,
  PATCH_SOURCE,
  PatchSource,
  SET_ASSETS,
  SetAssets,
  ZOOM_TO_COORDS,
  ZOOM_TO_FEATURE,
  SET_SELECTED_DOCUMENT,
  SET_SELECTED_WELL,
  SET_SELECTED_POINT,
  CLEAR_SELECTED_DOCUMENT,
  CLEAR_SELECTED_WELL,
  SET_SELECTED_FEATURE,
  CLEAR_SELECTED_FEATURE,
} from 'modules/map/types.actions';

export function zoomToAsset(id: string, geo: Geometry): ZoomToAsset {
  const type = translateGeoType(geo.type);
  const f = { geometry: { ...geo, type }, properties: { id } };

  return { type: ZOOM_TO_ASSET, geojson: f };
}

export function toggleLayer(layer: SelectableLayer): SelectLayer | RemoveLayer {
  return !layer.selected
    ? {
        type: SELECT_LAYER,
        id: layer.id,
      }
    : {
        type: REMOVE_LAYER,
        id: layer.id,
      };
}

export const setSelectedLayers = (layers: string[]): SetSelectedLayers => ({
  type: SET_SELECTED_LAYERS,
  selectedLayers: layers,
});

/**
 * This function adds a arbitrary line.
 * @param {string} id a unique identifier for the filter.
 * @param {geojson} coordinates the geofilter to be added.
 *
 * @returns {promise} a promise to track when the appropriate action is dispatch
 */
export const addArbitraryLine = (
  _id: string,
  geoJson: Feature
): AddArbitraryline => ({
  type: ADD_ARBITRARYLINE,
  geoJson,
});

/**
 * This function removes the arbitrary line.
 *
 * @returns {promise} a promise to track when the appropriate action is dispatch
 */
export const removeArbitraryLine = (): RemoveArbitraryline => ({
  type: REMOVE_ARBITRARYLINE,
});

export const toggleOtherGeo = (
  id: string,
  geometry: Geometry
): ToggleOtherGeo => {
  return {
    type: SET_OTHER_SHOWING_GEO,
    id,
    geometry,
  };
};

export const setGeo = (
  geoFilter: MapState['geoFilter'],
  filterApplied?: boolean
): SetGeo => {
  const action: SetGeo = {
    type: SET_GEO_FILTERS,
    geoFilter,
  };
  if (filterApplied) {
    action.filterApplied = true;
  }
  // If no polygon drawn lets mark polygon applied as false
  if (geoFilter.length === 0) {
    action.filterApplied = false;
  }
  return action;
};

export const setAssets = (assets: MapState['assets']): SetAssets => ({
  type: SET_ASSETS,
  assets,
});

export const setSources = (sources: MapState['sources']): SetSources => ({
  type: SET_SOURCES,
  sources,
});

export const patchSource = (source: MapDataSource): PatchSource => ({
  type: PATCH_SOURCE,
  source,
});

export const zoomToCoords = (point: MapState['zoomToCoords']) => ({
  type: ZOOM_TO_COORDS,
  zoomToCoords: point,
});

export const moveToCoords = (point: MapState['moveToCoords']) => ({
  type: ZOOM_TO_COORDS,
  moveToCoords: point,
});

export const zoomToFeature = (geoJson: MapState['zoomToFeature']) => ({
  type: ZOOM_TO_FEATURE,
  zoomToFeature: geoJson,
});

export const setSelectedDocument = (
  selectedDocument: MapState['selectedDocument']
) => ({
  type: SET_SELECTED_DOCUMENT,
  selectedDocument,
});

export const setSelectedWell = (selectedWell: MapState['selectedWell']) => ({
  type: SET_SELECTED_WELL,
  selectedWell,
});

export const setSelectedPoint = (selectedPoint: MapState['selectedPoint']) => ({
  type: SET_SELECTED_POINT,
  selectedPoint,
});

export const clearSelectedDocument = () => ({
  type: CLEAR_SELECTED_DOCUMENT,
});

export const clearSelectedWell = () => ({
  type: CLEAR_SELECTED_WELL,
});

export const setSelectedFeature = (feature: MapState['selectedFeature']) => ({
  type: SET_SELECTED_FEATURE,
  selectedFeature: feature,
});

export const clearSelectedFeature = () => ({
  type: CLEAR_SELECTED_FEATURE,
});
