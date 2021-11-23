import flatMap from 'lodash/flatMap';
import groupBy from 'lodash/groupBy';
import merge from 'lodash/merge';

import { storage } from '@cognite/react-container';
import { CogniteError, Sequence, Asset } from '@cognite/sdk';
import { Polygon } from '@cognite/sdk-wells-v2';

import { log } from '_helpers/log';
import { showWarningMessage } from 'components/toast';
import { ThunkResult } from 'core/types';
import { Column } from 'modules/documentSearch/types';
import { WELL_SEARCH_ACCESS_ERROR } from 'modules/wellSearch/constants';
import { CommonWellFilter } from 'modules/wellSearch/types';
import { filterConfigsById } from 'modules/wellSearch/utils/sidebarFilters';

import {
  wellSearchService,
  getByFilters,
  SequenceFilter,
  getGroupedWellboresByWellIds,
} from './service';
import {
  SequenceRow,
  SET_IS_SEARCHING,
  RESET_QUERY,
  SET_WELLS_DATA,
  SET_WELLBORES,
  SET_SELECTED_WELL_ID,
  SET_SEARCH_PHRASE,
  SET_LOG_TYPE,
  SET_LOGS_ROW_DATA,
  SET_HAS_SEARCHED,
  SET_SELECTED_WELLBORE_IDS,
  TOGGLE_EXPANDED_WELL_ID,
  TOGGLE_SELECTED_WELLS,
  Well,
  Wellbore,
  WellFilterMap,
  WellState,
  WellName,
  WellSearchAction,
  SET_HOVERED_WELL,
  SET_PPFG_ROW_DATA,
  SET_GEOMECHANIC_ROW_DATA,
  SET_HOVERED_WELLBORE_IDS,
  LogTypes,
  SequenceTypes,
  SET_WELLBORE_SEQUENCES,
  SET_WELLBORE_ASSETS,
  SET_WELLBORE_DIGITAL_ROCK_SAMPLES,
  AssetTypes,
  WellboreDigitalRockSamples,
  GrainAnalysisTypes,
  SET_GRAIN_ANALYSIS_DATA,
  SET_ALL_WELLBORES_FETCHING,
  SET_WELLBORES_FETCHED_WELL_IDS,
  WELL_ADD_SELECTED_COLUMN,
  WELL_SET_SELECTED_COLUMN,
  WELL_REMOVE_SELECTED_COLUMN,
  SET_SELECTED_WELLBORE_IDS_WITH_WELL_ID,
  InspectWellboreContext,
  SET_INSECT_WELLBORES_CONTEXT,
  WellboreAssetIdMap,
  SET_WELL_CARD_SELECTED_WELL_ID,
  SET_WELL_CARD_SELECTED_WELLBORE_ID,
  SET_FAVORITE_HOVERED_OR_CHECKED_WELLS,
  SET_FAVORITE_ID,
  SET_SELECTED_SECONDARY_WELL_IDS,
  SET_SELECTED_SECONDARY_WELLBORE_IDS,
} from './types';
import { getPrestineWellIds } from './utils';
import { getWellboreAssetIdReverseMap } from './utils/common';

function resetQuery(): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: RESET_QUERY,
    });
  };
}

export function setHoveredWellId(well?: Well) {
  return {
    type: SET_HOVERED_WELL,
    wellId: well?.id,
  };
}

const startSearch: WellSearchAction = {
  type: SET_IS_SEARCHING,
  isSearching: true,
};
const endSearch: WellSearchAction = {
  type: SET_IS_SEARCHING,
  isSearching: false,
};
const startAllWellboresFetching: WellSearchAction = {
  type: SET_ALL_WELLBORES_FETCHING,
  allWellboresFetching: true,
};

const endAllWellboresFetching: WellSearchAction = {
  type: SET_ALL_WELLBORES_FETCHING,
  allWellboresFetching: false,
};

export const WELL_SELECTED_COLUMNS = 'WELL_SELECTED_COLUMNS';

