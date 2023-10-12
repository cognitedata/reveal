import { selector } from 'recoil';

import { Chart } from '@cognite/charts-lib';

import { getUnitConvertedDatapointsSummary } from '../../utils/units';
import chartAtom from '../chart/atom';

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
