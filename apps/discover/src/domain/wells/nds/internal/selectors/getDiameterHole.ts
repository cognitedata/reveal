import { toFixedNumber } from 'utils/number';

import { CogniteEventV3ish } from 'modules/wellSearch/types';

export const getDiameterHole = (event: CogniteEventV3ish) => {
  const diameterHole = event.metadata?.diameter_hole;

  if (diameterHole === undefined) {
    return undefined;
  }

  return toFixedNumber(diameterHole);
};
