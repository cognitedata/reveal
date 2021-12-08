import get from 'lodash/get';
import isEqual from 'lodash/isEqual';

import { Well } from '@cognite/sdk-wells-v2';

import { Wellbore } from '../types';
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
    /**
     * @sdk-wells-v3
     * If using the Wells SDK V3, set the wellbores included in the wells list response data.
     * Otherwise set to `undefined` since `_wellbores` is not included in the well data object.
     */
    wellbores: get(well, '_wellbores'),
  };
};

export const normalizeWells = (wells: Well[]) => {
  return wells.map(normalizeWell);
};

export const getFilteredWellbores = (
  wellbores: Wellbore[] | undefined,
  wellboreId: string | undefined
): Wellbore[] => {
  return (
    wellbores?.filter((wellbore) => isEqual(wellbore.id, wellboreId)) || []
  );
};
