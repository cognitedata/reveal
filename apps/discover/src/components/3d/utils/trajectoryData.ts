import { TrajectoryDataInternal } from 'domain/wells/trajectory/internal/types';

import head from 'lodash/head';

import { ITrajectoryRows } from '@cognite/node-visualizer';

export const mapTrajectoryDataTo3D = (
  trajectoryData: TrajectoryDataInternal[]
): ITrajectoryRows[] =>
  trajectoryData.map(
    ({
      measuredDepthUnit,
      trueVerticalDepthUnit,
      wellboreMatchingId,
      source,
      rows: rowsOriginal,
    }) => {
      const columns = Object.keys(head(rowsOriginal) || {}).map((name) => ({
        name,
        valueType: 'DOUBLE',
      }));

      const rows = (rowsOriginal || []).map((row, index) => ({
        rowNumber: index + 1,
        values: Object.values(row),
      }));

      return {
        measuredDepthUnit,
        trueVerticalDepthUnit,
        id: wellboreMatchingId,
        externalId: source.sequenceExternalId,
        columns,
        rows,
      };
    }
  );
