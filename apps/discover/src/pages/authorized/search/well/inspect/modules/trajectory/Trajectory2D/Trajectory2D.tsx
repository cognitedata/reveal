import React, { useCallback, useMemo } from 'react';

import template from 'lodash/template';

import { ProjectConfigWellsTrajectoryChartVizData } from '@cognite/discover-api-types/types/model/projectConfigWellsTrajectoryChartVizData';
import { Sequence } from '@cognite/sdk';

import { UserPreferredUnit } from 'constants/units';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { TrajectoryRows } from 'modules/wellSearch/types';

import { Chart } from '../../common/Chart';
import { TrajectoryChildGrid, TrajectoryGrid } from '../elements';

import { generateChartData } from './utils/generateChartData';

export interface Props {
  selectedTrajectoryData: (TrajectoryRows | undefined)[];
  selectedTrajectories: Sequence[];
}

const getChartVizDataConfig = (
  chartVizDataConfig: ProjectConfigWellsTrajectoryChartVizData | undefined,
  userPreferredUnit: UserPreferredUnit
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

export const Trajectory2D: React.FC<Props> = ({
  selectedTrajectoryData,
  selectedTrajectories,
}) => {
  const { data: config } = useWellConfig();
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  const chartConfigs = useMemo(
    () => config?.trajectory?.charts || [],
    [config?.trajectory?.charts]
  );

  const isLegend = useCallback(
    (index: number) => chartConfigs[index].type === 'legend',
    [chartConfigs]
  );

  const charts = useMemo(
    () =>
      generateChartData(
        selectedTrajectoryData,
        selectedTrajectories,
        chartConfigs,
        userPreferredUnit,
        config
      ),
    [
      selectedTrajectoryData,
      selectedTrajectories,
      chartConfigs,
      userPreferredUnit,
      config,
    ]
  );

  if (!config) {
    return null;
  }

  return (
    <>
      <TrajectoryGrid>
        {charts.map((chart, index) => (
          <TrajectoryChildGrid
            // eslint-disable-next-line react/no-array-index-key
            key={`chart_${index}`}
            className={isLegend(index) ? 'legend' : 'chart2d'}
          >
            <Chart
              isTrajectory
              data={chart}
              showLegend={isLegend(index)}
              {...getChartVizDataConfig(
                chartConfigs[index].chartVizData,
                userPreferredUnit
              )}
              autosize
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
