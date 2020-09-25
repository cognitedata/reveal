import { Function, Call } from 'types';
import { QueryCache } from 'react-query';

export const recentlyCreated = (a: Function, b: Function) => {
  if (a.createdTime > b.createdTime) {
    return -1;
  }
  if (a.createdTime < b.createdTime) {
    return 1;
  }
  return 0;
};
export const sortLastCall = (cache: QueryCache) => (
  a: Function,
  b: Function
) => {
  const callsA = cache.getQueryData<{ items: Call[] }>([
    `/functions/calls`,
    { id: a.id },
  ]);
  const callsB = cache.getQueryData<{ items: Call[] }>([
    `/functions/calls`,
    { id: b.id },
  ]);
  if (!callsA || !callsB) {
    return 0;
  }
  const latestACallTime = callsA?.items?.reduce(
    (prev, el) => (el.startTime > prev ? el.startTime : prev),
    new Date(0)
  );
  const latestBCallTime = callsB?.items.reduce(
    (prev, el) => (el.startTime > prev ? el.startTime : prev),
    new Date(0)
  );
  if (latestACallTime > latestBCallTime) {
    return -1;
  }
  if (latestACallTime < latestBCallTime) {
    return 1;
  }
  return 0;
};
