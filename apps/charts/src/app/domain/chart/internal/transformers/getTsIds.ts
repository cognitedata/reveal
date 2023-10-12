import { Chart } from '@cognite/charts-lib';

import { ScheduledCalculationsDataMap } from '../../../../models/scheduled-calculation-results/types';
import { EMPTY_ARRAY } from '../../../constants';

export const getTsIdsFromTsCollection = (chart: Chart | undefined) =>
  chart?.timeSeriesCollection?.map((timeseries) => timeseries.tsId) ||
  EMPTY_ARRAY;

export const getTsExternalIdsFromScheduledCalculations = (
  scheduledCalculationsData: ScheduledCalculationsDataMap
) =>
  Object.values(scheduledCalculationsData).map(
    (scheduledCalculation) => scheduledCalculation.targetTimeseriesExternalId
  );
