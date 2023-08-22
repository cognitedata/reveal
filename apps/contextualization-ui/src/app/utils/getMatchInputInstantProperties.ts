import { InternalModelInstance } from '../types';

export const getMatchInputInstantProperties = (
  linkedExternalId: string | undefined,
  matchInputInstances: InternalModelInstance[]
) => {
  if (!linkedExternalId) {
    return {};
  }

  const foundMatchInputInstance = matchInputInstances.find(
    (matchInputInstance) => matchInputInstance.externalId === linkedExternalId
  );

  if (!foundMatchInputInstance) {
    return {};
  }

  const { externalId: _, ...matchInputInstanceProperties } =
    foundMatchInputInstance;

  const suffixedProperties = Object.keys(matchInputInstanceProperties).reduce(
    (result: Record<string, any>, key) => {
      const suffixedKey = 'Linked ' + key;
      result[suffixedKey] = matchInputInstanceProperties[key];
      return result;
    },
    {}
  );

  return suffixedProperties;
};
