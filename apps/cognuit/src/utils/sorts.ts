import { TableProps } from '@cognite/cogs.js';
import indexOf from 'lodash/indexOf';
import sortBy from 'lodash/sortBy';

export const sortColumnsByRules = <T extends { id: number }>(
  data: TableProps<T>['columns'],
  orderRules: string[]
) => {
  return sortBy(data, (obj) => {
    const index = indexOf(orderRules, `${obj.accessor}`);

    if (index === -1) {
      return indexOf(orderRules, '*');
    }

    return indexOf(orderRules, `${obj.accessor}`);
  });
};
