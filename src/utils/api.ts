import sdk from 'sdk-singleton';
import { QueryKey } from 'react-query';

type _GetCallsArgs = { id: number; scheduleId?: number };
type GetCallsArgs = _GetCallsArgs | _GetCallsArgs;

const _getCalls = async (args: _GetCallsArgs) => {
  const { id, scheduleId } = args;
  const filter = args ? { scheduleId } : {};
  return await sdk
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
    const results = await Promise.all(args.map(a => _getCalls(a)));
    return args.reduce(
      (accl, { id }, index) => ({
        ...accl,
        [id]: results[index],
      }),
      {}
    );
  }
  return _getCalls(args);
};

type GetCallArgs = {
  id: number;
  callId: number;
};
export const getCall = async (_: QueryKey, args: GetCallArgs) => {
  const { id, callId } = args;

  return await sdk
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
}
export const getResponse = async (_:QueryKey, { id, callId }: GetResponseArgs) => {
  return sdk
    .get(`/api/playground/projects/${sdk.project}/functions/${id}/calls/${callId}/response`)
    .then(response => response?.data);
};


export const getLogs = async (_:QueryKey, { id, callId }: GetResponseArgs) => {
  return sdk
    .get(`/api/playground/projects/${sdk.project}/functions/${id}/calls/${callId}/logs`)
    .then(response => response?.data);
};
