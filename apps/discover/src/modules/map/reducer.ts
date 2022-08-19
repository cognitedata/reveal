import { MapState } from 'modules/map/types';
import {
  ADD_ARBITRARYLINE,
  ADD_SELECTABLE_LAYERS,
  CLEAR_SELECTED_DOCUMENT,
  CLEAR_SELECTED_FEATURE,
  CLEAR_SELECTED_POINT,
  CLEAR_SELECTED_WELL,
  MapAction,
  PATCH_SOURCE,
  REMOVE_ARBITRARYLINE,
  REMOVE_LAYER,
  SELECT_LAYER,
  SET_ASSETS,
  SET_GEO_FILTERS,
  SET_OTHER_SHOWING_GEO,
  SET_SELECTED_DOCUMENT,
  SET_SELECTED_FEATURE,
  SET_SELECTED_LAYERS,
  SET_SELECTED_POINT,
  SET_SELECTED_WELL,
  SET_SOURCES,
  UPDATE_ARBITRARYLINE,
  ZOOM_TO_ASSET,
  ZOOM_TO_COORDS,
  ZOOM_TO_FEATURE,
} from 'modules/map/types.actions';

export const initialState: MapState = {
  geoFilter: [], // polygons to show on the map
  otherGeo: {}, // other polygons to show on the map
  arbitraryLine: null, // other line to show on the map
  assets: [],
  selectedFeature: null,
  selectedLayers: [],
  filterApplied: false,
  zoomToCoords: undefined,
  zoomToFeature: undefined,
  selectedDocument: undefined,
  selectedWell: undefined,
  selectedPoint: undefined,
};

export function map(
  state: MapState = initialState,
  action?: MapAction
): MapState {
  if (!action) {
    return state;
  }
  switch (action.type) {
    case ADD_SELECTABLE_LAYERS:
    case SET_GEO_FILTERS:
    case SET_ASSETS: {
      return { ...state, ...action };
    }

    case SET_SOURCES: {
      return { ...state, sources: action.sources };
    }

    case PATCH_SOURCE: {
      return {
        ...state,
        sources: [
          ...(state.sources || []).map((source) => {
            if (source.id === action.source.id) {
              return {
                ...source,
                data: {
                  ...action.source.data,
                  features: [
                    ...(source?.data?.features || []),
                    ...action.source.data.features,
                  ],
                },
              };
            }

            return source;
          }),
        ],
      };
    }

    case SET_OTHER_SHOWING_GEO: {
      const existing = state.otherGeo[action.id];

      let updatedOtherGeo: MapState['otherGeo'] = {};

      if (existing) {
        const { [action.id]: _toRemove, ...rest } = state.otherGeo;
        updatedOtherGeo = rest;
      } else {
        // console.log('Adding:', action.geometry);
        updatedOtherGeo = {
          ...state.otherGeo,
          [action.id]: action.geometry,
        };
      }

      return {
        ...state,
        otherGeo: updatedOtherGeo,
      };
    }

    case ZOOM_TO_ASSET: {
      return { ...state, focusedAsset: { ...action.geojson } };
    }

    case ADD_ARBITRARYLINE: {
      return {
        ...state,
        arbitraryLine: { ...action.geoJson },
      };
    }

    case UPDATE_ARBITRARYLINE: {
      return {
        ...state,
        arbitraryLine: { ...action.geoJson },
      };
    }

    case REMOVE_ARBITRARYLINE: {
      return {
        ...state,
        arbitraryLine: null,
      };
    }

    case SELECT_LAYER:
      return {
        ...state,
        selectedLayers: [...state.selectedLayers, action.id],
        isLayersSelectedByUser: true,
      };

    case SET_SELECTED_LAYERS:
      return {
        ...state,
        selectedLayers: state.isLayersSelectedByUser
          ? state.selectedLayers
          : [...action.selectedLayers],
      };

    case REMOVE_LAYER:
      return {
        ...state,
        selectedLayers: state.selectedLayers.filter(
          (layer) => layer !== action.id
        ),
        isLayersSelectedByUser: true,
      };

    case ZOOM_TO_COORDS:
    case ZOOM_TO_FEATURE:
    case SET_SELECTED_POINT:
    case SET_SELECTED_FEATURE:
    case SET_SELECTED_WELL:
    case SET_SELECTED_DOCUMENT: {
      return { ...state, ...action };
    }

    case CLEAR_SELECTED_POINT: {
      return { ...state, selectedPoint: undefined };
    }

    case CLEAR_SELECTED_FEATURE: {
      return { ...state, selectedFeature: null };
    }

    case CLEAR_SELECTED_DOCUMENT: {
      return { ...state, selectedDocument: undefined };
    }
    case CLEAR_SELECTED_WELL: {
      return { ...state, selectedWell: undefined };
    }

    default:
      return state;
  }
}
