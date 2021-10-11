/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo } from 'react';

import get from 'lodash/get';

import { Sequence } from '@cognite/sdk';

import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import {
  TrajectoryRow,
  TrajectoryRows,
  Wellbore,
} from 'modules/wellSearch/types';
import { findIndexByName } from 'modules/wellSearch/utils/trajectory';
import { FlexGrow } from 'styles/layout';
import { ChartDataConfig } from 'tenants/types';

import { WellboreSelectionWrapper } from '../../../elements';
import { Chart } from '../../common/Chart';
import WellboreSelectionDropdown from '../../common/WellboreSelectionDropdown';
import { TrajectoryChildGrid, TrajectoryGrid } from '../elements';
import { getWellboreNameForTrajectory } from '../utils';

export interface Props {
  selectedTrajectoryData: (TrajectoryRows | undefined)[];
  selectedTrajectories: Sequence[];
  selectedWellbores: Wellbore[];
  showWellWellboreDropdown?: boolean;
  wellbores?: Wellbore[];
  onSelectWellbore?: (selectedWellboreList: Wellbore[]) => void;
}
export const Trajectory2D: React.FC<Props> = ({
  selectedTrajectoryData,
  selectedTrajectories,
  selectedWellbores,
  showWellWellboreDropdown,
  wellbores,
  onSelectWellbore,
}) => {
  const { data: config } = useWellConfig();

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

  // genrate chart data array
  useEffect(() => {
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
            getAddDataFn(chartConfigs[index].type)(
              chartObj,
              row,
              chartConfigs[index].chartData
            );
          });
        });
      }

      chartObjs.forEach((obj, index) => {
        charts[index].push(obj);
      });
    });
  }, [selectedTrajectoryData, chartConfigs]);

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
    chartData: ChartDataConfig
  ) => {
    lineObj.x.push(
      get(
        row.values,
        findIndexByName(
          chartData.x,
          selectedTrajectoryData,
          config?.trajectory?.normalizeColumns
        ) || -1
      )
    );
    lineObj.y.push(
      get(
        row.values,
        findIndexByName(
          chartData.y,
          selectedTrajectoryData,
          config?.trajectory?.normalizeColumns
        ) || -1
      )
    );
  };

  const add3DLineData = (
    lineObj: any,
    row: TrajectoryRow,
    chartData: ChartDataConfig
  ) => {
    lineObj.x.push(
      get(
        row.values,
        findIndexByName(
          chartData.x,
          selectedTrajectoryData,
          config?.trajectory?.normalizeColumns
        ) || -1
      )
    );
    lineObj.y.push(
      get(
        row.values,
        findIndexByName(
          chartData.y,
          selectedTrajectoryData,
          config?.trajectory?.normalizeColumns
        ) || -1
      )
    );
    lineObj.z.push(
      get(
        row.values,
        findIndexByName(
          chartData.z || '',
          selectedTrajectoryData,
          config?.trajectory?.normalizeColumns
        ) || -1
      )
    );
  };

  // return data adding functions for differnt chart types.
  const getAddDataFn = (type: string) => {
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

  const handleOnSelectWellbore = (items: Wellbore[]) => {
    if (onSelectWellbore) onSelectWellbore(items);
  };

  const isLegend = (index: number) => chartConfigs[index].type === 'legend';

  if (!config) {
    return null;
  }
  return (
    <>
      {showWellWellboreDropdown && (
        <WellboreSelectionWrapper data-testid="wellbore-dropdown">
          <WellboreSelectionDropdown
            onSelectWellbore={handleOnSelectWellbore}
            allWellbores={wellbores || []}
            selectedWellbores={selectedWellbores}
          />
          <FlexGrow />
        </WellboreSelectionWrapper>
      )}

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
                {...chartConfigs[index].chartVizData}
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
