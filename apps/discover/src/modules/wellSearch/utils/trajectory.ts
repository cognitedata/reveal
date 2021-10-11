import get from 'lodash/get';
import head from 'lodash/head';

import { Sequence } from '@cognite/sdk';

import {
  SequenceRow,
  TrajectoryColumnR,
  TrajectoryRow,
  TrajectoryRows,
  Well,
} from '../types';

export const getExistColumns = (
  sequence: Sequence,
  columns: TrajectoryColumnR[]
) => {
  const trajColNames = sequence.columns.map((col) => col.name);
  return columns.filter((col) => trajColNames.includes(col.name));
};

export function mapDataToTrajectoryRowType(
  trajectory: Sequence,
  trajRowDataList: SequenceRow[],
  trajColmns: TrajectoryColumnR[] = []
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
