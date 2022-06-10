import { Well } from 'domain/wells/well/internal/types';

import chunk from 'lodash/chunk';
import groupBy from 'lodash/groupBy';
import { log } from 'utils/log';

import { storage } from '@cognite/react-container';
import { Asset } from '@cognite/sdk';

import { showErrorMessage } from 'components/Toast';
import { ThunkResult } from 'core/types';
import {
  Sequence,
  TOGGLE_SELECTED_WELLBORE_OF_WELL,
  WellboreId,
} from 'modules/wellSearch/types';
import { Column } from 'pages/authorized/search/common/types';

import { getChunkNumberList, wellSearchService } from './service';
import {
  TOGGLE_EXPANDED_WELL_ID,
  TOGGLE_SELECTED_WELLS,
  SET_WELLBORE_ASSETS,
  SET_WELLBORE_DIGITAL_ROCK_SAMPLES,
  AssetTypes,
  WellboreDigitalRockSamples,
  GrainAnalysisTypes,
  SET_GRAIN_ANALYSIS_DATA,
  WELL_ADD_SELECTED_COLUMN,
  WELL_SET_SELECTED_COLUMN,
  WELL_REMOVE_SELECTED_COLUMN,
  WellboreExternalAssetIdMap,
} from './types';

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

async function getAssetsByExternalParentIds(
  externalParentIds: string[],
  fetcher: any
) {
  if (fetcher) {
    const idChunkList = chunk(externalParentIds, 100);
    const responses = Promise.all(
      idChunkList.map((idChunk: string[]) =>
        fetcher({
          parentExternalIds: idChunk,
        })
      )
    );
    return [].concat(
      ...(await responses).map((response) =>
        response.items ? response.items : response
      )
    );
  }
  log('fetcher configurations not found while fetching assets by wellbore id');
  showErrorMessage('Digital Rocks not configured');
  return Promise.resolve([] as Asset[]);
}

function getWellboreAssetsByExternalParentIds(
  wellboreIds: WellboreId[],
  wellboreAssetIdMap: WellboreExternalAssetIdMap,
  assetType: AssetTypes,
  fetcher: any
): ThunkResult<void> {
  return (dispatch) => {
    return getAssetsByExternalParentIds(
      wellboreIds.map((id) => wellboreAssetIdMap[id]),
      fetcher
    ).then((data: Asset[]) => {
      const wellboreAssets = groupBy(data, 'parentExternalId') as {
        [x: string]: any;
      };

      wellboreIds.forEach((wellboreId) => {
        if (!wellboreAssets[wellboreId]) {
          wellboreAssets[wellboreId] = [];
        }
      });

      dispatch({
        type: SET_WELLBORE_ASSETS,
        data: wellboreIds.reduce((previousValue, currentValue) => {
          const data = wellboreAssets[wellboreAssetIdMap[currentValue]];
          return { ...previousValue, [currentValue]: data || [] };
        }, {}),
        assetType,
      });
    });
  };
}

/**
 *  @deprecated this is only for v2 and only for digital rocks asset lookups
 */
async function getAssetsByParentIds(parentIds: number[], fetcher: any) {
  if (fetcher) {
    const idChunkList = getChunkNumberList(parentIds, 100);
    const responses = Promise.all(
      idChunkList.map((idChunk: number[]) =>
        fetcher({
          parentIds: idChunk,
        })
      )
    );
    return [].concat(
      ...(await responses).map((response) =>
        response.items ? response.items : response
      )
    );
  }
  log('fetcher configurations not found while fetching assets by wellbore id');
  showErrorMessage('Digital Rocks not configured');
  return Promise.resolve([] as Asset[]);
}

function getDigitalRockSamples(
  digitalRocks: Asset[],
  wellboreAssetIdReverseMap: { [key: string]: string },
  fetcher: any
): ThunkResult<void> {
  return (dispatch) => {
    const parentIds = digitalRocks.map((row) => row.id);
    return getAssetsByParentIds(parentIds, fetcher).then((data: Asset[]) => {
      const groupedSamples = groupBy(data, 'parentId');
      const wellboreDigitalRockSamples = digitalRocks.reduce(
        (prev, current) => {
          return [
            ...prev,
            {
              wellboreId:
                wellboreAssetIdReverseMap[current.parentExternalId || ''],
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
  toggleExpandedWell,
  getDigitalRockSamples,
  getGrainAnalysisData,
  addSelectedColumn,
  removeSelectedColumn,
  setSelectedColumns,
  initialize,
  getWellboreAssetsByExternalParentIds,
};
