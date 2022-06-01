import {
  ProjectConfigWells,
  ProjectConfigWellsTrajectoryCharts,
} from '@cognite/discover-api-types';

import { UserPreferredUnit } from 'constants/units';
import { Sequence, TrajectoryRows } from 'modules/wellSearch/types';

import { getAddDataFn } from './addChartData';
import { getChartObjectGenerateFn } from './getChartObject';

export const generateChartData = (
  selectedTrajectoryData: (TrajectoryRows | undefined)[],
  selectedTrajectories: Sequence[],
  chartConfigs: ProjectConfigWellsTrajectoryCharts[],
  userPreferredUnit: UserPreferredUnit,
  config?: ProjectConfigWells
) => {
  const charts: any[] = Array(chartConfigs.length)
    .fill(0)
    .map((_elm) => []);

  selectedTrajectoryData.forEach((trajectory) => {
    const tempChartObjects: any[] = [];

    // data Object for the chart (object relavant to 1 line), including x,y,(z) data arrays.
    chartConfigs.forEach((chartConfig) => {
      const getObject = getChartObjectGenerateFn(chartConfig.type);

      const object = getObject(
        selectedTrajectories,
        trajectory,
        chartConfig.chartExtraData
      );
      tempChartObjects.push(object);
    });

    if (trajectory) {
      trajectory.rows.forEach((row) => {
        tempChartObjects.forEach((chartObj, index) => {
          const columnData = selectedTrajectories.find(
            (selectedTrajectory) => selectedTrajectory.id === trajectory.id
          )?.columns;

          const addData = getAddDataFn(chartConfigs[index].type);

          const [x, y, z] = addData({
            row,
            chartData: chartConfigs[index].chartData,
            columnData,
            selectedTrajectoryData,
            userPreferredUnit,
            config,
          });

          if (x !== undefined) {
            chartObj.x.push(x);
          }
          if (y !== undefined) {
            chartObj.y.push(y);
          }
          if (z !== undefined) {
            chartObj.z.push(z);
          }
        });
      });
    }

    tempChartObjects.forEach((obj, index) => {
      charts[index].push(obj);
    });
  });

  return charts;
};
