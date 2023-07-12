import { ScheduledCalculationTask } from '@charts-app/domain/scheduled-calculation/service/types';

import { CogniteClient, ExternalId } from '@cognite/sdk';

export const fetchScheduledCalculationTasks = (
  scheduledCalculationTaskIds: ExternalId[],
  sdk: CogniteClient
) => {
  return sdk.post<{ items: ScheduledCalculationTask[] }>(
    `api/v1/projects/${sdk.project}/calculations/schedules/byids`,
    {
      data: { items: scheduledCalculationTaskIds },
      headers: {
        'cdf-version': 'alpha',
      },
    }
  );
};
