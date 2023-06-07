import { CogniteClient, ExternalId } from '@cognite/sdk';

export const deleteScheduledCalculation = (
  payload: { items: ExternalId[] },
  sdk: CogniteClient
) =>
  sdk.post<{}>(`api/v1/projects/${sdk.project}/calculations/schedules/delete`, {
    data: payload,
    headers: {
      'cdf-version': 'alpha',
    },
  });
