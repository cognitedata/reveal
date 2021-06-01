import { useState } from 'react';
import { useQuery } from 'react-query';
import { DSPFunction } from 'utils/transforms';
import { FunctionCallStatus } from 'reducers/charts/types';
import * as backendApi from 'utils/backendApi';
import { CogniteClient } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { FunctionCall } from 'utils/backendService';

type Function = {
  id: number;
  externalId?: string;
  name: string;
};

export interface CallResponse {
  id: number;
  functionId: number;
  response: any;
  status: FunctionCallStatus;
}

const key = ['functions', 'get_all_ops'];

const getFunctionId = (sdk: CogniteClient, externalId: string) => async () => {
  const functions: Function[] = await backendApi.listFunctions(sdk);

  const { id } = functions.find((f) => f.externalId === externalId) || {};

  if (id) {
    return id;
  }

  return Promise.reject(new Error(`Could not find function ${externalId}`));
};

const getLatestCall = (sdk: CogniteClient, fnId: number) => async () => {
  const calls: { id: number; endTime: number }[] = await backendApi.getCalls(
    sdk,
    fnId
  );

  const { id } = calls.sort((a, b) => b.endTime - a.endTime)[0] || {};
  return id;
};

const callFunction = (
  sdk: CogniteClient,
  fnId: number,
  data: any = {}
) => async () => {
  const response = await backendApi.callFunction(sdk, fnId, data);
  if (response?.id) {
    return response?.id as number;
  }
  return Promise.reject(new Error('did not get call id'));
};

const getCallStatus = (
  sdk: CogniteClient,
  fnId: number,
  callId: number
) => async () => {
  const response = await backendApi.getCallStatus(sdk, fnId, callId);
  return response;
};

const getOps = (
  sdk: CogniteClient,
  fnId: number,
  callId: number
) => async () => {
  const response = await backendApi.getCallResponse(sdk, fnId, callId);

  if (response.all_available_ops) {
    return response.all_available_ops as DSPFunction[];
  }
  return Promise.reject(new Error('did not get DSPFunction list'));
};

export function useAvailableOps(): [boolean, Error?, DSPFunction[]?] {
  const sdk = useSDK();

  const cacheOptions = {
    cacheTime: Infinity,
    staleTime: 60000,
    retry: false,
  };

  const { data: fnId, isError: fnError } = useQuery(
    [...key, 'find_function'],
    getFunctionId(sdk, 'get_all_ops-master'),
    cacheOptions
  );

  // Functions are immutable so any old call will be fine
  const { data: call, isFetched: callFetched } = useQuery(
    [...key, 'get_calls'],
    getLatestCall(sdk, fnId as number),
    { enabled: !!fnId, ...cacheOptions }
  );

  // Create a call if there isn't any existing
  const { data: newCallId, isError: createCallError } = useQuery(
    [...key, 'create_call'],
    callFunction(sdk, fnId as number),
    {
      enabled: callFetched && !call && !!fnId,
      ...cacheOptions,
    }
  );

  const callId = call || newCallId;

  const [refetchInterval, setRefetchInterval] = useState<number | false>(1000);

  const { data: callStatus, isError: callStatusError } = useQuery<FunctionCall>(
    [...key, callId, 'call_status'],
    getCallStatus(sdk, fnId as number, callId as number),
    {
      ...cacheOptions,
      enabled: !!callId,
      refetchInterval,
    }
  );

  const hasValidResult =
    !!callStatus?.status &&
    callStatus.status === 'Completed' &&
    !callStatus.error;

  if (hasValidResult && refetchInterval) {
    setRefetchInterval(false);
  }

  const { data: response, isFetched, isError: responseError } = useQuery(
    [...key, callId, 'response'],
    getOps(sdk, fnId as number, callId as number),
    {
      ...cacheOptions,
      enabled: hasValidResult,
    }
  );

  if (
    fnError ||
    callStatusError ||
    createCallError ||
    responseError ||
    callStatus?.status === 'Failed' ||
    callStatus?.status === 'Timeout' ||
    callStatus?.error
  ) {
    return [false, new Error('Could not get available operations'), undefined];
  }

  if (!isFetched) {
    return [true, undefined, undefined];
  }
  if (isFetched && response) {
    return [false, undefined, response];
  }
  return [false, new Error('Something went wrong'), undefined];
}
