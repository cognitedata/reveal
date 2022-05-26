import { Geometry } from '@cognite/seismic-sdk-js';

import { DocumentsFacets } from '../../../modules/documentSearch/types';
import { SavedSearchContent } from '../../../services/savedSearches/types';

export const documentValuesPayload = (
  query: any,
  payload: DocumentsFacets,
  geometry: Geometry
): SavedSearchContent => ({
  filters: {
    documents: {
      facets: payload,
    },
  },
  query,
  geoJson: [{ geometry }],
});
