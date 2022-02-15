import { Geometry } from '@cognite/seismic-sdk-js';

import { DocumentsFacets } from '../../modules/documentSearch/types';
import { SAVED_SEARCHES_CURRENT_KEY } from '../savedSearches/constants';
import { SavedSearchContent } from '../savedSearches/types';

export const documentFacetsStructure: DocumentsFacets = {
  filetype: [],
  labels: [],
  location: [],
  lastmodified: [],
  lastcreated: [],
  pageCount: [],
};

export const documentFacetsPayload = (
  query: any,
  payload: DocumentsFacets,
  geometry: Geometry,
  namespace: string = SAVED_SEARCHES_CURRENT_KEY
) => ({
  values: documentValuesPayload(query, payload, geometry),
  name: namespace,
});

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
