import { useChartAtom } from '@charts-app/models/chart/atom';
import { useScheduledCalculationDataValue } from '@charts-app/models/scheduled-calculation-results/atom';

import {
  getTsExternalIdsFromScheduledCalculations,
  getTsIdsFromTsCollection,
} from '../transformers/getTsIds';

export const useGetTsExternalIdsFromScheduledCalculations = () => {
  const scheduledCalculationsData = useScheduledCalculationDataValue();
  return getTsExternalIdsFromScheduledCalculations(scheduledCalculationsData);
};

export const useGetTsIdsFromTimeseriesCollection = () => {
  const [chart] = useChartAtom();
  return getTsIdsFromTsCollection(chart);
};
