import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import { Datum } from 'plotly.js';

import { ProjectConfigWellsTrajectoryCharts } from '@cognite/discover-api-types';

import { UserPreferredUnit } from 'constants/units';
import { DataError } from 'modules/inspectTabs/types';
import { Sequence, TrajectoryRows } from 'modules/wellSearch/types';

import {
  ThreeDCoordinate,
  ChartData,
  ChartListData,
  CoordinatesAndErrors,
  DimensionType,
} from '../types';

import { getArrayCoordinatesForChartType } from './addChartData';
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
 */
export const extractNthCoordinates = (
  coordintes: Array<Array<ThreeDCoordinate<Datum>>>,
  configIndex: number
) => {
  return coordintes.reduce((result, coordinateArrays) => {
    const nthConfigCoordinates = coordinateArrays[
      configIndex
    ] as ThreeDCoordinate<Datum>;
    const { x, y, z } = nthConfigCoordinates;

    /**
     * If there is a issue with a coordiante ( hence no data )
     * Skip the whole tuple.
     */
    if (
      isUndefined(x.data) ||
      isUndefined(y.data) ||
      // Only for the last chart ( 3d chart ) we worry about the z index
      (z && z.dimentionType === DimensionType.THREED && isUndefined(z.data))
    ) {
      return {
        data: {
          ...result.data,
        },
        errors: [x.error, y.error, z?.error].filter(
          (error): error is DataError => !!error
        ),
      };
    }

    if (isEmpty(result)) {
      const xCoordinate = !isUndefined(x.data) ? [x.data] : [];
      const yCoordinate = !isUndefined(y.data) ? [y.data] : [];
      // Only for the last chart ( 3d chart ) we worry about the z index
      const zCoordinate =
        !isUndefined(z) && !isUndefined(z.data) ? [z.data] : [];
      return {
        data: {
          x: xCoordinate,
          y: yCoordinate,
          z: zCoordinate,
        },
        errors: [],
      };
    }

    const previousxCoordintes = result.data.x || [];
    const previousyCoordintes = result.data.y || [];
    const previouszCoordintes = result.data.z || [];

    const updatedxCoordinates = !isUndefined(x.data)
      ? [...previousxCoordintes, x.data]
      : [...previousxCoordintes];
    const updatedyCoordinates = !isUndefined(y.data)
      ? [...previousyCoordintes, y.data]
      : [...previousyCoordintes];
    // Only for the last chart ( 3d chart ) we worry about the z index
    const updatedzCoordinates =
      !isUndefined(z) && !isUndefined(z.data)
        ? [...previouszCoordintes, z.data]
        : [...previouszCoordintes];

    return {
      data: {
        x: updatedxCoordinates,
        y: updatedyCoordinates,
        z: updatedzCoordinates,
      },
      errors: [...result.errors],
    };
  }, {} as CoordinatesAndErrors);
};

export const generateChartData = (
  selectedTrajectoryData: (TrajectoryRows | undefined)[],
  selectedTrajectories: Sequence[],
  chartConfigs: ProjectConfigWellsTrajectoryCharts[],
  userPreferredUnit: UserPreferredUnit,
  normalizeColumns?: Record<string, string>
) => {
  return selectedTrajectoryData.reduce((chartDataList, trajectory) => {
    if (!trajectory) return chartDataList;

    /**
     * Reduce to a array, each row for a trajectory row graph coordinates ( 6 graphs )
     * eg:
     * [
     *    [
     *      {x, y, z}, #1 chart
     *      {x, y, z},
     *      ...
     *      {x, y, z}, #6 chart
     *    ],
     *    [
     *      {x, y, z}, #1 chart
     *      {x, y, z},
     *      ...
     *      {x, y, z}, #6 chart
     *    ],
     *    .
     *    .
     *    .
     *    [ #n the rocord, n = number of rows
     *      {x, y, z}, #1 chart
     *      {x, y, z},
     *      ...
     *      {x, y, z}, #6 chart
     *    ],
     * ]
     */
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
          const chartType = chartConfigs[index].type;
          const coordinates = getArrayCoordinatesForChartType({
            chartType,
            row,
            chartData: chartConfigs[index].chartData,
            columnData,
            selectedTrajectoryData,
            userPreferredUnit,
            normalizeColumns,
          });
          return [...previousResult, coordinates];
        },
        [] as Array<ThreeDCoordinate<Datum>>
      );

      return [...result, coordinates];
    }, [] as Array<Array<ThreeDCoordinate<Datum>>>);

    const chartObjects = chartConfigs.reduce((result, chartConfig, index) => {
      const getObject = getChartObjectGenerateFn(chartConfig.type);

      const plotlyData = getObject(
        selectedTrajectories,
        trajectory,
        chartConfig.chartExtraData
      );

      /**
       * List of coordinates of the plot
       * We are pulling out coordiantes for a given graph from all trajectories
       * Given index of each array contain coordinates for a given graph
       */
      const coordinatesAndErrors = extractNthCoordinates(
        trajectoryCoordinates,
        index
      );

      const { data: coordinates, errors } = coordinatesAndErrors;
      const { x, y, z } = coordinates;

      return {
        data: [
          ...(result.data || []),
          {
            ...plotlyData,
            x,
            y,
            z,
          },
        ],
        errors: [...(result.errors || []), ...errors],
      };
    }, {} as ChartData);

    const { wellboreId } = trajectory;

    if (isEmpty(chartDataList)) {
      return {
        data: (chartObjects.data || []).map((element) => [element]),
        errors: {
          [wellboreId]: [...chartObjects.errors],
        },
      };
    }

    const existingErrors = chartDataList.errors;

    return {
      data: (chartDataList.data || []).map((elem, i) => {
        return [...elem, chartObjects.data[i]];
      }),
      /**
       * Merge errors by wellboreId
       */
      errors: {
        ...existingErrors,
        [wellboreId]: existingErrors[wellboreId]
          ? [...existingErrors[wellboreId], ...chartObjects.errors]
          : [...chartObjects.errors],
      },
    };
  }, {} as ChartListData);
};
