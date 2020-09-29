import { useQuery, QueryConfig } from 'react-query';
import {
  CogFunction,
  GetCallsArgs,
  Call,
  GetCallArgs,
  CallResponse,
  Log,
  Schedule,
} from 'types';
import sdk from 'sdk-singleton';
import {
  allFunctionsKey,
  callsKey,
  callKey,
  responseKey,
  logsKey,
  functionKey,
  sortFunctionKey,
  allSchedulesKey,
} from './queryKeys';
import { getCalls, getCall, getResponse, getLogs, getLatestCalls } from './api';

export const useFunctions = (config?: QueryConfig<CogFunction[], unknown>) =>
  useQuery<CogFunction[]>(
    [allFunctionsKey],
    () =>
      sdk
        .get(`/api/playground/projects/${sdk.project}/functions`)
        .then(r => r.data?.items),
    config
  );
export const useFunction = (
  id: number,
  config?: QueryConfig<CogFunction, unknown>
) =>
  useQuery<CogFunction>(
    [functionKey, id],
    () =>
      sdk
        .get(`/api/playground/projects/${sdk.project}/functions/${id}`)
        .then(r => r.data),
    config
  );
export const useSchedules = (config?: QueryConfig<Schedule[], unknown>) =>
  useQuery<Schedule[]>(
    [allSchedulesKey],
    () =>
      sdk
        .get(`/api/playground/projects/${sdk.project}/functions/schedules`)
        .then(r => r.data?.items),
    config
  );

export const useCalls = (
  args: GetCallsArgs,
  config?: QueryConfig<Call[], unknown>
) => useQuery<Call[]>(callsKey(args), getCalls, config);

export const useMultipleCalls = (
  args: GetCallsArgs[],
  config?: QueryConfig<{ [id: number]: Call | undefined }, unknown>
) =>
  useQuery<{ [id: number]: Call | undefined }>(
    [sortFunctionKey, args],
    getLatestCalls,
    config
  );

export const useCall = (
  args: GetCallArgs,
  config?: QueryConfig<Call, unknown>
) => useQuery<Call>(callKey(args), getCall, config);

export const useResponse = (
  args: GetCallArgs,
  config?: QueryConfig<CallResponse, unknown>
) => useQuery<CallResponse>(responseKey(args), getResponse, config);

export const useLogs = (
  args: GetCallArgs,
  config?: QueryConfig<Log[], unknown>
) => useQuery<Log[]>(logsKey(args), getLogs, config);

type AssetType = 'files';
type Method = 'retrieve' | 'filter';
export const useSDK = <T>(assetType: AssetType, method: Method, data: any) =>
  useQuery<T>(['sdk', assetType, data], () =>
    // @ts-ignore
    sdk[assetType][method](data)
  );
