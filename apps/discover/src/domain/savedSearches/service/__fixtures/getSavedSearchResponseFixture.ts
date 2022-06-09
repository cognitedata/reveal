import { SavedSearchResponse } from '@cognite/discover-api-types';

import { getSavedSearchContentFixture } from './getSavedSearchContentFixture';

/*
 * Discover API TEST utils
 *
 *
 */
export const getSavedSearchResponseFixture = (
  extras: Partial<SavedSearchResponse> = {}
): SavedSearchResponse => {
  const response = getSavedSearchContentFixture();

  return {
    ...response,
    id: response.id || '',
    query: response.query || '',
    geoJson: [],
    createdTime: '',
    lastUpdatedTime: '',
    ...extras,
  };
};
