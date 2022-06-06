import { filterWellInspectNdsData } from 'domain/wells/dataLayer/nds/adapters/filterWellInspectNdsData';

import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';
import pickBy from 'lodash/pickBy';

import { AppliedFilters, NdsView } from '../types';

export const getFilteredNdsData = (
  data: NdsView[],
  appliedFilters: AppliedFilters
) => {
  const { riskType, severity, probability } = appliedFilters;

  return filterWellInspectNdsData(data, {
    riskType: Object.keys(riskType),
    subtype: getSubtypesFilter(riskType),
    severity,
    probability,
  });
};

/**
 * Sometimes there could be risk types without any subtype.
 * In such cases, the subtype filter value should be undefined.
 * Otherwise the filter will be activated for subtype,
 * and result an empty array always (just like all options are de-selected)
 */
const getSubtypesFilter = (riskType: Record<string, string[]>) => {
  const riskTypesWithSubtypes = pickBy(
    riskType,
    (subtypes) => !isEmpty(subtypes)
  );
  const subtypes = flatten(Object.values(riskTypesWithSubtypes));

  if (isEmpty(subtypes)) {
    return undefined;
  }

  return subtypes;
};