export function search(filters: WellFilterMap): ThunkResult<void> {
  return (dispatch, getState) => {
    dispatch({
      type: SET_HAS_SEARCHED,
      hasSearched: true,
    });
    dispatch(startSearch);
    const state = getState();
    const wellFilters: CommonWellFilter = Object.keys(filters).reduce(
      (prev, current) => {
        const id = Number(current);
        const { filterParameters } = filterConfigsById[id];
        return filterParameters && filters[id].length
          ? merge(prev, {
              ...filterParameters(filters[id] as string[]),
              npt: {
                ...prev.npt,
                ...filterParameters(filters[id] as string[]).npt,
              },
              nds: {
                ...prev.nds,
                ...filterParameters(filters[id] as string[]).nds,
              },
            })
          : prev;
      },
      {} as CommonWellFilter
    );

    // Apply Geo Filter
    const { geoFilter } = state.map;
    if (geoFilter && geoFilter.length) {
      wellFilters.polygon = {
        geoJsonGeometry: geoFilter[0].geometry as unknown as Polygon,
        crs: 'epsg:4326',
      };
    }

    // Apply Query Filter
    if (state.sidebar.searchPhrase) {
      wellFilters.stringMatching = state.sidebar.searchPhrase;
    }

    getByFilters(wellFilters)
      .then(async (wellResults) => {
        dispatch({
          type: SET_HAS_SEARCHED,
          hasSearched: true,
        });
        dispatch({
          type: SET_WELLS_DATA,
          wells: wellResults,
        });
        dispatch(endSearch);
      })
      .catch((error: CogniteError) => {
        log('error', [error && error.message], 3);
        if (error.status === 403) {
          showWarningMessage(WELL_SEARCH_ACCESS_ERROR);
        }
        dispatch(endSearch);
      });
  };
}

function selectWellById(id: number) {
  return {
    type: SET_SELECTED_WELL_ID,
    id,
    value: true,
  };
}

function setSearchPhrase(phrase: string): ThunkResult<void> {
  return (dispatch) => {
    dispatch({ type: SET_SEARCH_PHRASE, phrase });
  };
}

function getWellbores(wellIds: number[]): ThunkResult<void> {
  return (dispatch) => {
    return getGroupedWellboresByWellIds(wellIds).then((groupedData) => {
      dispatch({
        type: SET_WELLBORES,
        data: groupedData,
      });
      if (wellIds.length > 1) {
        dispatch(setAllWellboresSelected());
      }
      dispatch(setWellboresFetched(wellIds));
      dispatch(endAllWellboresFetching);
    });
  };
}

function getAllWellbores(): ThunkResult<void> {
  return (dispatch, getState) => {
    const state = getState();
    // get well id from selected state
    const prestineWellIds = getPrestineWellIds(
      state.wellSearch.selectedWellIds,
      state.wellSearch.wells
    );

    if (prestineWellIds.length) {
      dispatch(startAllWellboresFetching);
      dispatch(getWellbores(prestineWellIds));
    } else {
      dispatch(setAllWellboresSelected());
    }
  };
}

function setAllWellboresSelected(): ThunkResult<void> {
  return (dispatch, getState) => {
    const state = getState();
    const selectedWellbores = (
      flatMap(
        state.wellSearch.wells.filter((well) => well.wellbores),
        'wellbores'
      ) as Wellbore[]
    ).reduce((prev, current) => ({ ...prev, [current.id]: true }), {});
    dispatch(setSelectedWellbores(selectedWellbores));
  };
}

