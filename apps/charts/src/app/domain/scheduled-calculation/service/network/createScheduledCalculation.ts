import { CogniteClient } from '@cognite/sdk';

import {
  CalculationTaskSchedule,
  CalculationTaskScheduledCreate,
} from '../types';

export const createScheduledCalculation = (
  payload: { items: CalculationTaskScheduledCreate[] },
  sdk: CogniteClient
) =>
  sdk.post<{ items: CalculationTaskSchedule[] }>(
    `api/v1/projects/${sdk.project}/calculations/schedules`,
    {
      data: payload,
      headers: {
        'cdf-version': 'alpha',
      },
    }
  );
