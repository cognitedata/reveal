import { useSDK } from '@cognite/sdk-provider';
import { useMutation, useQueryClient } from 'react-query';
import { FunctionCallStatus } from 'reducers/charts/types';

type CogniteFunction = {
  id: number;
  externalId?: string;
  name: string;
  fileId: number;
  description?: string;
};

export interface FunctionCall {
  id: number;
  functionId: number;
  startTime?: number;
  endTime?: number;
  status: FunctionCallStatus;
}

export const useCallFunction = (externalId: string) => {
  const sdk = useSDK();
  const cache = useQueryClient();
  return useMutation(async ({ data }: { data: any }) => {
    const functions = await cache.fetchQuery<CogniteFunction[]>(
      ['functions'],
      () =>
        sdk
          .get(`/api/playground/projects/${sdk.project}/functions`)
          .then((r) => r.data?.items)
    );

    const fn = functions.find((f) => f.externalId === externalId);
    if (!fn) {
      return Promise.reject(
        new Error(`Could not find function '${externalId}'`)
      );
    }

    const call = await cache.fetchQuery<{ id: number }>(
      ['functions', 'calls', fn.id, data],
      () =>
        sdk
          .post(
            `/api/playground/projects/${sdk.project}/functions/${fn.id}/call`,
            { data: { data } }
          )
          .then((r) => r.data)
    );

    return {
      functionId: fn.id,
      callId: call.id,
    };
  });
};
