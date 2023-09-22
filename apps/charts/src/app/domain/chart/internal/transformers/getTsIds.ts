import { EMPTY_ARRAY } from '@charts-app/domain/constants';
import { ScheduledCalculationsDataMap } from '@charts-app/models/scheduled-calculation-results/types';

import { Chart } from '@cognite/charts-lib';

export const getTsIdsFromTsCollection = (chart: Chart | undefined) =>
  chart?.timeSeriesCollection?.map((timeseries) => timeseries.tsId) ||
  EMPTY_ARRAY;

export const getTsExternalIdsFromScheduledCalculations = (
  scheduledCalculationsData: ScheduledCalculationsDataMap
) =>
  Object.values(scheduledCalculationsData).map(
    (scheduledCalculation) => scheduledCalculation.targetTimeseriesExternalId
  );
