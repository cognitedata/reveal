import React from 'react';

import { useDeepCallback, useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';

import { Chart } from '../../common/Chart';
import { ChartProps, Data } from '../../common/Chart/types';
import { getChartVizDataConfig } from '../utils/getChartVizDataConfig';

import { TrajectoryChildGrid } from './elements';

export interface TrajectoryChartProps {
  data: Data;
  index: number;
}

export const TrajectoryChart: React.FC<
  TrajectoryChartProps & Partial<ChartProps>
> = ({ data, index, ...chartProps }) => {
  const { data: config } = useWellConfig();
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  const chartConfigs = useDeepMemo(
    () => config?.trajectory?.charts || [],
    [config?.trajectory?.charts]
  );

  const isLegend = useDeepCallback(
    (index: number) => chartConfigs[index].type === 'legend',
    [chartConfigs]
  );

  return (
    <TrajectoryChildGrid className={isLegend(index) ? 'legend' : 'chart2d'}>
      <Chart
        isTrajectory
        autosize
        data={data}
        showLegend={isLegend(index)}
        {...getChartVizDataConfig(
          chartConfigs[index].chartVizData,
          userPreferredUnit
        )}
        axisAutorange={{
          y: 'reversed',
          z: chartConfigs[index].type === '3d' ? 'reversed' : undefined,
        }}
        margin={isLegend(index) ? { r: 250 } : undefined}
        {...chartProps}
      />
    </TrajectoryChildGrid>
  );
};
