import { removeFirstAndlastCharactors } from './string';

export const serializePayload = (payload: unknown) => {
  return JSON.stringify(payload);
};

export const serializeTargetPayload = (payload: unknown) => {
  const serializedPayload = serializePayload(payload);
  return removeFirstAndlastCharactors(serializedPayload);
};
