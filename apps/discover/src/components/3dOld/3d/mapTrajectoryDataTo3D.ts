import { ITrajectoryRows } from '@cognite/node-visualizer';

import { TrajectoryRows } from 'modules/wellSearch/types';

export const mapTrajectoryDataTo3D = (
  trajectoryData: TrajectoryRows[]
): ITrajectoryRows[] =>
  trajectoryData.map((data) => {
    return {
      ...data,
      id: String(data.id),
      columns: data.columns.map((column) => {
        return {
          ...column,
          // these should not be optional from project config!
          name: column.name || '',
          valueType: column.valueType || '',
        };
      }),
    };
  });