function getWellboreSequences(
  wellboreIds: number[],
  wellboreAssetIdMap: WellboreAssetIdMap,
  sequenceType: SequenceTypes,
  fetcher: any
): ThunkResult<void> {
  const wellboreAssetIdReverseMap =
    getWellboreAssetIdReverseMap(wellboreAssetIdMap);
  return (dispatch) => {
    return wellSearchService
      .getSequencesByAssetIds(
        wellboreIds.map((id) => wellboreAssetIdMap[id]),
        fetcher
      )
      .then((data: Sequence[]) => {
        const sequences = data.map((item) => ({
          ...item,
          assetId: wellboreAssetIdReverseMap[item.assetId as number],
        }));
        const wellboreSeqeunces = groupBy(sequences, 'assetId');
        wellboreIds.forEach((wellboreId) => {
          if (!wellboreSeqeunces[wellboreId]) {
            wellboreSeqeunces[wellboreId] = [];
          }
        });
        dispatch({
          type: SET_WELLBORE_SEQUENCES,
          data: wellboreSeqeunces,
          sequenceType,
        });
      });
  };
}

function getGrainAnalysisData(
  digitalRockSample: Asset,
  grainAnalysisType: GrainAnalysisTypes,
  fetcher: any
): ThunkResult<void> {
  return (dispatch) => {
    return wellSearchService
      .getSequencesByAssetIds([digitalRockSample.id], fetcher)
      .then((sequences: Sequence[]) => {
        if (sequences.length) {
          sequences.forEach((sequence) => {
            wellSearchService.getSequenceRowData(sequence.id).then((rows) => {
              const data = [
                {
                  sequence,
                  rows,
                },
              ];
              dispatch({
                type: SET_GRAIN_ANALYSIS_DATA,
                digitalRockSample,
                grainAnalysisType,
                data,
              });
            });
          });
        } else {
          dispatch({
            type: SET_GRAIN_ANALYSIS_DATA,
            digitalRockSample,
            grainAnalysisType,
            data: [],
          });
        }
      });
  };
}

function setSelectedWell(well: WellName, value: boolean): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: SET_SELECTED_WELL_ID,
      id: well.id,
      value,
    });
  };
}

function setSelectedWellbores(
  ids: WellState['selectedWellIds']
): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: SET_SELECTED_WELLBORE_IDS,
      ids,
    });
  };
}

function setSelectedWellboresWithWell(
  ids: WellState['selectedWellIds'],
  wellId: number
): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: SET_SELECTED_WELLBORE_IDS_WITH_WELL_ID,
      ids,
      wellId,
    });
  };
}

function toggleExpandedWell(well: Well): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: TOGGLE_EXPANDED_WELL_ID,
      id: well.id,
    });
  };
}

function toggleSelectedWells(value: boolean): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: TOGGLE_SELECTED_WELLS,
      value,
    });
  };
}

function getLogType(
  wellboreIds: number[],
  wellboreAssetIdMap: WellboreAssetIdMap,
  logQueries: SequenceFilter[] = [],
  logTypes: LogTypes[] = []
): ThunkResult<void> {
  const wellboreAssetIdReverseMap =
    getWellboreAssetIdReverseMap(wellboreAssetIdMap);
  return (dispatch) => {
    const fetchingIndex: Record<number, LogTypes> = {};
    const fetching = logQueries.map((filters, index) => {
      fetchingIndex[index] = logTypes[index];
      return wellSearchService
        .getSequenceByWellboreIds(
          wellboreIds.map((id) => wellboreAssetIdMap[id]),
          {
            ...filters,
          }
        )
        .then((response) => {
          return response.map((item) => ({
            ...item,
            assetId: wellboreAssetIdReverseMap[item.assetId as number],
          }));
        });
    });

    return Promise.all(fetching).then((fetchedSequenceSet) => {
      interface DataFetched {
        [key: number]: Sequence[];
      }
      const data: Record<LogTypes, DataFetched> = {
        logs: [],
        logsFrmTops: [],
      };

      fetchedSequenceSet.forEach((sequenceSet, sequenceFetchingIndex) => {
        const indexKey = fetchingIndex[sequenceFetchingIndex];

        data[indexKey] = {
          ...data[indexKey],
          ...(groupBy(sequenceSet, 'assetId') || {}),
        };

        wellboreIds.forEach((wellboreId) => {
          if (!data[indexKey][wellboreId]) {
            data[indexKey][wellboreId] = [];
          }
        });
      });

      dispatch({
        type: SET_LOG_TYPE,
        data,
      });
    });
  };
}

