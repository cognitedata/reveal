import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import max from 'lodash/max';
import noop from 'lodash/noop';
import uniqueId from 'lodash/uniqueId';
import { getWellSDKClient } from 'services/wellSearch/sdk/authenticate';

import { ProjectConfigWellsTrajectoryColumns } from '@cognite/discover-api-types';
import { Sequence, SequenceColumn } from '@cognite/sdk';
import {
  TrajectoryData as TrajectoryDataV3,
  TrajectoryDataRow,
} from '@cognite/sdk-wells-v3';

import { MetricLogger } from 'hooks/useTimeLog';
import {
  TRAJECTORY_COLUMNS,
  TRAJECTORY_COLUMN_NAME_MAP,
} from 'modules/wellSearch/service/sequence/constants';
import {
  TrajectoryData,
  TrajectoryRow,
  TrajectoryRows,
  WellboreId,
  WellboreSourceExternalIdMap,
} from 'modules/wellSearch/types';
import { mapMetadataUnit } from 'modules/wellSearch/utils/trajectory';

import { getTrajectories } from './getTrajectories';

export const CHUNK_LIMIT = 100;

export async function getTrajectoriesByWellboreIds(
  wellboreIds: WellboreId[],
  wellboreSourceExternalIdMap: WellboreSourceExternalIdMap,
  columns: ProjectConfigWellsTrajectoryColumns[] = [],
  metricLogger: MetricLogger = [noop, noop]
) {
  const [startNetworkTimer, stopNetworkTimer] = metricLogger;
  startNetworkTimer();

  const trajectoryData = await getTrajectoriesData(
    wellboreIds,
    wellboreSourceExternalIdMap,
    columns
  );

  stopNetworkTimer({
    noOfWellbores: wellboreIds.length,
  });

  return trajectoryData;
}

export const getTrajectoriesData = async (
  wellboreIds: WellboreId[],
  wellboreSourceExternalIdMap: WellboreSourceExternalIdMap,
  columns: ProjectConfigWellsTrajectoryColumns[] = []
) => {
  const availableColumnNames = Object.keys(TRAJECTORY_COLUMN_NAME_MAP);
  const existColumns = columns.filter((column) =>
    column.name ? availableColumnNames.includes(column.name) : false
  );

  const trajectories = await getTrajectories(wellboreIds);

  const trajectoryData = await Promise.all(
    trajectories.map((trajectory) =>
      getWellSDKClient()
        .trajectories.listData({
          sequenceExternalId: trajectory.source.sequenceExternalId,
        })
        .then((trajectoryData: TrajectoryDataV3) =>
          convertToCustomTrajectoryData(
            wellboreSourceExternalIdMap[trajectoryData.wellboreAssetExternalId],
            trajectoryData,
            existColumns
          )
        )
    )
  );

  return getGroupedTrajectoryData(trajectoryData, wellboreIds);
};

export const convertToCustomTrajectoryData = (
  wellboreId: WellboreId,
  trajectoryData: TrajectoryDataV3,
  columns: ProjectConfigWellsTrajectoryColumns[] = []
): TrajectoryData => {
  const trajectoryId = Number(uniqueId());
  const maxMeasuredDepth = max(
    trajectoryData.rows.map((row) => row.measuredDepth)
  );
  const maxTrueVerticalDepth = max(
    trajectoryData.rows.map((row) => row.trueVerticalDepth)
  );

  const sequenceColumns: SequenceColumn[] = columns.map((column) => {
    return {
      ...(column as SequenceColumn),
      metadata: { unit: mapMetadataUnit(column, trajectoryData) },
    };
  });

  const sequence = {
    id: trajectoryId,
    columns: sequenceColumns,
    assetId: wellboreId,
    name: trajectoryData.source.sourceName,
    externalId: trajectoryData.wellboreAssetExternalId,
    metadata: {
      parentExternalId: trajectoryData.wellboreAssetExternalId,
      source: trajectoryData.source.sourceName,
      type: trajectoryData.type,
      bh_md: String(maxMeasuredDepth),
      bh_md_unit: trajectoryData.measuredDepthUnit,
      bh_tvd: String(maxTrueVerticalDepth),
      bh_tvd_unit: trajectoryData.trueVerticalDepthUnit,
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
