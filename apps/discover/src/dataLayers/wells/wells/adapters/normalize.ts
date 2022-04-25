import { normalizeCoords } from 'services/wellSearch/utils/normalizeCoords';

import { Well as WellV3 } from '@cognite/sdk-wells-v3';

import { mapV3ToV2Wellbore } from 'modules/wellSearch/sdk/utils';
import { Well } from 'modules/wellSearch/types';

import { getWellName } from '../selectors/getWellName';

export const normalize = (well: WellV3): Well => {
  return {
    ...well,
    id: well.matchingId,
    name: getWellName(well),

    ...normalizeCoords(well.wellhead.x, well.wellhead.y, well.wellhead.crs),
    wellhead: {
      id: 0,
      ...well.wellhead,
    },

    sources: well.sources.map((source) => source.sourceName),
    spudDate: new Date(well.spudDate || ''),
    wellbores: well.wellbores?.map(mapV3ToV2Wellbore) || [],
    sourceAssets: () => Promise.resolve([]),
  };
};

export const normalizeV3Well = (rawAPIWell: Well): Well => {
  return {
    ...rawAPIWell,
  };
};
