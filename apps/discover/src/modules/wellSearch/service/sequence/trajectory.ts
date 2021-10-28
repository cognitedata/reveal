import chunk from 'lodash/chunk';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import invert from 'lodash/invert';
import max from 'lodash/max';
import uniqueId from 'lodash/uniqueId';

import { Metrics } from '@cognite/metrics';
import { Sequence, SequenceColumn, SequenceFilter } from '@cognite/sdk';
import {
  TrajectoryData as TrajectoryDataV3,
  TrajectoryDataItems,
  TrajectoryDataRow,
  TrajectoryItems,
} from '@cognite/sdk-wells-v3';

import { getCogniteSDKClient } from '_helpers/getCogniteSDKClient';
import { LOG_WELLS_TRAJECTORY_NAMESPACE } from 'constants/logging';
import {
  TimeLogStages,
  useStartTimeLogger,
  useStopTimeLogger,
} from 'hooks/useTimeLog';
import { toIdentifier } from 'modules/wellSearch/sdk/utils';
import { getWellSDKClient } from 'modules/wellSearch/sdk/v3';
import {
  SequenceRow,
  TrajectoryColumnR,
  TrajectoryData,
  TrajectoryRow,
  TrajectoryRows,
  WellboreAssetIdMap,
  WellboreId,
  WellboreSourceExternalIdMap,
} from 'modules/wellSearch/types';
import {
  getExistColumns,
  mapDataToTrajectoryRowType,
} from 'modules/wellSearch/utils/trajectory';

import { TRAJECTORY_COLUMNS, TRAJECTORY_COLUMN_NAME_MAP } from './constants';

const CHUNK_LIMIT = 100;

export async function getTrajectoriesByWellboreIds(
  wellboreIds: WellboreId[],
  wellboreAssetIdMap: WellboreAssetIdMap,
  wellboreSourceExternalIdMap: WellboreSourceExternalIdMap,
  sequenceFilter: SequenceFilter = {},
  columns: TrajectoryColumnR[] = [],
  metric?: Metrics,
  enableWellSDKV3?: boolean
) {
  let networkTimer;
  if (metric) {
    networkTimer = useStartTimeLogger(
      TimeLogStages.Network,
      metric,
      LOG_WELLS_TRAJECTORY_NAMESPACE
    );
  }

  const trajectoryData = enableWellSDKV3
    ? await fetchTrajectoriesUsingWellsSDK(
        wellboreIds,
        wellboreSourceExternalIdMap,
        columns
      )
    : await fetchTrajectoriesUsingCogniteSDK(
        wellboreIds,
        wellboreAssetIdMap,
        sequenceFilter,
        columns
      );

  useStopTimeLogger(networkTimer, {
    noOfWellbores: wellboreIds.length,
  });

  return trajectoryData;
}

export const fetchTrajectoriesUsingWellsSDK = async (
  wellboreIds: WellboreId[],
  wellboreSourceExternalIdMap: WellboreSourceExternalIdMap,
  columns: TrajectoryColumnR[] = []
) => {
  const trajectoriesList = (await getWellSDKClient().trajectories.list({
    filter: {
      wellboreIds: wellboreIds.map(toIdentifier),
    },
    limit: CHUNK_LIMIT,
  })) as TrajectoryItems;

  const trajectoryData = (await getWellSDKClient().trajectories.listData(
    trajectoriesList.items.map((item) => ({
      sequenceExternalId: item.source.sequenceExternalId,
    }))
  )) as TrajectoryDataItems;

  const groupedTrajectoryData = groupBy(
    trajectoryData.items,
    'wellboreAssetExternalId'
  );

  const availableColumnNames = Object.keys(TRAJECTORY_COLUMN_NAME_MAP);
  const existColumns = columns.filter((column) =>
    availableColumnNames.includes(column.name)
  );

  const convertedTrajectoryData = Object.keys(groupedTrajectoryData).map(
    (wellboreAssetExternalId) => {
      const wellboreId = wellboreSourceExternalIdMap[wellboreAssetExternalId];
      const trajectoryData = groupedTrajectoryData[wellboreAssetExternalId][0];

      return convertToCustomTrajectoryData(
        wellboreId,
        trajectoryData,
        existColumns
      );
    }
  );

  return getGroupedTrajectoryData(convertedTrajectoryData, wellboreIds);
};

