import groupBy from 'lodash/groupBy';

import { getWellSDKClient } from 'modules/wellSearch/sdk';
import { Wellbore } from 'modules/wellSearch/types';

export async function getWellboresByWellIds(
  wellIds: number[]
): Promise<Wellbore[]> {
  return getWellSDKClient()
    .wellbores.getFromWells(wellIds)
    .then((response) => response as Wellbore[]);
}

export async function getGroupedWellboresByWellIds(wellIds: number[]) {
  return getWellboresByWellIds(wellIds).then((wellbores) =>
    wellIds.reduce(
      (prev, current) => (prev[current] ? prev : { ...prev, [current]: [] }),
      groupBy(wellbores, 'wellId')
    )
  );
}
