import {
  SavedSearchSortBy,
  SearchHistoryResponse,
} from '@cognite/discover-api-types';
import { DocumentsFilter } from '@cognite/sdk-playground';
import { GeoJson } from '@cognite/seismic-sdk-js';

import { DocumentsFacets } from '../../modules/documentSearch/types';
import { SharedWithData } from '../../modules/favorite/types';
import { MapLayerGeoJsonFilter } from '../../modules/sidebar/types';
import { BasicUserInfo } from '../../modules/user/types';
import { WellFilterMap } from '../../modules/wellSearch/types';

// rename to SavedSearch
export interface SavedSearchItem {
  value: SavedSearchContent;
  name: string;
  owner?: BasicUserInfo;
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
  owner?: BasicUserInfo;
  sharedWith?: SharedWithData[];
}

export interface SearchOptionFilters {
  documents?: {
    facets: DocumentsFacets;
    extraDocumentFilters?: DocumentsFilter;
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
