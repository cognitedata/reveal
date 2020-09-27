import { QueryKey } from 'react-query';
import { GetCallArgs } from 'types';

type CallsArg = Omit<GetCallArgs, 'callId'>;
export function callsKey(args: CallsArg | CallsArg[]): QueryKey {
  return ['/function/allCalls', args];
}
export function callKey(args: GetCallArgs): QueryKey {
  return ['/function/call', args];
}
export function logsKey(args: GetCallArgs): QueryKey {
  return ['/function/logs', args];
}
export function responseKey(args: GetCallArgs): QueryKey {
  return ['/function/call/response', args];
}
export function filesKey(args: CallsArg) {
  return ['/files', args.id];
}
export const sortFunctionKey = '/functions/calls-for-sorting';
