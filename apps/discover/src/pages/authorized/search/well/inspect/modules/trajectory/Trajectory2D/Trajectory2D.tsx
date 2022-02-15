import React, { useEffect, useMemo } from 'react';

import template from 'lodash/template';

import { ProjectConfigWellsTrajectoryChartVizData } from '@cognite/discover-api-types/types/model/projectConfigWellsTrajectoryChartVizData';
import { Sequence, SequenceColumn } from '@cognite/sdk';

import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import {
  TrajectoryRow,
  TrajectoryRows,
  Wellbore,
} from 'modules/wellSearch/types';
import { getDataPointInPreferredUnit } from 'modules/wellSearch/utils/trajectory';
import { ChartDataConfig } from 'tenants/types';

import { Chart } from '../../common/Chart';
import { TrajectoryChildGrid, TrajectoryGrid } from '../elements';
import { getWellboreNameForTrajectory } from '../utils';

export interface Props {
  selectedTrajectoryData: (TrajectoryRows | undefined)[];
  selectedTrajectories: Sequence[];
  selectedWellbores: Wellbore[];
}
export const Trajectory2D: React.FC<Props> = ({
  selectedTrajectoryData,
  selectedTrajectories,
  selectedWellbores,
}) => {
  const { data: config } = useWellConfig();
  const userPreferredUnit = useUserPreferencesMeasurement();

  const getWellboreNameForTraj = (trajId = '') =>
    getWellboreNameForTrajectory(trajId, selectedTrajectories);

  const chartConfigs = config?.trajectory?.charts || [];

  // empty ChartsArray
  const charts: any[] = useMemo(
    () =>
      Array(chartConfigs.length)
        .fill(0)
        .map((_elm) => []),
    [chartConfigs, selectedWellbores]
  );

  const generateChartData = () => {
    selectedTrajectoryData.forEach((traj) => {
      const chartObjs: any[] = [];
      // data Object for the chart (object relavant to 1 line), including x,y,(z) data arrays.
      chartConfigs.forEach((chartConfig: any) => {
        const obj = getChartObjectGeneratefn(chartConfig.type)(
          traj,
          chartConfig.chartExtraData
        );
        chartObjs.push(obj);
      });

      if (traj) {
        traj.rows.forEach((row) => {
          chartObjs.forEach((chartObj, index) => {
            const columnData = selectedTrajectories.find(
              (trajectory) => trajectory.id === traj.id
            )?.columns;
            getAddDataFn(chartConfigs[index].type)(
              chartObj,
              row,
              chartConfigs[index].chartData,
              columnData
            );
          });
        });
      }

      chartObjs.forEach((obj, index) => {
        charts[index].push(obj);
      });
    });
  };

  // genrate chart data array
  useEffect(() => {
    generateChartData();
  }, [selectedTrajectoryData, chartConfigs]);

  useEffect(() => {
    /**
     * On unit change need to reset chart arrays
     */
    charts.forEach((_, index) => {
      charts[index] = [];
    });
    generateChartData();
  }, [userPreferredUnit]);

  const getLineObject = (
    traj: TrajectoryRows | undefined,
    chartExtraData: { [key: string]: any }
  ) => {
    return {
      x: [] as number[],
      y: [] as number[],
      type: 'scatter',
      mode: 'lines',
      name: getWellboreNameForTraj(traj?.externalId),
      ...chartExtraData,
    };
  };

  const get3DObject = (
    traj: TrajectoryRows | undefined,
    chartExtraData: any
  ) => {
    return {
      x: [] as number[],
      y: [] as number[],
      z: [] as number[],
      type: 'scatter3d',
      mode: 'lines',
      name: getWellboreNameForTraj(traj?.externalId),
      ...chartExtraData,
    };
  };

  const addLineData = (
    lineObj: any,
    row: TrajectoryRow,
    chartData: ChartDataConfig,
    columnData?: SequenceColumn[]
  ) => {
    lineObj.x.push(
      getDataPointInPreferredUnit(
        row,
        chartData.x,
        selectedTrajectoryData,
        userPreferredUnit,
        columnData,
        config
      )
    );
    lineObj.y.push(
      getDataPointInPreferredUnit(
        row,
        chartData.y,
        selectedTrajectoryData,
        userPreferredUnit,
        columnData,
        config
      )
    );
  };

  const add3DLineData = (
    lineObj: any,
    row: TrajectoryRow,
    chartData: ChartDataConfig,
    columnData?: SequenceColumn[]
  ) => {
    lineObj.x.push(
      getDataPointInPreferredUnit(
        row,
        chartData.x,
        selectedTrajectoryData,
        userPreferredUnit,
        columnData,
        config
      )
    );
    lineObj.y.push(
      getDataPointInPreferredUnit(
        row,
        chartData.y,
        selectedTrajectoryData,
        userPreferredUnit,
        columnData,
        config
      )
    );
    lineObj.z.push(
      getDataPointInPreferredUnit(
        row,
        chartData.z || '',
        selectedTrajectoryData,
        userPreferredUnit,
        columnData,
        config
      )
    );
  };

  // return data adding functions for differnt chart types.
  const getAddDataFn = (type: string | undefined) => {
    switch (type) {
      case 'line':
        return addLineData;
      case '3d':
        return add3DLineData;
      default:
        return addLineData;
    }
  };

  // return initial chart object generate functions for differnt chart types.
  const getChartObjectGeneratefn = (type: string) => {
    switch (type) {
      case 'line':
        return getLineObject;
      case '3d':
        return get3DObject;
      default:
        return getLineObject;
    }
  };

  const isLegend = (index: number) => chartConfigs[index].type === 'legend';

  const getChartVizDataConfig = (
    chartVizDataConfig: ProjectConfigWellsTrajectoryChartVizData | undefined
  ): ProjectConfigWellsTrajectoryChartVizData => {
    return {
      ...chartVizDataConfig,
      axisNames: {
        x: template(chartVizDataConfig?.axisNames?.x)({
          unit: userPreferredUnit,
        }),
        y: template(chartVizDataConfig?.axisNames?.y)({
          unit: userPreferredUnit,
        }),
        z: template(chartVizDataConfig?.axisNames?.z)({
          unit: userPreferredUnit,
        }),
      },
    };
  };

  if (!config) {
    return null;
  }

  return (
    <>
      <TrajectoryGrid>
        {charts
          .map((chart, index) => ({ chart, id: `chart_${index}` }))
          .map((chartMap, index) => (
            <TrajectoryChildGrid
              key={chartMap.id}
              className={isLegend(index) ? 'legend' : 'chart2d'}
            >
              <Chart
                isTrajectory
                data={chartMap.chart}
                showLegend={isLegend(index)}
                {...getChartVizDataConfig(chartConfigs[index].chartVizData)}
                axisAutorange={{
                  y: 'reversed',
                  z: chartConfigs[index].type === '3d' ? 'reversed' : undefined,
                }}
                margin={isLegend(index) ? { r: 250 } : undefined}
              />
            </TrajectoryChildGrid>
          ))}
      </TrajectoryGrid>
    </>
  );
};