function getLogData(
  logs: Sequence[],
  logsFrmTops: Sequence[]
): ThunkResult<void> {
  return (dispatch) => {
    return wellSearchService
      .getLogsDataByLogs(logs, logsFrmTops)
      .then((logsData: { logs: any[]; logsFrmTops: any[] }) => {
        dispatch({
          type: SET_LOGS_ROW_DATA,
          data: logsData,
        });
      });
  };
}

function getPPFGData(ppfg: Sequence): ThunkResult<void> {
  return (dispatch) => {
    return wellSearchService
      .getSequenceRowData(ppfg.id)
      .then((rows: SequenceRow[]) => {
        dispatch({
          type: SET_PPFG_ROW_DATA,
          data: [{ sequence: ppfg, rows }],
        });
      });
  };
}

function getGeomechanicData(geomechanic: Sequence): ThunkResult<void> {
  return (dispatch) => {
    return wellSearchService
      .getSequenceRowData(geomechanic.id)
      .then((rows: SequenceRow[]) => {
        dispatch({
          type: SET_GEOMECHANIC_ROW_DATA,
          data: [{ sequence: geomechanic, rows }],
        });
      });
  };
}

function getWellboreAssets(
  wellboreIds: number[],
  wellboreAssetIdMap: WellboreAssetIdMap,
  assetType: AssetTypes,
  fetcher: any
): ThunkResult<void> {
  const wellboreAssetIdReverseMap =
    getWellboreAssetIdReverseMap(wellboreAssetIdMap);
  return (dispatch) => {
    return wellSearchService
      .getAssetsByParentIds(
        wellboreIds.map((id) => wellboreAssetIdMap[id]),
        fetcher
      )
      .then((data: Asset[]) => {
        const assets = data.map((item) => ({
          ...item,
          parentId: wellboreAssetIdReverseMap[item.parentId as number],
        }));
        const wellboreAssets = groupBy(assets, 'parentId');
        wellboreIds.forEach((wellboreId) => {
          if (!wellboreAssets[wellboreId]) {
            wellboreAssets[wellboreId] = [];
          }
        });
        dispatch({
          type: SET_WELLBORE_ASSETS,
          data: wellboreAssets,
          assetType,
        });
      });
  };
}

function getDigitalRockSamples(
  digitalRocks: Asset[],
  fetcher: any
): ThunkResult<void> {
  return (dispatch) => {
    const parentIds = digitalRocks.map((row) => row.id);
    return wellSearchService
      .getAssetsByParentIds(parentIds, fetcher)
      .then((data: Asset[]) => {
        const groupedSamples = groupBy(data, 'parentId');
        const wellboreDigitalRockSamples = digitalRocks.reduce(
          (prev, current) => {
            return [
              ...prev,
              {
                wellboreId: current.parentId as number,
                digitalRockId: current.id,
                digitalRockSamples: groupedSamples[current.id] || [],
              },
            ];
          },
          [] as WellboreDigitalRockSamples[]
        );
        dispatch({
          type: SET_WELLBORE_DIGITAL_ROCK_SAMPLES,
          data: wellboreDigitalRockSamples,
        });
      });
  };
}

function addSelectedColumn(column: Column): ThunkResult<void> {
  return (dispatch, getState) => {
    dispatch({
      type: WELL_ADD_SELECTED_COLUMN,
      column: column.field,
    });
    const state = getState().wellSearch;
    storage.setItem(WELL_SELECTED_COLUMNS, state.selectedColumns);
  };
}
function setSelectedColumns(columns: string[]): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: WELL_SET_SELECTED_COLUMN,
      columns,
    });
    storage.setItem(WELL_SELECTED_COLUMNS, columns);
  };
}

