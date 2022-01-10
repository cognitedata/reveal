import get from 'lodash/get';
import set from 'lodash/set';
import unset from 'lodash/unset';

import {
  SET_LOG_TYPE,
  SET_LOGS_ROW_DATA,
  TOGGLE_EXPANDED_WELL_ID,
  TOGGLE_SELECTED_WELLS,
  WellState,
  WellSearchAction,
  SequenceData,
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
      const { selectedWellIds, selectedWellboreIds } = state;

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
      const { selectedWellIds, selectedWellboreIds } = state;

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

    case SET_LOG_TYPE: {
      const updatedWellboreData = { ...state.wellboreData };
      Object.keys(action.data.logs).forEach((wellboreId) => {
        const wbId = Number(wellboreId);
        if (updatedWellboreData[wbId]) {
          updatedWellboreData[wbId].logType = action.data.logs[wbId].map(
            (sequence) => ({
              sequence,
            })
          );
        } else {
          updatedWellboreData[wbId] = {
            logType: action.data.logs[wbId].map((sequence) => ({ sequence })),
          };
        }
      });
      Object.keys(action.data.logsFrmTops).forEach((wellboreId) => {
        const wbId = Number(wellboreId);
        if (updatedWellboreData[wbId]) {
          updatedWellboreData[wbId].logsFrmTops = action.data.logsFrmTops[
            wbId
          ].map((sequence) => ({
            sequence,
          }));
        } else {
          updatedWellboreData[wbId] = {
            logsFrmTops: action.data.logsFrmTops[wbId].map((sequence) => ({
              sequence,
            })),
          };
        }
      });
      return {
        ...state,
        wellboreData: updatedWellboreData,
      };
    }

    case SET_LOGS_ROW_DATA: {
      const updatedWellboreData = { ...state.wellboreData };

      action.data.logs.forEach((logData) => {
        const wellboreId = logData.log.assetId as number;
        const newLogList = (
          updatedWellboreData[wellboreId].logType as SequenceData[]
        ).map((logRow) =>
          logRow.sequence.id === logData.log.id
            ? { ...logRow, rows: logData.rows }
            : logRow
        );
        updatedWellboreData[wellboreId] = {
          ...updatedWellboreData[wellboreId],
          ...{ logType: newLogList },
        };
      });

      action.data.logsFrmTops.forEach((logData) => {
        const wellboreId = logData.log.assetId as number;
        const newLogList = (
          updatedWellboreData[wellboreId].logsFrmTops as SequenceData[]
        ).map((logRow) =>
          logRow.sequence.id === logData.log.id
            ? { ...logRow, rows: logData.rows }
            : logRow
        );
        updatedWellboreData[wellboreId] = {
          ...updatedWellboreData[wellboreId],
          ...{ logsFrmTops: newLogList },
        };
      });

      return {
        ...state,
        ...{ wellboreData: updatedWellboreData },
      };
    }

    case SET_WELLBORE_ASSETS: {
      const updatedWellboreData = { ...state.wellboreData };
      Object.keys(action.data).forEach((wellboreId) => {
        const wbId = Number(wellboreId);
        if (updatedWellboreData[wbId]) {
          updatedWellboreData[wbId][action.assetType] = action.data[wbId].map(
            (asset) => ({
              asset,
            })
          );
        } else {
          updatedWellboreData[wbId] = {
            [action.assetType]: action.data[wbId].map((asset) => ({
              asset,
            })),
          };
        }
      });
      return {
        ...state,
        wellboreData: updatedWellboreData,
      };
    }

    case SET_WELLBORE_DIGITAL_ROCK_SAMPLES: {
      const updatedWellboreData = { ...state.wellboreData };
      action.data.forEach((row) => {
        const wbId = Number(row.wellboreId);
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
      const updatedWellboreData = { ...state.wellboreData };
      const wbId = Number(get(action, 'digitalRockSample.metadata.wellboreId'));
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
