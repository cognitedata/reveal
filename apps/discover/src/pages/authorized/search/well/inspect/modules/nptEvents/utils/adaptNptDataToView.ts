import { NptInternal } from 'domain/wells/npt/internal/types';
import { Wellbore } from 'domain/wells/wellbore/internal/types';

import keyBy from 'lodash/keyBy';

import { NptView } from '../types';

export const adaptNptDataToView = (
  wellbores: Wellbore[],
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
