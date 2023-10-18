import isEmpty from 'lodash/isEmpty';

import {
  ExtendedResourceItem,
  ResourceSelection,
  ResourceType,
} from '@data-exploration-lib/core';

export const mapAllSelectedRows = (
  selectedRows: ResourceSelection,
  extendedProperties?: {
    [id: number]: ExtendedResourceItem;
  }
) => {
  return Object.entries(selectedRows)
    .filter(([_, value]) => !isEmpty(value))
    .reduce((acc, item) => {
      acc.push(
        ...Object.values(item[1]).map((value) => {
          // get metadata resources if exist
          if (extendedProperties && extendedProperties[value.id]) {
            return {
              ...extendedProperties[value.id],
              type: item[0] as ResourceType,
            };
          }
          return {
            ...value,
            type: item[0] as ResourceType,
          };
        })
      );
      return acc;
    }, [] as ExtendedResourceItem[]);
};
