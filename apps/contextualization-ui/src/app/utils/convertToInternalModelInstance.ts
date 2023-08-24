import { ModelInstance, InternalModelInstance, ObjectProperty } from '../types';

export const convertToInternalModelInstance = (
  data: ModelInstance[],
  space: string,
  type: string,
  version: string
): InternalModelInstance[] => {
  return data?.reduce((acc: InternalModelInstance[], item: ModelInstance) => {
    const { externalId, properties } = item;

    const instantsProperties = properties[space][`${type}/${version}`];

    Object.keys(instantsProperties).forEach((key: string) => {
      if (
        typeof instantsProperties[key] === 'object' &&
        instantsProperties[key] !== null
      ) {
        const nestedObj = instantsProperties[key] as ObjectProperty;
        instantsProperties[key] = nestedObj.externalId;
      }
    });

    acc.push({ externalId, ...instantsProperties });
    return acc;
  }, []);
};
