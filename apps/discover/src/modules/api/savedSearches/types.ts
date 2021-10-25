import { GeoJson } from '@cognite/seismic-sdk-js';

import { SortBy } from '../../../pages/types';
import { DocumentsFacets } from '../../documentSearch/types';
import { SharedWithData } from '../../favorite/types';
import { BasicUserInfo } from '../../user/types';
import { WellFilterMap } from '../../wellSearch/types';

// rename to SavedSearch
export interface SavedSearchItem {
  value: SavedSearchContent;
  name: string;
  owner?: BasicUserInfo;
  id?: string;
}

export interface SavedSearchContent {
  name?: string;
  id?: string;
  query?: string;
  filters: SearchOptionFilters;
  sortBy?: SearchOptionSortBy;
  geoJson?: GeoJson[]; // this is the new field we should move to
  createdTime?: string;
  owner?: BasicUserInfo;
  sharedWith?: SharedWithData[];
}

export interface SearchOptionFilters {
  documents?: {
    facets: DocumentsFacets;
  };
  wells?: WellFilterMap;
}

export interface SearchOptionSortBy {
  documents?: SortBy[];
}

// we should not be introducing new types, this stuff already exists
// let's work on removing this:
export interface SavedSearchQuery {
  phrase?: string;
  geoFilter?: GeoJson[];
  filters?: SearchOptionFilters;
  sortBy?: SearchOptionSortBy;
}
