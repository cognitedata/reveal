import { Well } from '@cognite/sdk-wells';

import { normalizeCoords } from '../utils';

export const normalizeWell = (well: Well) => {
  return {
    ...well,
    ...(well.wellhead
      ? normalizeCoords(well.wellhead.x, well.wellhead.y, well.wellhead.crs)
      : {}),
    name: well.externalId
      ? `${well.description || well.name} (${well.externalId})`
      : well.name,
    wellbores: undefined,
  };
};

export const normalizeWells = (wells: Well[]) => {
  return wells.map((well) => ({
    ...normalizeWell(well),
  }));
};
