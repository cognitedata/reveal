import { CogFunction, Call } from 'types';

export const recentlyCreated = (a: CogFunction, b: CogFunction) => {
  if (a.createdTime > b.createdTime) {
    return -1;
  }
  if (a.createdTime < b.createdTime) {
    return 1;
  }
  return 0;
};
export const sortLastCall = (calls: { [id: number]: Call[] }) => (
  a: CogFunction,
  b: CogFunction
) => {
  const callsA = calls[a.id];
  const callsB = calls[b.id];
  if (!callsA || !callsB) {
    return 0;
  }
  const latestACallTime = callsA?.reduce(
    (prev, el) => (el.startTime > prev ? el.startTime : prev),
    new Date(0)
  );
  const latestBCallTime = callsB?.reduce(
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
