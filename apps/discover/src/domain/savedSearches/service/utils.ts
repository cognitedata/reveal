import { SAVED_SEARCHES_CURRENT_KEY } from 'domain/savedSearches/constants';

import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { handleServiceError } from 'utils/errors';
import { FetchHeaders } from 'utils/fetch';

import { Geometry, GeoJson } from '@cognite/seismic-sdk-js';

import { adaptSaveSearchContentToSchemaBody } from '../internal/adapters/adaptSaveSearchContentToSchemaBody';
import { getEmptyFilters } from '../internal/transformers/getEmptyFilters';
import { normalizeSavedSearch } from '../internal/transformers/normalizeSavedSearch';
import {
  SavedSearchContent,
  SavedSearchQuery,
  SavedSearchState,
} from '../types';

import { createSavedSearch } from './network/createSavedSearch';

/**
 * Update the 'current' search with some new fields
 *
 * @param currentSavedSearch - current saved searched
 * @param savedSearchPatchContent - updated saved search
 * @param headers - json headers for xhr call
 * @param waitForResponse - Wait until the search saved
 * @param tenant - project for the xhr call
 */
export const updateCurrentSearch = async (
  currentSavedSearch: SavedSearchState,
  savedSearchPatchContent: SavedSearchQuery | SavedSearchContent,
  waitForResponse: boolean,
  headers: FetchHeaders,
  tenant: string
) => {
  // normalize and join the new and teh old searches
  const savingResponse = normalizeSavedSearch(
    combineOldAndNew(currentSavedSearch, savedSearchPatchContent)
  );
  // console.log('After normalize:', savingResponse);

  const savedSearchSchemaBody =
    adaptSaveSearchContentToSchemaBody(savingResponse);

  if (!waitForResponse) {
    createSavedSearch(
      SAVED_SEARCHES_CURRENT_KEY,
      savedSearchSchemaBody,
      headers,
      tenant
    ).catch(handleServiceError);
    return { ...savingResponse, updated_at: new Date().getTime() };
  }

  return createSavedSearch(
    SAVED_SEARCHES_CURRENT_KEY,
    savedSearchSchemaBody,
    headers,
    tenant
  );
};

export const combineOldAndNew = (
  oldContent: SavedSearchState,
  newContent: SavedSearchQuery | Partial<SavedSearchState>
) => {
  // eslint-disable-next-line no-debugger
  // debugger;

  // special case for cleaning the nested object
  if (newContent.filters !== undefined) {
    if (isEmpty(newContent.filters)) {
      return {
        ...oldContent,
        ...newContent,
        filters: getEmptyFilters(),
      };
    }
  }

  const filters = {
    ...get(oldContent, 'filters', {}),
    ...get(newContent, 'filters', {}),
  };

  return {
    ...oldContent,
    ...newContent,
    filters, // this is the filter from both merged together (thus after both spreads)
  };
};

export const convertGeoJsonToGeometry = (geoJson: GeoJson): Geometry => {
  return geoJson.geometry;
};
