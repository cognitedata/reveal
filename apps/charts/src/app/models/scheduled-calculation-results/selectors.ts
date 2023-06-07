import chartAtom from '@charts-app/models/chart/atom';
import { Chart } from '@charts-app/models/chart/types';
import { getUnitConvertedDatapointsSummary } from '@charts-app/utils/units';
import { selector } from 'recoil';

import { scheduledCalculationDataAtom } from './atom';
import { ScheduledCalculationsDataMap } from './types';

export const scheduledCalculationSummaries = selector({
  key: 'scheduledCalculationSummaries',
  get: ({ get }) => {
    return getUnitConvertedCalculationSummaries(
      get(scheduledCalculationDataAtom),
      get(chartAtom)!
    );
  },
});

export const getUnitConvertedCalculationSummaries = (
  scheduledCalculationResults: ScheduledCalculationsDataMap,
  chart: Chart
) => {
  const convertedSummaries = Object.keys(scheduledCalculationResults).reduce(
    (output, scheduledCalculationId) => {
      const correspondingCalculationDescription =
        chart?.scheduledCalculationCollection?.find(
          (calculation) => calculation.id === scheduledCalculationId
        );
      const { unit, preferredUnit } = correspondingCalculationDescription || {};
      return {
        ...output,
        [scheduledCalculationId]: getUnitConvertedDatapointsSummary(
          scheduledCalculationResults[scheduledCalculationId].series
            ?.datapoints || [],
          unit,
          preferredUnit
        ),
      };
    },
    {} as {
      [key: string]: ReturnType<typeof getUnitConvertedDatapointsSummary>;
    }
  );
  return convertedSummaries;
};