function removeSelectedColumn(column: Column): ThunkResult<void> {
  return (dispatch, getState) => {
    dispatch({
      type: WELL_REMOVE_SELECTED_COLUMN,
      column: column.field,
    });
    const state = getState().wellSearch;
    storage.setItem(WELL_SELECTED_COLUMNS, state.selectedColumns);
  };
}

// this is for the selected columns for the search results
function getJsonOrDefault(selectedColumns: string[], defaultColumns: string[]) {
  if (!selectedColumns) {
    return defaultColumns;
  }
  const deprecatedColumns: string[] = [];

  return selectedColumns.filter(
    (column) => !deprecatedColumns.includes(column)
  );
}

function initialize(): ThunkResult<void> {
  return (dispatch, getState) => {
    const json = storage.getItem(WELL_SELECTED_COLUMNS) as string[];
    const state = getState();
    const columns = getJsonOrDefault(json, state.wellSearch.selectedColumns);

    dispatch({
      type: WELL_SET_SELECTED_COLUMN,
      columns,
    });
  };
}

function setHoveredWellbores(
  wellId: number,
  wellboreId?: number
): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: SET_HOVERED_WELLBORE_IDS,
      wellId,
      wellboreId,
    });
  };
}

function setWellCardSelectedWellId(wellId: number): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: SET_WELL_CARD_SELECTED_WELL_ID,
      wellId,
    });
  };
}

function setFavoriteHoveredOrCheckedWells(
  wellIds: number[]
): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: SET_FAVORITE_HOVERED_OR_CHECKED_WELLS,
      wellIds,
    });
  };
}

function setSelectedFavoriteId(favoriteId: string): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: SET_FAVORITE_ID,
      favoriteId,
    });
  };
}

function setWellCardSelectedWellBoreId(
  wellboreIds: number[]
): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: SET_WELL_CARD_SELECTED_WELLBORE_ID,
      wellboreIds,
    });
  };
}

function setWellbores(groupedDate: {
  [wellId: number]: Wellbore[];
}): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: SET_WELLBORES,
      data: groupedDate,
    });
  };
}

function setWellboreInspectContext(
  context: InspectWellboreContext
): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: SET_INSECT_WELLBORES_CONTEXT,
      context,
    });
  };
}

function setWellboresFetched(wellIds: number[]): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: SET_WELLBORES_FETCHED_WELL_IDS,
      wellIds,
    });
  };
}

const setSelectedSecondaryWellIds = (
  ids: WellState['selectedSecondaryWellIds'],
  reset: boolean
): ThunkResult<void> => {
  return (dispatch) => {
    dispatch({
      type: SET_SELECTED_SECONDARY_WELL_IDS,
      ids,
      reset,
    });
  };
};

const setSelectedSecondaryWellboreIds = (
  ids: WellState['selectedSecondaryWellboreIds']
): ThunkResult<void> => {
  return (dispatch) => {
    dispatch({
      type: SET_SELECTED_SECONDARY_WELLBORE_IDS,
      ids,
    });
  };
};

export const wellSearchActions = {
  setSelectedWell,
  selectWellById,
  search,
  setSearchPhrase,
  getWellbores,
  getWellboreSequences,
  getWellboreAssets,
  setSelectedWellbores,
  resetQuery,
  toggleExpandedWell,
  toggleSelectedWells,
  getLogType,
  getLogData,
  getPPFGData,
  getGeomechanicData,
  getDigitalRockSamples,
  getGrainAnalysisData,
  getAllWellbores,
  addSelectedColumn,
  removeSelectedColumn,
  setSelectedColumns,
  initialize,
  setSelectedWellboresWithWell,
  setHoveredWellbores,
  setWellbores,
  setWellboreInspectContext,
  setWellCardSelectedWellId,
  setWellCardSelectedWellBoreId,
  setWellboresFetched,
  setFavoriteHoveredOrCheckedWells,
  setSelectedFavoriteId,
  setSelectedSecondaryWellIds,
  setSelectedSecondaryWellboreIds,
};
