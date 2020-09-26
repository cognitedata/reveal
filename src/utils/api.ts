import sdk from 'sdk-singleton';
import { QueryKey } from 'react-query';
import { CreateSchedule } from 'types';

type _GetCallsArgs = { id: number; scheduleId?: number };
type GetCallsArgs = _GetCallsArgs | _GetCallsArgs;

const getCallsSdk = (args: _GetCallsArgs) => {
  const { id, scheduleId } = args;
  const filter = args ? { scheduleId } : {};
  return sdk
    .post(
      `/api/playground/projects/${sdk.project}/functions/${id}/calls/list`,
      {
        data: { filter },
      }
    )
    .then(response => response.data?.items);
};

export const getCalls = async (_: QueryKey, args: GetCallsArgs) => {
  if (Array.isArray(args)) {
    const results = await Promise.all(args.map(a => getCallsSdk(a)));
    return args.reduce(
      (accl, { id }, index) => ({
        ...accl,
        [id]: results[index],
      }),
      {}
    );
  }
  return getCallsSdk(args);
};

type GetCallArgs = {
  id: number;
  callId: number;
};
export const getCall = (_: QueryKey, args: GetCallArgs) => {
  const { id, callId } = args;
  return sdk
    .get(
      `/api/playground/projects/${sdk.project}/functions/${id}/calls/${callId}`
    )
    .then(response => response.data);
};

type CallArgs = {
  id: number;
  data: any;
};
export const callFunction = async ({ id, data }: CallArgs) => {
  return sdk
    .post(`/api/playground/projects/${sdk.project}/functions/${id}/call`, {
      data: data || {},
    })
    .then(response => response?.data);
};

type GetResponseArgs = {
  id: number;
  callId: number;
};
export const getResponse = async (
  _: QueryKey,
  { id, callId }: GetResponseArgs
) => {
  return sdk
    .get(
      `/api/playground/projects/${sdk.project}/functions/${id}/calls/${callId}/response`
    )
    .then(response => response?.data);
};

export const getLogs = async (_: QueryKey, { id, callId }: GetResponseArgs) => {
  return sdk
    .get(
      `/api/playground/projects/${sdk.project}/functions/${id}/calls/${callId}/logs`
    )
    .then(response => response?.data);
};

export const deleteFunction = ({ id }: { id: number }) =>
  sdk
    .post(`/api/playground/projects/${sdk.project}/functions/delete`, {
      data: { items: [{ id }] },
    })
    .then(response => response?.data);

export const createSchedule = (schedule: CreateSchedule ) =>
  sdk
    .post(`/api/playground/projects/${sdk.project}/functions/schedules`, {
      data: { items: [schedule] },
    })
    .then(response => response?.data);

export const deleteSchedule = (id: number ) =>
  sdk
    .post(`/api/playground/projects/${sdk.project}/functions/schedules/delete`, {
      data: { items: [{id}] },
    })
    .then(response => response?.data);
