import { WellboreInternal } from 'domain/wells/wellbore/internal/types';
import { WellTopsInternal } from 'domain/wells/wellTops/internal/types';

import { CasingSchematicView } from '../types';

export const getEmptyCasingSchematicView = (
  wellbore: WellboreInternal,
  wellTop?: WellTopsInternal
): CasingSchematicView => {
  const { wellName, name, matchingId } = wellbore;

  return {
    wellName,
    wellboreName: name,
    wellboreAssetExternalId: '',
    wellboreMatchingId: matchingId,
    casingAssemblies: [],
    source: {
      sourceName: '',
      sequenceExternalId: '',
    },
    phase: '',
    nptEvents: [],
    ndsEvents: [],
    wellTop,
  };
};
