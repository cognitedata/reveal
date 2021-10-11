import { QueryClient } from 'react-query';
import { useDispatch } from 'react-redux';

import isUndefined from 'lodash/isUndefined';

import { FetchHeaders } from '_helpers/fetch';
import { convertGeometryToGeoJson } from 'modules/api/savedSearches/normalizeSavedSearch';
import { SavedSearchContent } from 'modules/api/savedSearches/types';
import { setGeo } from 'modules/map/actions';
import { showResults, startSearching } from 'modules/search/actions';
import { setSearchPhrase } from 'modules/sidebar/actions';

import { useDocumentSearch } from './useDocumentSearch';
import { useSeismicSearch } from './useSeismicSearch';
import { useTenantConfig } from './useTenantConfig';
import { useWellsSearch } from './useWellsSearch';

export const useCommonSearch = () => {
  const dispatch = useDispatch();
  const { data: tenantConfig } = useTenantConfig();

  const doDocumentSearch = useDocumentSearch();
  const doSeismicSearch = useSeismicSearch();
  const doWellsSearch = useWellsSearch();

  const doCommonSearch = (
    searchQuery: Partial<SavedSearchContent>,
    queryClient: QueryClient,
    headers?: FetchHeaders
  ) => {
    dispatch(startSearching());
    // console.log('SearchQuery:', searchQuery);

    // we use the deprecated searchQuery.geometry here, till it's fully removed
    // @ts-expect-error hack for the deprecated field
    if (searchQuery.geometry) {
      // @ts-expect-error hack for the deprecated field
      // eslint-disable-next-line no-param-reassign
      searchQuery.geoJson = [convertGeometryToGeoJson(searchQuery.geometry)];
    }

    if (searchQuery.geoJson) {
      dispatch(setGeo(searchQuery.geoJson, true));
    }

    dispatch(showResults());

    /**
     * Preserve search phrase into state
     * If search phrase has not updated, should not change existing search phrase.
     */
    if (!isUndefined(searchQuery.query)) {
      dispatch(setSearchPhrase(searchQuery.query));
    }

    if (tenantConfig && !tenantConfig.documents?.disabled) {
      doDocumentSearch(searchQuery);
    }

    if (tenantConfig && !tenantConfig.wells?.disabled) {
      doWellsSearch(searchQuery);
    }

    if (tenantConfig && !tenantConfig.seismic?.disabled && headers) {
      doSeismicSearch(searchQuery, headers, queryClient);
    }
  };

  return doCommonSearch;
};
