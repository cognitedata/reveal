import groupBy from 'lodash/groupBy';

import { extractIdPrefix } from './handleId';

export const getDifferentiableIdPrefixes = (columnExternalIds: string[]) => {
  const groupedIds = groupBy(columnExternalIds, extractIdPrefix);

  return Object.keys(groupedIds).filter((idPrefix) => {
    const columnIds = groupedIds[idPrefix];

    /**
     * It is assumed that the differential external id's ends with LOW and HIGH only.
     * This validation can be extended.
     * But for now, this is enough.
     */
    return columnIds.length >= 2;
  });
};
