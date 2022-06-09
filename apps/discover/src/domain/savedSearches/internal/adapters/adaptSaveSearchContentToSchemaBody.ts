import { SavedSearchSchemaBody } from '@cognite/discover-api-types';

import { SavedSearchState } from '../../types';

/**
 * The types `geoJson` and `filters` should not be casted.
 * This is a tempory solution to prevent TS issues.
 * This will not break the current behavior. Just to use the discover-api-types in the mutations. [PP-2399]
 */
export const adaptSaveSearchContentToSchemaBody = (
  savedSearchContent: SavedSearchState
): SavedSearchSchemaBody => {
  return {
    query: savedSearchContent.query || '',
    sortBy: savedSearchContent.sortBy,
    geoJson:
      savedSearchContent.geoJson as unknown as SavedSearchSchemaBody['geoJson'],
    filters:
      savedSearchContent.filters as unknown as SavedSearchSchemaBody['filters'],
  };
};
