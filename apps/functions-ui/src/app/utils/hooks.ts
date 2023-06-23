import {
  CogFunction,
  GetCallsArgs,
  Call,
  GetCallArgs,
  CallResponse,
  Log,
  Schedule,
  CogFunctionLimit,
} from '@functions-ui/types';
import {
  getCalls,
  getCall,
  getResponse,
  getLogs,
  getLatestCalls,
  getScheduleData,
} from '@functions-ui/utils/api';
import {
  allFunctionsKey,
  allSchedulesKey,
  callKey,
  callsKey,
  functionKey,
  logsKey,
  responseKey,
  limitsKey,
  sortFunctionKey,
} from '@functions-ui/utils/queryKeys';
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  MutationOptions,
} from '@tanstack/react-query';
import camelCase from 'lodash/camelCase';
import mapKeys from 'lodash/mapKeys';

import sdk, { getUserInformation } from '@cognite/cdf-sdk-singleton';
import { getProject } from '@cognite/cdf-utilities';

export const useFunctions = (
  config?: UseQueryOptions<CogFunction[], unknown>
) => {
  const client = useQueryClient();

  return useQuery<CogFunction[]>(
    [allFunctionsKey],
    () =>
      sdk
        .get(`/api/v1/projects/${getProject()}/functions`)
        .then((r) => r.data?.items),
    {
      onSuccess: (functions) => {
        functions.forEach((fn) => {
          client.setQueryData(functionKey({ id: fn.id }), fn);
        });
      },
      ...config,
    }
  );
};
export const useFunction = (
  id: number,
  config?: UseQueryOptions<CogFunction, unknown>
) =>
  useQuery<CogFunction>(
    functionKey({ id }),
    () =>
      sdk
        .get(`/api/v1/projects/${getProject()}/functions/${id}`)
        .then((r) => r.data),
    config
  );
export const useSchedules = (config?: UseQueryOptions<Schedule[], unknown>) =>
  useQuery<Schedule[]>(
    [allSchedulesKey],
    () =>
      sdk
        .get(`/api/v1/projects/${getProject()}/functions/schedules`, {
          params: { limit: 1000 },
        })
        .then((r) => r.data?.items),
    config
  );

type ObjectType = Record<string, any>;
export const useRetriveScheduleInputData = (
  scheduleId: number,
  config?: UseQueryOptions<ObjectType, unknown>
) => {
  return useQuery<ObjectType>(
    [allSchedulesKey, scheduleId],
    () => getScheduleData(scheduleId),
    config
  );
};
export const useLimits = (
  config?: UseQueryOptions<CogFunctionLimit, unknown>
) =>
  useQuery<CogFunctionLimit>(
    [limitsKey],
    () =>
      sdk
        .get(`/api/v1/projects/${getProject()}/functions/limits`, {
          params: { vendor: true },
        })
        .then(
          (r) => mapKeys(r.data, (_, key) => camelCase(key)) as CogFunctionLimit
        ),
    config
  );
export const useCalls = (
  args: GetCallsArgs,
  config?: UseQueryOptions<Call[], unknown>
) =>
  useQuery<Call[]>(
    callsKey(args),
    () => getCalls(callsKey(args), args),
    config
  );

export const useMultipleCalls = (
  args: GetCallsArgs[],
  config?: UseQueryOptions<{ [id: number]: Call | undefined }, unknown>
) =>
  useQuery<{ [id: number]: Call | undefined }>(
    [sortFunctionKey, args],
    () => getLatestCalls([sortFunctionKey, args], args),
    config
  );

export const useCall = (
  args: GetCallArgs,
  config?: UseQueryOptions<Call, unknown>
) => useQuery<Call>(callKey(args), () => getCall(callKey(args), args), config);

export const useResponse = (
  args: GetCallArgs,
  config?: UseQueryOptions<CallResponse, unknown>
) =>
  useQuery<CallResponse>(
    responseKey(args),
    () => getResponse(responseKey(args), args),
    config
  );

export const useLogs = (
  args: GetCallArgs,
  config?: UseQueryOptions<Log[], unknown>
) => useQuery<Log[]>(logsKey(args), () => getLogs(logsKey(args), args), config);

type AssetType = 'files';
type Method = 'retrieve' | 'filter';
export const useSDK = <T>(assetType: AssetType, method: Method, data: any) =>
  useQuery<T>(['sdk', assetType, data], () =>
    // @ts-ignore
    sdk[assetType][method](data)
  );

export const useRefreshApp = () => {
  const client = useQueryClient();
  return () => {
    client.invalidateQueries();
  };
};

export const useUserInformation = () => {
  return useQuery(['user-info'], getUserInformation);
};

type ActivationResponse = {
  status: 'activated' | 'inactive' | 'requested';
};
type ActivationError = {
  message: string;
};

export const useCheckActivateFunction = (
  config?: UseQueryOptions<ActivationResponse, ActivationError>
) => {
  const project = getProject();
  return useQuery<ActivationResponse, ActivationError>(
    ['activation', project],
    () =>
      sdk
        .get(`api/v1/projects/${project}/functions/status`)
        .then((res) => res.data),
    config
  );
};

export const useActivateFunction = (
  config?: MutationOptions<ActivationResponse, ActivationError>
) => {
  const client = useQueryClient();
  const project = getProject();
  return useMutation<ActivationResponse, ActivationError>(
    () =>
      sdk
        .post(`/api/v1/projects/${project}/functions/status`)
        .then((res) => res.data),
    {
      ...config,
      onSuccess: (data) => {
        client.setQueryData(['activation', project], data);
      },
    }
  );
};
