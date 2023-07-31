import {
  SavedSearchSortBy,
  SearchHistoryResponse,
  UserInfoSummary,
} from '@cognite/discover-api-types';
import { DocumentFilter } from '@cognite/sdk';
import { GeoJson } from '@cognite/seismic-sdk-js';

import { DocumentsFacets } from '../../modules/documentSearch/types';
import { SharedWithData } from '../../modules/favorite/types';
import { MapLayerGeoJsonFilter } from '../../modules/sidebar/types';
import { WellFilterMap } from '../../modules/wellSearch/types';

// rename to SavedSearch
export interface SavedSearchItem {
  value: SavedSearchContent;
  name: string;
  owner?: UserInfoSummary;
  id?: string;
}

export type SavedSearchState = SavedSearchContent | SearchHistoryResponse;

export interface SavedSearchContent {
  name?: string;
  id?: string;
  query?: string;
  filters: SearchOptionFilters;
  sortBy?: SavedSearchSortBy;
  geoJson?: GeoJson[]; // this is the new field we should move to
  createdTime?: string;
  owner?: UserInfoSummary;
  sharedWith?: SharedWithData[];
}

export interface SearchOptionFilters {
  documents?: {
    facets: DocumentsFacets;
    extraDocumentFilters?: DocumentFilter;
  };
  wells?: WellFilterMap;
  extraGeoJsonFilters?: MapLayerGeoJsonFilter[];
}

// we should not be introducing new types, this stuff already exists
// let's work on removing this:
export interface SavedSearchQuery {
  phrase?: string;
  geoFilter?: GeoJson[];
  filters?: SearchOptionFilters;
  sortBy?: SavedSearchSortBy;
}
