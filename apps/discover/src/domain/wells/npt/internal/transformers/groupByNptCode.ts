import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';

import { NptInternal } from '../types';

export const groupByNptCode = <T extends Pick<NptInternal, 'nptCode'>>(
  items: T[]
): Record<string, T[]> => {
  const itemsWithNptCode = items.filter((item) => item.nptCode);
  const itemsWithoutNptCode = items.filter((item) => !item.nptCode);

  const knownGroups = groupBy(itemsWithNptCode, 'nptCode');

  const unknownGroup = isEmpty(itemsWithoutNptCode)
    ? ({} as Record<string, T[]>)
    : { Unknown: itemsWithoutNptCode };

  return {
    ...knownGroups,
    ...unknownGroup,
  };
};
