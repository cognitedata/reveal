import { NptInternal, NptView } from 'domain/wells/npt/internal/types';
import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import keyBy from 'lodash/keyBy';
import { toFixedNumberFromNumber } from 'utils/number';

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
      wellName: wellbore?.wellName || 'Unknown',
      wellboreName: wellbore?.name || 'Unknown',
      measuredDepth: event.measuredDepth
        ? {
            ...event.measuredDepth,
            value: toFixedNumberFromNumber(event.measuredDepth?.value),
          }
        : undefined,
    };
  });
};
