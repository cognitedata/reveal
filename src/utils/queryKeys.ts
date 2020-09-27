import { QueryKey } from 'react-query';

type Args = {
  id?: number;
  callId: number;
};
export function callsKey({ id, callId }: Args): QueryKey {
  return ['/function/calls', { id, callId }];
}
export function logsKey({ id, callId }: Args): QueryKey {
  return ['/function/logs', { id, callId }];
}
export function responseKey({ id, callId }: Args): QueryKey {
  return ['/function/call/response', { id, callId }]
}
