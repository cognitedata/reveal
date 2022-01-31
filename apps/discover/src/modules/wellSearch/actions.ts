import groupBy from 'lodash/groupBy';

import { storage } from '@cognite/react-container';
import { Sequence, Asset } from '@cognite/sdk';

import { ThunkResult } from 'core/types';
import { Column } from 'modules/documentSearch/types';
import {
  TOGGLE_SELECTED_WELLBORE_OF_WELL,
  WellboreId,
} from 'modules/wellSearch/types';

import { wellSearchService, SequenceFilter } from './service';
import {
  SET_LOG_TYPE,
  SET_LOGS_ROW_DATA,
  TOGGLE_EXPANDED_WELL_ID,
  TOGGLE_SELECTED_WELLS,
  Well,
  LogTypes,
  SET_WELLBORE_ASSETS,
  SET_WELLBORE_DIGITAL_ROCK_SAMPLES,
  AssetTypes,
  WellboreDigitalRockSamples,
  GrainAnalysisTypes,
  SET_GRAIN_ANALYSIS_DATA,
  WELL_ADD_SELECTED_COLUMN,
  WELL_SET_SELECTED_COLUMN,
  WELL_REMOVE_SELECTED_COLUMN,
  WellboreAssetIdMap,
} from './types';
import { getWellboreAssetIdReverseMap } from './utils/common';

export const WELL_SELECTED_COLUMNS = 'WELL_SELECTED_COLUMNS';

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

function toggleExpandedWell(well: Well, reset = false): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: TOGGLE_EXPANDED_WELL_ID,
      id: well.id,
      reset,
    });
  };
}

function toggleSelectedWells(
  wells: Well[],
  options: {
    isSelected: boolean;
    clear?: boolean;
  }
): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: TOGGLE_SELECTED_WELLS,
      wells,
      isSelected: options.isSelected,
      clear: options.clear,
    });
  };
}

function toggleSelectedWellboreOfWell({
  well,
  wellboreId,
  isSelected,
}: {
  well: Well;
  wellboreId: WellboreId;
  isSelected: boolean;
}): ThunkResult<void> {
  return (dispatch) => {
    dispatch({
      type: TOGGLE_SELECTED_WELLBORE_OF_WELL,
      well,
      wellboreId,
      isSelected,
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
        const wellboreAssets = groupBy(assets, 'parentId') as {
          [x: string]: any;
        };
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

export const wellSearchActions = {
  toggleSelectedWells,
  toggleSelectedWellboreOfWell,
  getWellboreAssets,
  toggleExpandedWell,
  getLogType,
  getLogData,
  getDigitalRockSamples,
  getGrainAnalysisData,
  addSelectedColumn,
  removeSelectedColumn,
  setSelectedColumns,
  initialize,
};
