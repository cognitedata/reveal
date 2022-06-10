import { NdsInternal } from 'domain/wells/nds/internal/types';
import { TrueVerticalDepthsDataLayer } from 'domain/wells/trajectory/internal/types';
import { Wellbore } from 'domain/wells/wellbore/internal/types';

import { NdsView } from '../types';

import { processNdsTvdData } from './processNdsTvdData';

export const processNdsData = (
  nds: NdsInternal,
  wellbore: Wellbore,
  trueVerticalDepths?: TrueVerticalDepthsDataLayer
): NdsView => {
  const tvdData = trueVerticalDepths
    ? processNdsTvdData(nds, trueVerticalDepths)
    : {};

  return {
    ...nds,
    ...tvdData,
    wellName: wellbore.wellName,
    wellboreName: wellbore.name,
  };
};
