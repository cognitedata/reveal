import { CogniteClient, ExternalId } from '@cognite/sdk';

import { ScheduledCalculationTask } from '../types';

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
