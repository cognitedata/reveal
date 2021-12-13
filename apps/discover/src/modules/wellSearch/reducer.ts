import flatMap from 'lodash/flatMap';
import get from 'lodash/get';

import {
  SET_IS_SEARCHING,
  RESET_QUERY,
  SET_WELLS_DATA,
  SET_WELLBORES,
  SET_SEQUENCES,
  SET_SELECTED_WELL_ID,
  SET_SEARCH_PHRASE,
  SET_HAS_SEARCHED,
  SET_SELECTED_WELLBORE_IDS,
  SET_LOG_TYPE,
  SET_LOGS_ROW_DATA,
  TOGGLE_EXPANDED_WELL_ID,
  TOGGLE_SELECTED_WELLS,
  WellState,
  WellSearchAction,
  Wellbore,
  SequenceData,
  SET_HOVERED_WELL,
  SET_PPFG_ROW_DATA,
  SET_WELLBORE_SEQUENCES,
  SET_WELLBORE_ASSETS,
  AssetData,
  SET_WELLBORE_DIGITAL_ROCK_SAMPLES,
  SET_GRAIN_ANALYSIS_DATA,
  DigitalRockSampleData,
  SET_ALL_WELLBORES_FETCHING,
  SET_WELLBORES_FETCHED_WELL_IDS,
  WELL_ADD_SELECTED_COLUMN,
  WELL_REMOVE_SELECTED_COLUMN,
  WELL_SET_SELECTED_COLUMN,
  SET_SELECTED_WELLBORE_IDS_WITH_WELL_ID,
  SET_HOVERED_WELLBORE_IDS,
  SET_INSECT_WELLBORES_CONTEXT,
  InspectWellboreContext,
  SET_WELL_CARD_SELECTED_WELL_ID,
  SET_WELL_CARD_SELECTED_WELLBORE_ID,
  SET_FAVORITE_HOVERED_OR_CHECKED_WELLS,
  SET_FAVORITE_ID,
  SET_SELECTED_SECONDARY_WELL_IDS,
  SET_SELECTED_SECONDARY_WELLBORE_IDS,
} from './types';
// reducer should be pure, should refactor this logic into the service.

