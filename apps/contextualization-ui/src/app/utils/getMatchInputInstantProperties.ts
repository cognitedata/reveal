import { InternalModelInstance, MatchedInstance } from '../types';

export const getMatchInputInstantProperties = (
  matchInputInstances: InternalModelInstance[],
  matchedInstance?: MatchedInstance
) => {
  if (!matchedInstance) {
    return {};
  }

  const foundMatchInputInstance = matchInputInstances.find(
    (matchInputInstance) =>
      matchInputInstance.externalId === matchedInstance.value
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
