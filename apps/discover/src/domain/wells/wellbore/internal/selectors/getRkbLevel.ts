import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

const KB_REFERENCE_IDENTIFIER = 'KB';

export const getRkbLevel = (
  wellbore: WellboreInternal
): WellboreInternal['datum'] => {
  const { datum } = wellbore;

  if (!datum || datum.reference !== KB_REFERENCE_IDENTIFIER) {
    return undefined;
  }

  return datum;
};
