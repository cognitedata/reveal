import {
  NptAggregateRowInternal,
  NptAggregateView,
} from 'domain/wells/npt/internal/types';
import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import keyBy from 'lodash/keyBy';

type WellboreType = Pick<WellboreInternal, 'matchingId' | 'name' | 'wellName'>;

export const adaptNptAggregatesDataToView = <T extends WellboreType>(
  wellbores: T[],
  nptAggregates: NptAggregateRowInternal[]
): NptAggregateView[] => {
  const keyedWellbores = keyBy(wellbores, 'matchingId');

  return nptAggregates.map((event) => {
    const wellbore = keyedWellbores[event.wellboreMatchingId];

    return {
      ...event,
      wellName: wellbore.wellName || 'Unknown',
      wellboreName: wellbore.name,
    };
  });
};
