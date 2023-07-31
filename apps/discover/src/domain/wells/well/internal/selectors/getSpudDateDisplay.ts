import { WellInternal } from 'domain/wells/well/internal/types';

import { getDateOrDefaultText } from 'utils/date';

export const getSpudDateDisplay = <T extends Pick<WellInternal, 'spudDate'>>(
  well: T
) => {
  return getDateOrDefaultText(well.spudDate);
};
