import { Function } from 'types';

export const recentlyCreated = (a: Function, b: Function) => {
  if (a.createdTime > b.createdTime) {
    return -1;
  }
  if (a.createdTime < b.createdTime) {
    return 1;
  }
  return 0;
};
export const sortLastCall = (a: Function, b: Function) => {
  const callsA = a.calls;
  const callsB = b.calls;
  if (!callsA || !callsB) {
    return 0;
  }
  const latestACallTime = callsA.reduce(
    (prev, el) => (el.startTime > prev ? el.startTime : prev),
    new Date(0)
  );
  const latestBCallTime = callsB.reduce(
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
