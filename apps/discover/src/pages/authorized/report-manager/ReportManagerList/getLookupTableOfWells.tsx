import { keyByWellboreMatchingId } from 'domain/wells/wellbore/internal/transformers/keyByWellboreMatchingId';
import { getWellboresByWellIds } from 'domain/wells/wellbore/service/network/getWellboresByWellId';

import uniq from 'lodash/uniq';

/*
 * This function is for getting all the names of the wells used in the report list
 *
 *
 */
export const getLookupTableOfWells = async <T extends { externalId: string }[]>(
  data: T
) => {
  const wellbores = uniq(data.map((item) => item.externalId));

  const wellData = await getWellboresByWellIds(wellbores);

  const wellDataById = keyByWellboreMatchingId(wellData);

  return wellDataById;
};
