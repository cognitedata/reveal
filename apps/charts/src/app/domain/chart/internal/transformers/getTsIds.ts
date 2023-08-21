import { EMPTY_ARRAY } from '@charts-app/domain/constants';
import { Chart } from '@charts-app/models/chart/types';
import { ScheduledCalculationsDataMap } from '@charts-app/models/scheduled-calculation-results/types';

export const getTsIdsFromTsCollection = (chart: Chart | undefined) =>
  chart?.timeSeriesCollection?.map((timeseries) => timeseries.tsId) ||
  EMPTY_ARRAY;

export const getTsExternalIdsFromScheduledCalculations = (
  scheduledCalculationsData: ScheduledCalculationsDataMap
) =>
  Object.values(scheduledCalculationsData).map(
    (scheduledCalculation) => scheduledCalculation.targetTimeseriesExternalId
  );
