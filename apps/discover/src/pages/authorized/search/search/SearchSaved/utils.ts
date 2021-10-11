import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import join from 'lodash/join';
import reduce from 'lodash/reduce';

import { GeoJson } from '@cognite/seismic-sdk-js';

import { FormattedFacet } from 'modules/documentSearch/types';
import { FilterValues } from 'modules/wellSearch/types';

import {
  FILTER_END_MARKER,
  FILTER_SEPERATTOR,
  NO_FILTERS,
  GEO_FILTER_ENABLED,
} from './constants';

/**
 * Transform document facet list to `Field: Value1, Value1` format
 */
export const formatFacetsToStringLabels = (facets: FormattedFacet[]) => {
  return Object.entries(groupBy(facets, 'facetNameDisplayFormat')).map(
    ([facet, formattedFacets]) => {
      return `${facet}: ${join(
        formattedFacets.map(
          (formattedFacet) => formattedFacet.facetValueDisplayFormat
        ),
        FILTER_SEPERATTOR
      )}${formattedFacets.length > 1 ? FILTER_END_MARKER : ''}`;
    }
  );
};

/**
 * Transform well facet list to `Field: Value1, Value1` format
 */
export const formatWellFiltersToStringLabels = (
  filterValues: FilterValues[]
) => {
  return Object.entries(groupBy(filterValues, 'field')).map(
    ([field, filterValueList]) =>
      `${field}: ${join(
        filterValueList.map((filterValue) => filterValue.displayName),
        FILTER_SEPERATTOR
      )}${filterValueList.length > 1 ? FILTER_END_MARKER : ''}`
  );
};

export const elipsisFilters = (filters: string[], elipsesBy: number) => {
  let filtersCouldNotFit = 0;
  const filtersFitIn = reduce(filters, (result, current) => {
    if (result.length + current.length + 1 < elipsesBy) {
      return `${result} ${current}`;
    }
    filtersCouldNotFit += 1;
    return result;
  });
  return filtersCouldNotFit > 0
    ? `${filtersFitIn} +${filtersCouldNotFit}`
    : filtersFitIn;
};

export const formatAllFiltersToAString = (
  documentFacets: FormattedFacet[],
  wellFilters: FilterValues[],
  geoJson: GeoJson[],
  elipsisLimit?: number
) => {
  const allFilters = [
    ...formatFacetsToStringLabels(documentFacets),
    ...formatWellFiltersToStringLabels(wellFilters),
  ];
  if (!isEmpty(geoJson)) {
    allFilters.push(GEO_FILTER_ENABLED);
  }
  return !isEmpty(allFilters)
    ? elipsisFilters(allFilters, elipsisLimit || 50)
    : NO_FILTERS;
};
