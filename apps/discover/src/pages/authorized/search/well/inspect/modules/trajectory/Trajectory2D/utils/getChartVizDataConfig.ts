import template from 'lodash/template';

import { ProjectConfigWellsTrajectoryChartVizData } from '@cognite/discover-api-types';

import { UserPreferredUnit } from 'constants/units';

export const getChartVizDataConfig = (
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