export const initialState: WellState = {
  wells: [],
  selectedWellIds: {},
  selectedWellboreIds: {},
  expandedWellIds: {},
  currentQuery: {
    phrase: '',
    hasSearched: false,
  },
  selectedColumns: ['wellname', 'source', 'operator', 'spudDate', 'waterDepth'],
  isSearching: false,
  allWellboresFetching: false,
  wellboresFetchedWellIds: [],
  wellboreData: {},
  hoveredWellboreIds: {},
  wellCardSelectedWellId: undefined,
  wellCardSelectedWellBoreId: {},
  wellFavoriteHoveredOrCheckedWells: [],
  inspectWellboreContext: InspectWellboreContext.NOT_SPECIFIED,
  selectedSecondaryWellIds: {},
  selectedSecondaryWellboreIds: {},
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

    case SET_IS_SEARCHING: {
      return {
        ...state,
        isSearching: action.isSearching,
      };
    }
    case SET_HOVERED_WELL: {
      return {
        ...state,
        hoveredWellId: action.wellId,
      };
    }

    case RESET_QUERY: {
      return {
        ...state,
        currentQuery: { ...initialState.currentQuery },
        wells: [],
        selectedWellIds: {},
        expandedWellIds: {},
        selectedWellboreIds: {},
      };
    }

    case SET_WELLS_DATA: {
      return {
        ...state,
        wells: [...action.wells],
        selectedWellIds: {},
        expandedWellIds:
          action.wells.length > 0 ? { [action.wells[0].id]: true } : {},
        selectedWellboreIds: {},
      };
    }
    case SET_WELLBORES: {
      return {
        ...state,
        wells: state.wells.map((well) =>
          action.data[well.id]
            ? {
                ...well,
                wellbores: action.data[well.id].map((wb: Wellbore) => ({
                  ...wb,
                  wellId: well.id,
                  metadata: {
                    ...wb.metadata,
                    wellExternalId: well.externalId ? well.externalId : '-',
                    wellDescription: well.description ? well.description : '-',
                    wellName: well.name,
                  },
                })),
              }
            : well
        ),
      };
    }

    case SET_SEQUENCES: {
      return {
        ...state,
        wells: [
          ...state.wells.map((innerWell) => {
            if (innerWell.id === action.wellId) {
              return {
                ...innerWell,
                wellbores: [
                  ...(innerWell.wellbores?.map((wellbore: Wellbore) => {
                    if (wellbore.id === action.wellboreId) {
                      return {
                        ...wellbore,
                        sequences: action.sequences,
                      };
                    }
                    return wellbore;
                  }) || []),
                ],
              };
            }
            return innerWell;
          }),
        ],
      };
    }

    case SET_SELECTED_WELL_ID: {
      const wellbores = flatMap(
        state.wells.filter((well) => well.id === action.id && well.wellbores),
        'wellbores'
      ) as Wellbore[];

      const selectedWellboreIds = { ...state.selectedWellboreIds };
      if (action.value) {
        wellbores.forEach((wellbore) => {
          selectedWellboreIds[wellbore.id] = true;
        });
      } else {
        wellbores.forEach((wellbore) => {
          selectedWellboreIds[wellbore.id] = false;
        });
      }

      return {
        ...state,
        selectedWellIds: {
          ...state.selectedWellIds,
          ...{
            [action.id]: action.value,
          },
        },
        expandedWellIds: {
          ...state.expandedWellIds,
          ...{
            [action.id]: action.value,
          },
        },
        selectedWellboreIds,
      };
    }

    case SET_SELECTED_WELLBORE_IDS: {
      return {
        ...state,
        selectedWellboreIds: { ...state.selectedWellboreIds, ...action.ids },
      };
    }

    case SET_SELECTED_SECONDARY_WELL_IDS: {
      if (action.reset) {
        return {
          ...state,
          selectedSecondaryWellIds: action.ids,
          selectedSecondaryWellboreIds: {},
        };
      }

      return {
        ...state,
        selectedSecondaryWellIds: {
          ...state.selectedSecondaryWellIds,
          ...action.ids,
        },
      };
    }

    case SET_SELECTED_SECONDARY_WELLBORE_IDS: {
      return {
        ...state,
        selectedSecondaryWellboreIds: {
          ...state.selectedSecondaryWellboreIds,
          ...action.ids,
        },
      };
    }

    case SET_SELECTED_WELLBORE_IDS_WITH_WELL_ID: {
      const selectedWellboreIds = {
        ...state.selectedWellboreIds,
        ...action.ids,
      };

      const selectedWellIds = {
        ...state.selectedWellIds,
      };

      const wellbores = flatMap(
        state.wells.filter(
          (well) => well.id === action.wellId && well.wellbores
        ),
        'wellbores'
      ) as Wellbore[];

      const isSomeWellboresSelected = wellbores.some(
        (wellbore) => selectedWellboreIds[wellbore.id] === true
      );

      if (isSomeWellboresSelected) {
        selectedWellIds[action.wellId] = true;
      } else {
        selectedWellIds[action.wellId] = false;
      }

      return {
        ...state,
        selectedWellboreIds,
        selectedWellIds,
      };
    }

    case SET_SEARCH_PHRASE: {
      return {
        ...state,
        currentQuery: { ...state.currentQuery, phrase: action.phrase },
      };
    }

    case SET_HAS_SEARCHED: {
      return {
        ...state,
        currentQuery: {
          ...state.currentQuery,
          hasSearched: action.hasSearched,
        },
      };
    }

    case TOGGLE_EXPANDED_WELL_ID: {
      return {
        ...state,
        expandedWellIds: {
          ...state.expandedWellIds,
          ...{
            [action.id]: !state.expandedWellIds[action.id],
          },
        },
      };
    }

    case TOGGLE_SELECTED_WELLS: {
      const selectedWellIds: typeof state.selectedWellIds = {};
      if (action.value) {
        state.wells.forEach((wellData) => {
          selectedWellIds[wellData.id] = true;
        });
      }
      return {
        ...state,
        selectedWellIds,
        selectedWellboreIds: action.value ? state.selectedWellboreIds : {},
      };
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

    case SET_WELLBORE_SEQUENCES: {
      const updatedWellboreData = { ...state.wellboreData };
      Object.keys(action.data).forEach((wellboreId) => {
        const wbId = Number(wellboreId);
        if (updatedWellboreData[wbId]) {
          updatedWellboreData[wbId][action.sequenceType] = action.data[
            wbId
          ].map((sequence) => ({
            sequence,
          }));
        } else {
          updatedWellboreData[wbId] = {
            [action.sequenceType]: action.data[wbId].map((sequence) => ({
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

    case SET_PPFG_ROW_DATA: {
      const updatedWellboreData = { ...state.wellboreData };

      action.data.forEach((ppfgData) => {
        const wellboreId = ppfgData.sequence.assetId as number;
        const newList = (
          updatedWellboreData[wellboreId].ppfg as SequenceData[]
        ).map((ppfgRow) =>
          ppfgRow.sequence.id === ppfgData.sequence.id
            ? { ...ppfgRow, rows: ppfgData.rows }
            : ppfgRow
        );
        updatedWellboreData[wellboreId] = {
          ...updatedWellboreData[wellboreId],
          ...{ ppfg: newList },
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

    case SET_ALL_WELLBORES_FETCHING: {
      return {
        ...state,
        allWellboresFetching: action.allWellboresFetching,
      };
    }

    case SET_WELLBORES_FETCHED_WELL_IDS: {
      return {
        ...state,
        wellboresFetchedWellIds: [
          ...state.wellboresFetchedWellIds,
          ...action.wellIds,
        ],
      };
    }

    case SET_HOVERED_WELLBORE_IDS: {
      const hoveredWellboreIds: typeof state.hoveredWellboreIds = {};

      if (action.wellboreId) {
        hoveredWellboreIds[action.wellboreId] = true;
      } else {
        (
          flatMap(
            state.wells.filter(
              (well) => well.id === action.wellId && well.wellbores
            ),
            'wellbores'
          ) as Wellbore[]
        ).forEach((wellbore) => {
          hoveredWellboreIds[wellbore?.id] = true;
        });
      }

      return {
        ...state,
        hoveredWellboreIds,
        hoveredWellId: action.wellId,
      };
    }
    case SET_WELL_CARD_SELECTED_WELL_ID: {
      // only one well id selected at a time for well card
      return {
        ...state,
        wellCardSelectedWellId: action.wellId,
      };
    }

    case SET_WELL_CARD_SELECTED_WELLBORE_ID: {
      const wellCardSelectedWellBoreId: typeof state.wellCardSelectedWellBoreId =
        {};

      action.wellboreIds.forEach((item) => {
        wellCardSelectedWellBoreId[item] = true;
      });

      return {
        ...state,
        wellCardSelectedWellBoreId,
      };
    }

    case SET_INSECT_WELLBORES_CONTEXT: {
      return {
        ...state,
        inspectWellboreContext: action.context,
      };
    }

    case SET_FAVORITE_HOVERED_OR_CHECKED_WELLS: {
      return {
        ...state,
        wellFavoriteHoveredOrCheckedWells: [...action.wellIds],
      };
    }

    case SET_FAVORITE_ID: {
      return {
        ...state,
        selectedFavoriteId: action.favoriteId,
      };
    }

    default:
      return state;
  }
}
