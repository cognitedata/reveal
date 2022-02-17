import convert from 'convert-units';
import get from 'lodash/get';
import head from 'lodash/head';
import isEqual from 'lodash/isEqual';
import { UNITS_TO_STANDARD } from 'utils/units/constants';

import {
  ProjectConfigWells,
  ProjectConfigWellsTrajectoryColumns,
} from '@cognite/discover-api-types';
import { Sequence, SequenceColumn } from '@cognite/sdk';
import { TrajectoryData as TrajectoryDataV3 } from '@cognite/sdk-wells-v3';

import { FEET, UserPreferredUnit } from 'constants/units';

import { TRAJECTORY_COLUMN_NAME_MAP } from '../service/sequence/constants';
import { SequenceRow, TrajectoryRow, TrajectoryRows, Well } from '../types';

export const getExistColumns = (
  sequence: Sequence,
  columns: ProjectConfigWellsTrajectoryColumns[]
) => {
  const trajColNames = sequence.columns.map((col) => col.name);
  return columns.filter((col) => trajColNames.includes(col.name));
};

export function mapDataToTrajectoryRowType(
  trajectory: Sequence,
  trajRowDataList: SequenceRow[],
  trajColmns: ProjectConfigWellsTrajectoryColumns[] = []
): TrajectoryRows {
  return {
    id: trajectory.id,
    wellboreId: trajectory.assetId as number,
    externalId: trajectory.externalId || '',
    columns: trajColmns,
    rows: getValues(trajColmns.length, trajRowDataList) || [],
  };
}

// extract values array from SequenceRow object array.
const getValues = (rowSize: number, rows: SequenceRow[]): TrajectoryRow[] => {
  return rows.map((row) => {
    return {
      values: [...Array(rowSize)].map((_, i) => Number(get(row, i) || 0)),
      rowNumber: row.rowNumber,
    };
  });
};

export const mapWellInfo = (
  trajectories: Sequence[],
  wells: Well[]
): Sequence[] => {
  return trajectories.map((trajectory) => {
    const well = wells.find(
      (well) =>
        well.wellbores &&
        well.wellbores
          .map((wellbore) => wellbore.id)
          .includes(trajectory.assetId as number)
    );
    const wellbore = well?.wellbores?.find(
      (wellbore) => wellbore.id === (trajectory.assetId as number)
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
  config?: ProjectConfigWells
) => {
  const dataPoint = get(
    row.values,
    findIndexByName(
      accessor,
      selectedTrajectoryData,
      config?.trajectory?.normalizeColumns
    ) || -1
  );
  const columnMetaData = columnData?.find(
    (column) => column.name === accessor
  )?.metadata;
  return convert(dataPoint)
    .from(
      columnMetaData ? get(UNITS_TO_STANDARD, columnMetaData.unit, FEET) : FEET
    )
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
