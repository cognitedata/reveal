import { useSDK } from '@cognite/sdk-provider';
import {
  retrieveItemsKey,
  SdkResourceType,
} from '@cognite/sdk-react-query-hooks';
import { CogniteClient, IdEither } from '@cognite/sdk';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';

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

export type FunctionCallStatus = 'Running' | 'Completed' | 'Failed' | 'Timeout';

export type FunctionCallRef = {
  callId: number;
  functionId: number;
  callDate: number;
  hash?: number;
};

type ErrorResponse = { message?: string };

export const useFunctionCall = (
  functionId: number,
  callId: number,
  queryOpts?: UseQueryOptions<FunctionCall>
) => {
  const sdk = useSDK();
  return useQuery<FunctionCall>(
    ['functions', functionId, 'call', callId],
    () =>
      sdk
        .get(
          `/api/playground/projects/${sdk.project}/functions/${functionId}/calls/${callId}`
        )
        .then((r) => r.data),
    { ...queryOpts, retry: 1, retryDelay: 1000 }
  );
};

export const functionResponseKey = (functionId: number, callId: number) => [
  'functions',
  functionId,
  'call',
  callId,
  'response',
];

export const useFunctionReponse = (
  functionId: number,
  callId: number,
  opts?: UseQueryOptions<string | null | undefined>
) => {
  const sdk = useSDK();
  return useQuery<string | null | undefined>(
    functionResponseKey(functionId, callId),
    () =>
      sdk
        .get(
          `/api/playground/projects/${sdk.project}/functions/${functionId}/calls/${callId}/response`
        )
        .then((r) => r.data.response),
    { ...opts, retry: 1, retryDelay: 1000 }
  );
};

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
    } as FunctionCallRef;
  });
};

export const post = (sdk: CogniteClient, path: string, data: any) =>
  sdk
    .post(`/api/v1/projects/${sdk.project}${path}`, { data })
    .then((response) => response.data);

export const useCdfItems = <T>(
  type: SdkResourceType,
  ids: IdEither[],
  ignoreUnknownIds = false,
  config?: UseQueryOptions<T[], ErrorResponse>
) => {
  const sdk = useSDK();
  const filteredIds = ids.filter((i: any) => !!i.id || !!i.externalId);

  return useQuery<T[], ErrorResponse>(
    retrieveItemsKey(type, filteredIds),
    () => {
      if (filteredIds.length > 0) {
        return post(sdk, `/${type}/byids`, {
          items: filteredIds,
          ignoreUnknownIds,
        }).then((d) => d?.items);
      }
      return [];
    },
    config
  );
};
