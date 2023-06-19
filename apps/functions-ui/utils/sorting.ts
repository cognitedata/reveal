import { CogFunction, Call } from 'types';

export const recentlyCreated = (a: CogFunction, b: CogFunction) => {
  return b.createdTime - a.createdTime;
};

export const newestCall = (a: Call | undefined, b: Call | undefined) => {
  if (a && b) {
    return b.startTime - a.startTime;
  }
  return 0;
};

export const sortLastCall = (calls: { [id: number]: Call | undefined }) => (
  a: CogFunction,
  b: CogFunction
) => {
  return (calls[b.id]?.startTime || 0) - (calls[a.id]?.startTime || 0);
};
