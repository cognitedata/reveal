import { Wellbore } from 'domain/wells/wellbore/internal/types';

import { Survey } from '@cognite/sdk-wells-v2';
import { Well as WellV3, Wellbore as WellboreV3 } from '@cognite/sdk-wells-v3';

export const normalize = (
  rawAPIWellbore: WellboreV3,
  well: WellV3
): Wellbore => {
  return {
    ...rawAPIWellbore,
    id: rawAPIWellbore.matchingId,

    name: rawAPIWellbore.name || rawAPIWellbore.description || '',
    wellName: well.name || well.description || '',

    sourceWellbores: rawAPIWellbore.sources?.map((source) => ({
      id: rawAPIWellbore.matchingId,
      externalId: source.assetExternalId,
      source: source.sourceName,
    })),

    trajectory: () => Promise.resolve({} as Survey),
    casings: () => Promise.resolve([]),
    parentWell: () => Promise.resolve(undefined),
    getWellhead: () => Promise.resolve(undefined),
    sourceAssets: () => Promise.resolve([]),
  };
};
