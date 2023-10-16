import isEmpty from 'lodash/isEmpty';

import { ResourceItem, ResourceType } from '@data-exploration-lib/core';

import { ResourceSelection } from '../ResourceSelector';

export const extractResourcesFromSelection = (
  selection: ResourceSelection
): ResourceItem[] => {
  return Object.entries(selection)
    .filter(([_, value]) => !isEmpty(value))
    .reduce((acc, item) => {
      acc.push(
        ...Object.values(item[1]).map((value) => ({
          ...value,
          type: item[0] as ResourceType,
        }))
      );
      return acc;
    }, [] as ResourceItem[]);
};
