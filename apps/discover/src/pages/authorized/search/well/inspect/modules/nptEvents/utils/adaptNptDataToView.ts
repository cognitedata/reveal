import { NptInternal } from 'domain/wells/npt/internal/types';
import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import keyBy from 'lodash/keyBy';

import { NptView } from '../types';

type WellboreType = Pick<WellboreInternal, 'matchingId' | 'name' | 'wellName'>;

export const adaptNptDataToView = <T extends WellboreType>(
  wellbores: T[],
  nptEvents: NptInternal[]
): NptView[] => {
  const keyedWellbores = keyBy(wellbores, 'matchingId');

  return nptEvents.map((event) => {
    const wellbore = keyedWellbores[event.wellboreMatchingId];

    return {
      ...event,
      wellName: wellbore.wellName || 'Unknown',
      wellboreName: wellbore.name,
    };
  });
};