export const convertToCustomTrajectoryData = (
  wellboreId: WellboreId,
  trajectoryData: TrajectoryDataV3,
  columns: TrajectoryColumnR[] = []
): TrajectoryData => {
  const trajectoryId = Number(uniqueId());
  const maxMeasuredDepth = max(
    trajectoryData.rows.map((row) => row.measuredDepth)
  );
  const maxTrueVerticalDepth = max(
    trajectoryData.rows.map((row) => row.trueVerticalDepth)
  );

  const sequence = {
    id: trajectoryId,
    columns: columns as SequenceColumn[],
    assetId: wellboreId,
    name: trajectoryData.source.sourceName,
    externalId: trajectoryData.wellboreAssetExternalId,
    metadata: {
      parentExternalId: trajectoryData.wellboreAssetExternalId,
      source: trajectoryData.source.sourceName,
      type: trajectoryData.type,
      bh_md: String(maxMeasuredDepth),
      bh_tvd: String(maxTrueVerticalDepth),
    },
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  } as Sequence;

  const rowData = {
    wellboreId,
    id: trajectoryId,
    externalId: trajectoryData.wellboreAssetExternalId,
    columns,
    rows: trajectoryData.rows.map(convertToTrajectoryRow),
  } as TrajectoryRows;

  return { sequence, rowData };
};

export const convertToTrajectoryRow = (
  row: TrajectoryDataRow,
  rowNumber: number
): TrajectoryRow => {
  const values = TRAJECTORY_COLUMNS.map((column) => {
    const columnName = get(TRAJECTORY_COLUMN_NAME_MAP, column.name, '');
    const value = get(row, columnName, 0);
    return value;
  });
  return { rowNumber, values };
};

export const fetchTrajectoriesUsingCogniteSDK = async (
  wellboreIds: WellboreId[],
  wellboreAssetIdMap: WellboreAssetIdMap,
  sequenceFilter: SequenceFilter = {},
  columns: TrajectoryColumnR[] = []
) => {
  const wellboreAssetIdReverseMap = invert(wellboreAssetIdMap);
  const idChunkList = chunk(wellboreIds, CHUNK_LIMIT);
  const sequences = Promise.all(
    idChunkList.map((idChunk) =>
      getCogniteSDKClient()
        .sequences.list({
          filter: {
            assetIds: idChunk.map((id) => wellboreAssetIdMap[id]),
            ...sequenceFilter.filter,
          },
        })
        .then((list) => {
          return Promise.all(
            list.items.map((sequence) => {
              const existColumns = getExistColumns(sequence, columns);
              return getTrajectoryDataById(
                sequence.id,
                existColumns.map((col) => col.name)
              ).then((rowData) => {
                const convertedRowData = mapDataToTrajectoryRowType(
                  sequence,
                  rowData,
                  existColumns
                );
                return {
                  sequence: {
                    ...sequence,
                    assetId: Number(
                      wellboreAssetIdReverseMap[Number(sequence.assetId)]
                    ),
                  },
                  rowData: {
                    ...convertedRowData,
                    wellboreId:
                      wellboreAssetIdReverseMap[convertedRowData.wellboreId],
                  },
                };
              });
            })
          );
        })
    )
  );
  const trajectoryData = ([] as TrajectoryData[]).concat(...(await sequences));

  return getGroupedTrajectoryData(trajectoryData, wellboreIds);
};

export const getGroupedTrajectoryData = (
  trajectoryData: TrajectoryData[],
  wellboreIds: WellboreId[]
) => {
  const groupedData = groupBy(trajectoryData, 'sequence.assetId');
  wellboreIds.forEach((wellboreId) => {
    groupedData[wellboreId] = groupedData[wellboreId] || [];
  });
  return groupedData;
};

export function getTrajectoryDataById(
  trajId: number,
  columns: string[]
): Promise<SequenceRow[]> {
  return getCogniteSDKClient()
    .sequences.retrieveRows({
      id: trajId,
      start: 0,
      end: 1000,
      limit: 1000,
      columns,
    })
    .autoPagingToArray({ limit: 1000 })
    .catch((error) => {
      console.error('error', error);
      return [];
    });
}
