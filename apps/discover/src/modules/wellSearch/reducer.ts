import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import set from 'lodash/set';
import unset from 'lodash/unset';

import {
  TOGGLE_EXPANDED_WELL_ID,
  TOGGLE_SELECTED_WELLS,
  WellState,
  WellSearchAction,
  SET_WELLBORE_ASSETS,
  AssetData,
  SET_WELLBORE_DIGITAL_ROCK_SAMPLES,
  SET_GRAIN_ANALYSIS_DATA,
  DigitalRockSampleData,
  WELL_ADD_SELECTED_COLUMN,
  WELL_REMOVE_SELECTED_COLUMN,
  WELL_SET_SELECTED_COLUMN,
  TOGGLE_SELECTED_WELLBORE_OF_WELL,
} from './types';
// reducer should be pure, should refactor this logic into the service.

export const initialState: WellState = {
  selectedWellIds: {},
  selectedWellboreIds: {},
  expandedWellIds: {},
  selectedColumns: ['wellname', 'source', 'operator', 'spudDate', 'waterDepth'],
  wellboreData: {},
};

export function wellReducer(
  state: WellState = initialState,
  action?: WellSearchAction
) {
  if (!action) {
    return state;
  }
  switch (action.type) {
    case WELL_ADD_SELECTED_COLUMN:
      return {
        ...state,
        selectedColumns: [...state.selectedColumns, action.column],
      };

    case WELL_REMOVE_SELECTED_COLUMN:
      return {
        ...state,
        selectedColumns: state.selectedColumns.filter(
          (c) => c !== action.column
        ),
      };

    case WELL_SET_SELECTED_COLUMN:
      return { ...state, selectedColumns: [...action.columns] };

    case TOGGLE_EXPANDED_WELL_ID: {
      return {
        ...state,
        expandedWellIds: {
          ...(action.reset ? {} : state.expandedWellIds),
          [action.id]: !state.expandedWellIds[action.id],
        },
      };
    }

    case TOGGLE_SELECTED_WELLS: {
      // temporary fix, will refactor this properly in another PR.
      const { selectedWellIds, selectedWellboreIds } = cloneDeep(state);

      if (action.clear) {
        return { ...state, selectedWellIds: {}, selectedWellboreIds: {} };
      }

      action.wells.forEach((wellData) => {
        if (action.isSelected) {
          set(selectedWellIds, wellData.id, true);
          wellData.wellbores?.forEach((wellbore) => {
            set(selectedWellboreIds, wellbore.id, true);
          });
        } else {
          unset(selectedWellIds, wellData.id);
          wellData.wellbores?.forEach((wellbore) => {
            unset(selectedWellboreIds, wellbore.id);
          });
        }
      });

      return { ...state, selectedWellIds, selectedWellboreIds };
    }

    case TOGGLE_SELECTED_WELLBORE_OF_WELL: {
      const { selectedWellIds, selectedWellboreIds } = cloneDeep(state);

      if (action.isSelected) {
        set(selectedWellboreIds, action.wellboreId, true);
        set(selectedWellIds, action.well.id, true);
      } else {
        unset(selectedWellboreIds, action.wellboreId);

        const isSomeWellboresSelected = action.well.wellbores?.some(
          (wellbore) => selectedWellboreIds[wellbore.id]
        );

        if (!isSomeWellboresSelected) {
          unset(selectedWellIds, action.well.id);
        }
      }

      return { ...state, selectedWellIds, selectedWellboreIds };
    }

    case SET_WELLBORE_ASSETS: {
      const updatedWellboreData = cloneDeep(state.wellboreData);
      Object.keys(action.data).forEach((wellboreId: string) => {
        if (action.data[wellboreId]) {
          if (updatedWellboreData[wellboreId]) {
            updatedWellboreData[wellboreId][action.assetType] = action.data[
              wellboreId
            ].map((asset) => ({
              asset,
            }));
          } else {
            updatedWellboreData[wellboreId] = {
              [action.assetType]: action.data[wellboreId].map((asset) => ({
                asset,
              })),
            };
          }
        }
      });
      return {
        ...state,
        wellboreData: updatedWellboreData,
      };
    }

    case SET_WELLBORE_DIGITAL_ROCK_SAMPLES: {
      const updatedWellboreData = cloneDeep(state.wellboreData);
      action.data.forEach((row) => {
        const wbId = row.wellboreId;

        if (updatedWellboreData[wbId].digitalRocks) {
          const digitalRocks = updatedWellboreData[wbId]
            .digitalRocks as AssetData[];
          const updatedDigitalRocks = digitalRocks.map((digitalRock) =>
            digitalRock.asset.id === row.digitalRockId
              ? {
                  ...digitalRock,
                  digitalRockSamples: row.digitalRockSamples.map(
                    (digitalRockSample) => ({ asset: digitalRockSample })
                  ),
                }
              : digitalRock
          );
          updatedWellboreData[wbId].digitalRocks = updatedDigitalRocks;
        }
      });
      return {
        ...state,
        wellboreData: updatedWellboreData,
      };
    }

    case SET_GRAIN_ANALYSIS_DATA: {
      const updatedWellboreData = cloneDeep(state.wellboreData);
      const wbId = get(action, 'digitalRockSample.metadata.wellboreId');
      const digitalRockId = action.digitalRockSample.parentId;
      const digitalRockSampleId = action.digitalRockSample.id;

      return {
        ...state,
        wellboreData: {
          ...updatedWellboreData,
          [wbId]: {
            ...updatedWellboreData[wbId],
            digitalRocks: updatedWellboreData[wbId].digitalRocks
              ? [
                  ...(
                    updatedWellboreData[wbId].digitalRocks as AssetData[]
                  ).map((digitalRock) =>
                    digitalRock.asset.id === digitalRockId
                      ? {
                          ...digitalRock,
                          digitalRockSamples: digitalRock.digitalRockSamples
                            ? [
                                ...(
                                  digitalRock.digitalRockSamples as DigitalRockSampleData[]
                                ).map((digitalRockSample) =>
                                  digitalRockSample.asset.id ===
                                  digitalRockSampleId
                                    ? {
                                        ...digitalRockSample,
                                        [action.grainAnalysisType]: action.data,
                                      }
                                    : digitalRockSample
                                ),
                              ]
                            : undefined,
                        }
                      : digitalRock
                  ),
                ]
              : undefined,
          },
        },
      };
    }

    default:
      return state;
  }
}
