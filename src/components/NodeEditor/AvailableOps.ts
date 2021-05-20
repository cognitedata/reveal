import { useState } from 'react';
import { useQuery } from 'react-query';
import { DSPFunction } from 'utils/transforms';
import { FunctionCallStatus } from 'reducers/charts/types';
import * as backendApi from 'utils/backendApi';
import { CogniteClient } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

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

interface Props {
  renderCall?: (functions: DSPFunction[]) => JSX.Element | null;
  renderLoading?: () => JSX.Element | null;
  renderError?: () => JSX.Element | null;
}

const getFunctionId = (sdk: CogniteClient, externalId: string) => async () => {
  const functions: Function[] = await backendApi.listFunctions(sdk);

  const { id } = functions.find((f) => f.externalId === externalId) || {};

  if (id) {
    return id;
  }

  return Promise.reject(new Error('Could not find calls'));
};

const getLatestCalls = (sdk: CogniteClient, fnId: number) => async () => {
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

  if (response?.status) {
    return response.status as FunctionCallStatus;
  }
  return Promise.reject(new Error('could not find call status'));
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

export default function AvailableOps({
  renderCall,
  renderLoading,
  renderError,
}: Props) {
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
  const { data: call, isFetched: callsFetched } = useQuery(
    [...key, 'get_calls'],
    getLatestCalls(sdk, fnId as number),
    { enabled: !!fnId, ...cacheOptions }
  );

  // Create a call if there isn't any existing
  const { data: newCallId, isError: createCallError } = useQuery(
    [...key, 'create_call'],
    callFunction(sdk, fnId as number),
    {
      enabled: callsFetched && !call && !!fnId,
      ...cacheOptions,
    }
  );

  const callId = call || newCallId;

  const [refetchInterval, setRefetchInterval] = useState<number | false>(1000);
  const { data: callStatus, isError: callStatusError } = useQuery<
    FunctionCallStatus
  >(
    [...key, callId, 'call_status'],
    getCallStatus(sdk, fnId as number, callId as number),
    {
      ...cacheOptions,
      enabled: !!callId,
      refetchInterval,
    }
  );

  if (callStatus && callStatus !== 'Running' && refetchInterval) {
    setRefetchInterval(false);
  }

  const { data: response, isFetched, isError: responseError } = useQuery(
    [...key, callId, 'response'],
    getOps(sdk, fnId as number, callId as number),
    {
      ...cacheOptions,
      enabled: callStatus === 'Completed',
    }
  );

  if (
    fnError ||
    callStatusError ||
    createCallError ||
    responseError ||
    callStatus === 'Failed'
  ) {
    return renderError ? renderError() : null;
  }

  if (!isFetched) {
    return renderLoading ? renderLoading() : null;
  }
  if (isFetched && response && renderCall) {
    return renderCall(response);
  }
  return null;
}
