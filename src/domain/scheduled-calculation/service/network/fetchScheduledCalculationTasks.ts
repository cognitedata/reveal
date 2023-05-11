import { CogniteClient, ExternalId } from '@cognite/sdk';
import { CalculationTaskSchedule } from 'domain/scheduled-calculation/service/types';

export const fetchScheduledCalculationTasks = (
  scheduledCalculationTaskIds: ExternalId[],
  sdk: CogniteClient
) => {
  return sdk.post<{ items: CalculationTaskSchedule[] }>(
    `api/v1/projects/${sdk.project}/calculations/schedules/byids`,
    {
      data: { items: scheduledCalculationTaskIds },
      headers: {
        'cdf-version': 'alpha',
      },
    }
  );
};
