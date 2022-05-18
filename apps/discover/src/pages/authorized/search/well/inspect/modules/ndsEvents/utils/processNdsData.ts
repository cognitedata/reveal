import { NdsDataLayer } from 'domain/wells/dataLayer/nds/types';
import { TrueVerticalDepthsDataLayer } from 'domain/wells/dataLayer/trajectory/types';
import { WellboreDataLayer } from 'domain/wells/dataLayer/wellbore/types';

import { NdsView } from '../types';

import { processNdsTvdData } from './processNdsTvdData';

export const processNdsData = (
  nds: NdsDataLayer,
  wellbore: WellboreDataLayer,
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
