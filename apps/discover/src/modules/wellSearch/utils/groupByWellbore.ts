import groupBy from 'lodash/groupBy';
import keyBy from 'lodash/keyBy';

export const WELLBORE_MATCHING_ID_ACCESSOR = 'wellboreMatchingId';

export const groupByWellbore = <T extends { wellboreMatchingId: string }>(
  items: T[]
) => groupBy(items, WELLBORE_MATCHING_ID_ACCESSOR);

export const keyByWellbore = <T extends { wellboreMatchingId: string }>(
  items: T[]
) => keyBy(items, WELLBORE_MATCHING_ID_ACCESSOR);
