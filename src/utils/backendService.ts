import zipWith from 'lodash/zipWith';
import { CogniteClient, DoubleDatapoint } from '@cognite/sdk';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import { Call, FunctionCallStatus } from 'reducers/charts/types';
import { useSDK } from '@cognite/sdk-provider';
import {
  getCallStatus,
  getCallResponse,
  callFunction,
  listFunctions,
} from './backendApi';

export type CogniteFunction = {
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

export const useFunctionCall = (
  functionId: number,
  callId: number,
  queryOpts?: UseQueryOptions<FunctionCall>
) => {
  const sdk = useSDK();
  return useQuery<FunctionCall>(
    ['functions', functionId, 'call', callId],
    () => getCallStatus(sdk, functionId, callId),
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
    () => getCallResponse(sdk, functionId, callId),
    { ...opts, retry: 1, retryDelay: 1000 }
  );
};

export const useCallFunction = (externalId: string) => {
  const cache = useQueryClient();
  const sdk = useSDK();
  return useMutation(async ({ data }: { data: any }) => {
    const functions = await cache.fetchQuery<CogniteFunction[]>(
      ['functions'],
      () => listFunctions(sdk)
    );

    const fn = functions.find((f) => f.externalId === externalId);
    if (!fn) {
      return Promise.reject(
        new Error(`Could not find function '${externalId}'`)
      );
    }

    const call = await cache.fetchQuery<{ id: number }>(
      ['functions', 'calls', fn.id, data],
      () => callFunction(sdk, fn.id, data)
    );

    return {
      functionId: fn.id,
      callId: call.id,
    } as Call;
  });
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const transformSimpleCalcResult = (
  result: {
    value?: number[];
    timestamp?: number[];
  } = {}
) => {
  const { value, timestamp } = result || undefined;

  return value?.length && timestamp?.length
    ? zipWith(value, timestamp, (v, t) => ({
        value: v,
        timestamp: new Date(t),
      }))
    : ([] as DoubleDatapoint[]);
};

export async function getFunctionResponseWhenDone(
  sdk: CogniteClient,
  fnId: number,
  callId: number
) {
  let callStatus: FunctionCall = await getCallStatus(sdk, fnId, callId);

  while (!['Failed', 'Completed', 'Timeout'].includes(callStatus?.status)) {
    // eslint-disable-next-line no-await-in-loop
    await sleep(1000);
    // eslint-disable-next-line no-await-in-loop
    callStatus = await getCallStatus(sdk, fnId, callId);
  }

  const response = await getCallResponse(sdk, fnId, callId);
  return response;
}
