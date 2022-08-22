import { useTrajectoryChartsConfig } from 'domain/wells/trajectory/internal/hooks/useTrajectoryChartsConfig';
import { getTrajectoryChartVizDataConfig } from 'domain/wells/trajectory/internal/utils/getTrajectoryChartVizDataConfig';

import React, { useMemo } from 'react';

import { useDeepCallback } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { Chart } from '../../common/Chart';
import { ChartProps, Data } from '../../common/Chart/types';

import { TrajectoryChildGrid } from './elements';

export interface TrajectoryChartProps {
  data: Data;
  index: number;
}

export const TrajectoryChart: React.FC<
  TrajectoryChartProps & Partial<ChartProps>
> = ({ data, index, ...chartProps }) => {
  const chartConfigs = useTrajectoryChartsConfig();
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  const chartConfig = useMemo(() => chartConfigs[index], [chartConfigs, index]);

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
        {...getTrajectoryChartVizDataConfig(
          chartConfigs[index].chartVizData,
          userPreferredUnit
        )}
        axisAutorange={{
          x: chartConfig.reverseXAxis ? 'reversed' : undefined,
          y: chartConfig.reverseYAxis ? 'reversed' : undefined,
          z: chartConfig.reverseZAxis ? 'reversed' : undefined,
        }}
        margin={isLegend(index) ? { r: 250 } : undefined}
        {...chartProps}
      />
    </TrajectoryChildGrid>
  );
};
