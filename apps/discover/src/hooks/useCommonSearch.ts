import { useDocumentSearch } from 'domain/documents/internal/hooks/useDocumentSearch';
import { convertGeometryToGeoJson } from 'domain/savedSearches/internal/transformers/normalizeSavedSearch';
import { SavedSearchContent } from 'domain/savedSearches/types';

import { useDispatch } from 'react-redux';

import isUndefined from 'lodash/isUndefined';
import { FetchHeaders } from 'utils/fetch';

import { setGeo } from 'modules/map/actions';
import { showResults, startSearching } from 'modules/search/actions';
import { setSearchPhrase } from 'modules/sidebar/actions';

import { useProjectConfig } from './useProjectConfig';
import { useSeismicSearch } from './useSeismicSearch';
import { useWellsSearch } from './useWellsSearch';

export type SearchOptions = { hideResult?: boolean };
export const useCommonSearch = ({ hideResult }: SearchOptions = {}) => {
  const dispatch = useDispatch();
  const { data: projectConfig } = useProjectConfig();

  const doDocumentSearch = useDocumentSearch();
  const doSeismicSearch = useSeismicSearch();
  const doWellsSearch = useWellsSearch();

  const doCommonSearch = (
    searchQuery: Partial<SavedSearchContent>,
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

    if (!hideResult) {
      dispatch(showResults());
    }

    /**
     * Preserve search phrase into state
     * If search phrase has not updated, should not change existing search phrase.
     */
    if (!isUndefined(searchQuery.query)) {
      dispatch(setSearchPhrase(searchQuery.query));
    }

    if (projectConfig && !projectConfig.documents?.disabled) {
      doDocumentSearch(searchQuery);
    }

    if (projectConfig && !projectConfig.wells?.disabled) {
      doWellsSearch(searchQuery);
    }

    if (projectConfig && !projectConfig.seismic?.disabled && headers) {
      doSeismicSearch(searchQuery, headers);
    }
  };

  return doCommonSearch;
};
