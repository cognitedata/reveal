import { Well } from 'domain/wells/well/internal/types';

import convert from 'convert-units';
import get from 'lodash/get';
import head from 'lodash/head';
import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import { UNITS_TO_STANDARD } from 'utils/units/constants';

import { ProjectConfigWellsTrajectoryColumns } from '@cognite/discover-api-types';
import { SequenceColumn } from '@cognite/sdk';
import { TrajectoryData as TrajectoryDataV3 } from '@cognite/sdk-wells-v3';

import { FEET, UserPreferredUnit } from 'constants/units';

import { TRAJECTORY_COLUMN_NAME_MAP } from '../service/sequence/constants';
import { Sequence, TrajectoryRow, TrajectoryRows } from '../types';

export const mapWellInfo = (
  trajectories: Sequence[],
  wells: Well[]
): Sequence[] => {
  return trajectories.map((trajectory) => {
    const well = wells.find(
      (well) =>
        well.wellbores &&
        trajectory.assetId &&
        well.wellbores
          .map((wellbore) => wellbore.id)
          .includes(trajectory.assetId)
    );
    const wellbore = well?.wellbores?.find(
      (wellbore) => wellbore.id === trajectory.assetId
    );
    return {
      ...trajectory,
      metadata: {
        ...get(trajectory, 'metadata', {}),
        wellName: get(well, 'name', ''),
        wellboreName: get(wellbore, 'description', ''),
      },
    };
  });
};

export const findIndexByName = (
  name: string,
  selectedTrajectoryData: (TrajectoryRows | undefined)[],
  normalizeColumns?: Record<string, string>
) => {
  const normalizedTrajectoryColumnName = normalizeColumns || {};

  return head(selectedTrajectoryData)?.columns?.findIndex(
    (col) => col.name === normalizedTrajectoryColumnName[name]
  );
};

export const getDataPointInPreferredUnit = (
  row: TrajectoryRow,
  accessor: string,
  selectedTrajectoryData: (TrajectoryRows | undefined)[],
  preferredUnit?: UserPreferredUnit,
  columnData?: SequenceColumn[],
  normalizeColumns?: Record<string, string>
): number => {
  const dataPointIndex = findIndexByName(
    accessor,
    selectedTrajectoryData,
    normalizeColumns
  );
  const dataPoint = get(
    row.values,
    !isUndefined(dataPointIndex) ? dataPointIndex : -1
  );
  const columnMetaData = columnData?.find(
    (column) => column.name === accessor
  )?.metadata;
  /**
   * If configured accessor is wrong then we might end up falling back to wrong unit.
   */
  if (isUndefined(columnMetaData)) {
    throw new Error(
      'Configured column cannot be found. Please check the chart configuration against data'
    );
  }
  return convert(dataPoint)
    .from(get(UNITS_TO_STANDARD, columnMetaData.unit, FEET))
    .to(preferredUnit || FEET);
};

export const mapMetadataUnit = (
  column: ProjectConfigWellsTrajectoryColumns,
  trajectoryData: TrajectoryDataV3
): string => {
  const colName = column.name as keyof typeof TRAJECTORY_COLUMN_NAME_MAP;
  const trajectoryColumnNameValue = TRAJECTORY_COLUMN_NAME_MAP[colName];

  if (
    isEqual(trajectoryColumnNameValue, TRAJECTORY_COLUMN_NAME_MAP.x_offset) ||
    isEqual(trajectoryColumnNameValue, TRAJECTORY_COLUMN_NAME_MAP.y_offset)
  ) {
    return trajectoryData.offsetUnit;
  }

  const trajectoryUnitType = String(
    `${trajectoryColumnNameValue}Unit`
  ) as keyof TrajectoryDataV3;

  return String(trajectoryData[trajectoryUnitType]);
};
