import { NdsInternal } from 'domain/wells/nds/internal/types';
import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import { NdsView } from '../types';

export const processNdsData = (
  nds: NdsInternal,
  wellbore: WellboreInternal
): NdsView => {
  return {
    ...nds,
    wellName: wellbore.wellName,
    wellboreName: wellbore.name,
  };
};
