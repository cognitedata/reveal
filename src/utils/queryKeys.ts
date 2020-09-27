import { QueryKey } from 'react-query';

type Args = {
  id?: number;
  callId: number;
};
export function fnCallsKey({ id, callId }: Args): QueryKey {
  return ['/function/calls', { id, callId }];
}
export function fnLogsKey({ id, callId }: Args): QueryKey {
  return ['/function/logs', { id, callId }];
}
