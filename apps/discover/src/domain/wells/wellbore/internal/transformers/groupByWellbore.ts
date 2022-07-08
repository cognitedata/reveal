import groupBy from 'lodash/groupBy';

import { Wellbore } from '@cognite/sdk-wells';

export const groupByWellbore = <T extends { wellboreMatchingId: string }>(
  items: T[]
): Record<Wellbore['matchingId'], T[]> => groupBy(items, 'wellboreMatchingId');
