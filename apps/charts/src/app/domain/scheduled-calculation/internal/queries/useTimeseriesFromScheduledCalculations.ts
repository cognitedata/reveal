import { ExternalId, Timeseries } from '@cognite/sdk';
import { useScheduledCalculationTasks } from '@charts-app/domain/scheduled-calculation/service/queries/useScheduledCalculationTasks';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';

export const useTimeseriesFromScheduledCalculations = (
  externalIds: ExternalId[]
) => {
  const { data: tasks } = useScheduledCalculationTasks(externalIds);
  return useCdfItems<Timeseries>(
    'timeseries',
    tasks?.map((task) => ({ externalId: task.targetTimeseriesExternalId })) ||
      [],
    false,
    { enabled: Boolean(tasks?.length) }
  );
};
