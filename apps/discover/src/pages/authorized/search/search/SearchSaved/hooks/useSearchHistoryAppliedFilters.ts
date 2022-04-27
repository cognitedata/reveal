import isEmpty from 'lodash/isEmpty';
import { useFormatDocumentFilters } from 'services/documents/hooks/useFormatDocumentFilters';
import { DocumentFormatFilter } from 'services/documents/types';
import { SavedSearchContent } from 'services/savedSearches';

import { AppliedFilterEntries } from 'modules/sidebar/types';
import { useFormatWellFilters } from 'modules/wellSearch/hooks/useAppliedFilters';
import { WellFilterMap, WellFormatFilter } from 'modules/wellSearch/types';

import { GEO_FILTER_ENABLED } from '../constants';
import { SearchHistoryFilter } from '../types';
import { formatFiltersToString } from '../utils';

const getDocuments = (
  savedSearch: SavedSearchContent,
  formattedDocumentFilters: (
    entries: AppliedFilterEntries[]
  ) => DocumentFormatFilter
) => {
  const documentFacets = formattedDocumentFilters(
    Object.entries(
      savedSearch.filters?.documents?.facets || []
    ) as AppliedFilterEntries[]
  );

  return formatFiltersToString(documentFacets);
};

const getWells = (
  savedSearch: SavedSearchContent,
  formattedWellFilters: (entries: WellFilterMap) => WellFormatFilter
) => {
  const wellFilters = formattedWellFilters(savedSearch.filters?.wells || {});

  return formatFiltersToString(wellFilters);
};

const getGeoJson = (savedSearch: SavedSearchContent) => {
  if (isEmpty(savedSearch.geoJson)) {
    return [];
  }

  return [GEO_FILTER_ENABLED];
};

export const useSearchHistoryAppliedFilters = () => {
  const formattedDocumentFilters = useFormatDocumentFilters();
  const formattedWellFilters = useFormatWellFilters();

  return (savedSearch: SavedSearchContent) => {
    const documents = getDocuments(savedSearch, formattedDocumentFilters);
    const wells = getWells(savedSearch, formattedWellFilters);
    const geoJson = getGeoJson(savedSearch);

    const filters = { documents, wells, geoJson };

    return (Object.keys(filters) as SearchHistoryFilter['label'][]).reduce(
      (accumulator, filter) => {
        const appliedFilters = filters[filter];

        if (appliedFilters === undefined) {
          return accumulator;
        }

        return {
          filters: [
            ...accumulator.filters,
            { label: filter, values: appliedFilters },
          ],
          count: accumulator.count + appliedFilters.length,
        };
      },
      { filters: [], count: 0 } as {
        filters: SearchHistoryFilter[];
        count: number;
      }
    );
  };
};
