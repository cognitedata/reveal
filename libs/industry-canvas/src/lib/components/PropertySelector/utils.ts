import { uniqBy } from 'lodash';

import { PropertiesList, Property } from './types';

const countOccurrencesByPropertyPath = (
  propertiesList: PropertiesList
): Record<string, number> =>
  propertiesList.reduce<Record<string, number>>((acc, properties) => {
    properties.forEach((property) => {
      if (acc[property.path] !== undefined) {
        acc[property.path] += 1;
        return acc;
      }
      acc[property.path] = 1;
      return acc;
    });
    return acc;
  }, {});

const filterPropertiesByDistinctness =
  (shouldBeDistinct: boolean) =>
  (propertiesList: PropertiesList): Property[] => {
    const numLists = propertiesList.length;
    const occurrencesByPropertyName =
      countOccurrencesByPropertyPath(propertiesList);

    return uniqBy(propertiesList.flat(), (property) =>
      property.path.toLowerCase()
    ).filter(
      (property) =>
        // The reason this check is >= and < is because the property might be present in more than one list
        // for instance the description is a base property on an asset, but can also be present in metadata
        (!shouldBeDistinct &&
          occurrencesByPropertyName[property.path] >= numLists) ||
        (shouldBeDistinct &&
          occurrencesByPropertyName[property.path] < numLists)
    );
  };

export const filterCommonProperties = filterPropertiesByDistinctness(false);

export const filterDistinctProperties = filterPropertiesByDistinctness(true);

export const getLastPartOfPropertyPath = (propertyPath: string): string => {
  const parts = propertyPath.split('.');
  return parts[parts.length - 1];
};

export const reorder = <T>(
  list: T[],
  startIndex: number,
  endIndex: number
): T[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};
