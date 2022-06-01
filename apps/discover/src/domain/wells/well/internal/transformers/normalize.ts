import { Well } from 'domain/wells/well/internal/types';
import { normalize as normalizeWellbore } from 'domain/wells/wellbore/internal/transformers/normalize';

import { getWellName } from 'dataLayers/wells/wells/selectors/getWellName';

import { Well as WellV3 } from '@cognite/sdk-wells-v3';

import { normalizeCoords } from '../transformers/normalizeCoords';

export const normalize = (well: WellV3): Well => {
  const sources = well.sources.map((source) => {
    return source.sourceName;
  });

  return {
    ...well,
    id: well.matchingId,
    name: getWellName(well),

    ...normalizeCoords(well.wellhead.x, well.wellhead.y, well.wellhead.crs),
    wellhead: {
      id: 0,
      ...well.wellhead,
    },

    sources,
    sourceList: sources ? sources.join(', ') : '',

    spudDate: well.spudDate ? new Date(well.spudDate) : undefined,
    wellbores: well.wellbores?.map((wellbore) =>
      normalizeWellbore(wellbore, well)
    ),
    sourceAssets: () => Promise.resolve([]),
  };
};

export const normalizeWells = (wells: WellV3[]): Well[] => wells.map(normalize);
