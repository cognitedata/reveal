import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';

import { NdsInternal } from '../types';

export const groupByRiskType = <T extends Pick<NdsInternal, 'riskType'>>(
  items: T[]
): Record<string, T[]> => {
  const itemsWithRiskType = items.filter((item) => item.riskType);
  const itemsWithoutRiskType = items.filter((item) => !item.riskType);

  const knownGroups = groupBy(itemsWithRiskType, 'riskType');

  const unknownGroup = isEmpty(itemsWithoutRiskType)
    ? ({} as Record<string, T[]>)
    : { Unknown: itemsWithoutRiskType };

  return {
    ...knownGroups,
    ...unknownGroup,
  };
};
