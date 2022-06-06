import pickBy from 'lodash/pickBy';
import { BooleanMap, toBooleanMap } from 'utils/booleanMap';

import { NdsDataLayer } from '../types';

type NdsObjectType = Pick<
  NdsDataLayer,
  'riskType' | 'subtype' | 'severity' | 'probability'
>;

type Filter = {
  riskType?: string[];
  subtype?: string[];
  severity?: string[];
  probability?: string[];
};

export const filterWellInspectNdsData = <T extends NdsObjectType>(
  items: T[],
  filter: Filter
): T[] => {
  const filterKeys = Object.keys(pickBy(filter)) as (keyof Filter)[];

  const filterMap = filterKeys.reduce(
    (map, key) => ({
      ...map,
      [key]: toBooleanMap(filter[key] || []),
    }),
    {} as Record<keyof Filter, BooleanMap>
  );

  return items.filter((item) =>
    filterKeys.every((key) => {
      const value = item[key];
      return value && Boolean(filterMap[key][value]);
    })
  );
};
