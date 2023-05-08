import { CogniteClient } from '@cognite/sdk';

export const createScheduledCalculation = (payload: any, sdk: CogniteClient) =>
  sdk.post(`api/v1/projects/${sdk.project}/calculations/schedules`, {
    data: payload,
    headers: {
      'cdf-version': 'alpha',
    },
  });
