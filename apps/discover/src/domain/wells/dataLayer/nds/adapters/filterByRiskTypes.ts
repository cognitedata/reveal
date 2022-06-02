import { toBooleanMap } from 'utils/booleanMap';

import { NdsDataLayer } from '../types';

export const filterByRiskTypes = <T extends Pick<NdsDataLayer, 'riskType'>>(
  items: T[],
  riskTypes: string[]
): T[] => {
  const riskTypesMap = toBooleanMap(riskTypes);

  return items.filter((item) => {
    const { riskType } = item;

    if (!riskType) {
      return false;
    }
    return Boolean(riskTypesMap[riskType]);
  });
};
