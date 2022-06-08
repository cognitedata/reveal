import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import { Datum, PlotData } from 'plotly.js';

import {
  ProjectConfigWells,
  ProjectConfigWellsTrajectoryCharts,
} from '@cognite/discover-api-types';

import { UserPreferredUnit } from 'constants/units';
import { Sequence, TrajectoryRows } from 'modules/wellSearch/types';

import { getAddDataFn } from './addChartData';
import { getChartObjectGenerateFn } from './getChartObject';

export const findSelectedTrajectoryColumnData = (
  trajectories: Sequence[],
  trajectoryId: number
) => {
  return trajectories.find((trajectory) => trajectory.id === trajectoryId)
    ?.columns;
};

/**
 * Restructre the coordintes so coordiates for each plot is grouped
 *
 * Function is returning Array<Array<Datum>> but somehow ts think it is
 * Array<Array<Datum | undefine>> so returned data had to be casted.
 */
export const extractNthCoordinates = (
  coordintes: Array<Array<Array<Datum | undefined>>>,
  configIndex: number
) => {
  return coordintes.reduce((result: Array<Array<Datum>>, coordinateArrays) => {
    const nthConfigCoordinates = coordinateArrays[configIndex];
    const x = nthConfigCoordinates[0];
    const y = nthConfigCoordinates[1];
    const z = nthConfigCoordinates[2];

    if (isEmpty(result)) {
      const xCoordinate = !isUndefined(x) ? [x] : [];
      const yCoordinate = !isUndefined(y) ? [y] : [];
      const zCoordinate = !isUndefined(z) ? [z] : [];
      return [xCoordinate, yCoordinate, zCoordinate];
    }

    const previousxCoordintes = result[0] || [];
    const previousyCoordintes = result[1] || [];
    const previouszCoordintes = result[2] || [];

    const updatedxCoordinates = !isUndefined(x)
      ? [...previousxCoordintes, x]
      : [...previousxCoordintes];
    const updatedyCoordinates = !isUndefined(y)
      ? [...previousyCoordintes, y]
      : [...previousyCoordintes];
    const updatedzCoordinates = !isUndefined(z)
      ? [...previouszCoordintes, z]
      : [...previouszCoordintes];

    return [updatedxCoordinates, updatedyCoordinates, updatedzCoordinates];
  }, [] as Array<Array<Datum>>);
};

export const generateChartData = (
  selectedTrajectoryData: (TrajectoryRows | undefined)[],
  selectedTrajectories: Sequence[],
  chartConfigs: ProjectConfigWellsTrajectoryCharts[],
  userPreferredUnit: UserPreferredUnit,
  config?: ProjectConfigWells
) => {
  return selectedTrajectoryData.reduce((chartDataList, trajectory) => {
    if (!trajectory) return chartDataList;

    const trajectoryCoordinates = trajectory.rows.reduce((result, row) => {
      /**
       * Loop though chart configs to get data generation function and execute it to get coordinate for current row
       */
      const coordinates = Array.from(Array(chartConfigs.length).keys()).reduce(
        (previousResult, index) => {
          const columnData = findSelectedTrajectoryColumnData(
            selectedTrajectories,
            trajectory.id
          );

          /**
           * Get generate data function for type ( line, 3d etc )
           */
          const addData = getAddDataFn(chartConfigs[index].type);

          const [x, y, z] = addData({
            row,
            chartData: chartConfigs[index].chartData,
            columnData,
            selectedTrajectoryData,
            userPreferredUnit,
            config,
          });

          /**
           * Reduce to a array, each row for a trajectory row graph coordinates ( 6 graphs )
           * eg:
           * [
           *    [
           *      [x1, y1, z1],
           *      [x2, y2, z2],
           *      [x3, y3, z3],
           *    ] => #1,
           *    [
           *      [x1, y1, z1],
           *      [x2, y2, z2],
           *      [x3, z3, z3],
           *    ] => #1,
           *    .
           *    .
           *    .
           *    [
           *      [x1, y1, z1],
           *      [x2, y2, z2],
           *      [x3, z3, z3],
           *    ] => #6,
           * ]
           */

          return [...previousResult, [x, y, z]];
        },
        [] as Array<Array<Datum | undefined>>
      );

      return [...result, coordinates];
    }, [] as Array<Array<Array<Datum | undefined>>>);

    const chartObjects = chartConfigs.reduce((result, chartConfig, index) => {
      const getObject = getChartObjectGenerateFn(chartConfig.type);

      const plotlyData = getObject(
        selectedTrajectories,
        trajectory,
        chartConfig.chartExtraData
      );

      /**
       * List of coordinates of the plot
       */
      const coordinates = extractNthCoordinates(trajectoryCoordinates, index);

      return [
        ...result,
        {
          ...plotlyData,
          x: coordinates[0] as Array<Datum>,
          y: coordinates[1] as Array<Datum>,
          z: coordinates[2] as Array<Datum>,
        },
      ];
    }, [] as Partial<PlotData>[]);

    if (isEmpty(chartDataList)) {
      return chartObjects.map((element) => [element]);
    }

    const res = chartDataList.map((elem, i) => {
      return [...elem, chartObjects[i]];
    });

    return res;
  }, [] as Array<Partial<PlotData>[]>);
};
