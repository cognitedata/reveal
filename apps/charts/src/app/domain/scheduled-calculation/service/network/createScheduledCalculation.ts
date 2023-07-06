import { CogniteClient } from '@cognite/sdk';

import {
  ScheduledCalculationTask,
  ScheduledCalculationTaskCreate,
} from '../types';

export const createScheduledCalculation = (
  payload: { items: ScheduledCalculationTaskCreate[] },
  sdk: CogniteClient
) =>
  sdk.post<{ items: ScheduledCalculationTask[] }>(
    `api/v1/projects/${sdk.project}/calculations/schedules`,
    {
      data: payload,
      headers: {
        'cdf-version': 'alpha',
      },
    }
  );
