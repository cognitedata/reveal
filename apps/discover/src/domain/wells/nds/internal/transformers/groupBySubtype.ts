import groupBy from 'lodash/groupBy';

import { NdsInternal } from '../types';

export const groupBySubtype = <T extends Pick<NdsInternal, 'subtype'>>(
  items: T[]
): Record<string, T[]> => {
  const itemsWithSubtype = items.filter((item) => item.subtype);
  const itemsWithoutSubtype = items.filter((item) => !item.subtype);

  return {
    ...groupBy(itemsWithSubtype, 'subtype'),
    Unknown: itemsWithoutSubtype,
  };
};
