import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import { reportException } from '@cognite/react-errors';
import { Geometry, GeoJson } from '@cognite/seismic-sdk-js';

import { FetchHeaders } from '_helpers/fetch';
import { discoverAPI } from 'modules/api/service';

import { SAVED_SEARCHES_CURRENT_KEY } from './constants';
import { normalizeSavedSearch } from './normalizeSavedSearch';
import { SavedSearchContent, SavedSearchQuery } from './types';
import { getEmptyFilters } from './utils/getEmptyFilters';

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
  currentSavedSearch: SavedSearchContent,
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

  if (!waitForResponse) {
    discoverAPI.savedSearches
      .save(savingResponse, SAVED_SEARCHES_CURRENT_KEY, headers, tenant)
      .catch((error) => {
        reportException(error);
      });
    return { ...savingResponse, updated_at: new Date().getTime() };
  }

  return discoverAPI.savedSearches.save(
    savingResponse,
    SAVED_SEARCHES_CURRENT_KEY,
    headers,
    tenant
  );
};

export const combineOldAndNew = (
  oldContent: SavedSearchContent,
  newContent: SavedSearchQuery | Partial<SavedSearchContent>
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

// need to use this for react-query mutate requires only one arg
export const createSavedSearch = ({
  values,
  name,
  headers,
  tenant,
}: {
  values: SavedSearchContent;
  name: string;
  headers: FetchHeaders;
  tenant: string;
}) => {
  try {
    return discoverAPI.savedSearches.save(values, name, headers, tenant);
  } catch (error) {
    reportException(error as string);
    return Promise.reject(error);
  }
};

export const deleteSavedSearch = ({
  id,
  headers,
  tenant,
}: {
  id: string;
  headers: FetchHeaders;
  tenant: string;
}) => {
  return discoverAPI.savedSearches.delete(id, headers, tenant);
};
