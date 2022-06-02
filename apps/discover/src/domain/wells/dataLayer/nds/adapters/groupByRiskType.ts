import groupBy from 'lodash/groupBy';

import { NdsDataLayer } from '../types';

export const groupByRiskType = <T extends Pick<NdsDataLayer, 'riskType'>>(
  items: T[]
): Record<string, T[]> => {
  const itemsWithRiskType = items.filter((item) => item.riskType);
  const itemsWithoutRiskType = items.filter((item) => !item.riskType);

  return {
    ...groupBy(itemsWithRiskType, 'riskType'),
    Unknown: itemsWithoutRiskType,
  };
};
